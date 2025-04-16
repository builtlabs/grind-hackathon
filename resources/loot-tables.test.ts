import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

interface BlockRNG {
  blockNumber: number;
  hash: string;
  rng: bigint;
}

function loadCsv(filePath: string): bigint[] {
  const data = fs.readFileSync(filePath, "utf8");
  return data
    .split("\n")
    .filter(Boolean)
    .map((line) => BigInt(line.replace(',', '').trim()));
}

// Load block RNG data (precooked rng = BigInt(blockHash) % 1e18)
function loadBlockRNG(filePath: string): BlockRNG[] {
  const json = fs.readFileSync(filePath, "utf8");
  return JSON.parse(json).map((block: any) => ({
    blockNumber: block.blockNumber,
    hash: block.hash,
    rng: BigInt(block.rng),
  }));
}

function randomRNG(): bigint {
  const randomValue = crypto.randomBytes(16).toString("hex");
  const randomBigInt = BigInt("0x" + randomValue);
  const rng = randomBigInt % BigInt(1e18);
  return rng;
};

function simulateGame(rngs: bigint[], thresholds: bigint[]): number {
  let crashed = false;
  let livedFor = 0;
  const maxBlock = thresholds.length;

  while (!crashed && livedFor < maxBlock) {
    if (rngs[livedFor] < thresholds[livedFor]) {
      crashed = true;
    } else {
      livedFor++;
    }
  }

  return livedFor;
}

const curves = {
  v1: ["./loot-tables/v1/thresholds.csv", "./loot-tables/v1/multipliers.csv"],
  v2: ["./loot-tables/v2/thresholds.csv", "./loot-tables/v2/multipliers.csv"],
  v3: ["./loot-tables/v3/thresholds.csv", "./loot-tables/v3/multipliers.csv"],
  v4: ["./loot-tables/v4/thresholds.csv", "./loot-tables/v4/multipliers.csv"],
  v5: ["./loot-tables/v5/thresholds.csv", "./loot-tables/v5/multipliers.csv"],
};

const rngPath = path.join(__dirname, "./block-data.json");
const gameBlocks = loadBlockRNG(rngPath);

Object.entries(curves).forEach(([key, value]) => {
  describe(`Game Simulation — ${key}`, () => {
    const thresholdPath = path.join(__dirname, value[0]);
    const multipliersPath = path.join(__dirname, value[1]);
    const thresholds = loadCsv(thresholdPath);
    const multipliers = loadCsv(multipliersPath);
    const maxBlock = thresholds.length;
    const totalSimulations = Math.floor(gameBlocks.length / maxBlock);

    describe("Using real on-chain block data", () => {
      it("should simulate games", () => {
        const survived = [];

        for (let i = 0; i < totalSimulations; i++) {
          // take a random sample of maxBlock blocks from the 500 blocks available
          const startIndex = Math.floor(Math.random() * (gameBlocks.length - maxBlock));
          const rngs = gameBlocks.slice(startIndex, startIndex + maxBlock).map((block) => block.rng);
          const result = simulateGame(rngs, thresholds);
          survived.push(result);
        }

        const minSurvived = Math.min(...survived);
        const maxSurvived = Math.max(...survived);
        const avgSurvived = survived.reduce((acc, val) => acc + val, 0) / survived.length;

        expect(minSurvived).toBeGreaterThanOrEqual(0);
        expect(maxSurvived).toBeLessThanOrEqual(maxBlock);
        console.log(`[CHAIN] ${key} - Min: ${minSurvived}, Max: ${maxSurvived}, Avg: ${avgSurvived}`);
      });
      
      it("should never exceed 0.97x EV on any block", () => {
        for (let blockIndex = 0; blockIndex < maxBlock; blockIndex++) {
          let survived = 0;

          for (let i = 0; i < totalSimulations; i++) {
            // take a random sample of maxBlock blocks from the 500 blocks available
            const startIndex = Math.floor(Math.random() * (gameBlocks.length - maxBlock));
            const rngs = gameBlocks.slice(startIndex, startIndex + maxBlock).map((block) => block.rng);
            const result = simulateGame(rngs, thresholds);
            if (result > blockIndex) survived++;
          }

          const survivalRate = survived / totalSimulations;
          const ev = survivalRate * Number(multipliers[blockIndex]) / 1e6;

          expect(ev).toBeLessThanOrEqual(0.97);
        }
      });
    });

    describe("Using simulated random values", () => {
      const totalSimulations = 1000;

      it("should simulate games", () => {
        const survived = [];

        for (let i = 0; i < totalSimulations; i++) {
          const rngs = Array.from({ length: maxBlock }, () => randomRNG());
          const result = simulateGame(rngs, thresholds);
          survived.push(result);
        }

        const minSurvived = Math.min(...survived);
        const maxSurvived = Math.max(...survived);
        const avgSurvived = survived.reduce((acc, val) => acc + val, 0) / survived.length;

        expect(minSurvived).toBeGreaterThanOrEqual(0);
        expect(maxSurvived).toBeLessThanOrEqual(maxBlock);
        console.log(`[RND] ${key} - Min: ${minSurvived}, Max: ${maxSurvived}, Avg: ${avgSurvived}`);
      });

      it("should never exceed 0.97x EV on any block", () => {
        for (let blockIndex = 0; blockIndex < maxBlock; blockIndex++) {
          let survived = 0;

          for (let i = 0; i < totalSimulations; i++) {
            const rngs = Array.from({ length: maxBlock }, () => randomRNG());
            const result = simulateGame(rngs, thresholds);
            if (result > blockIndex) survived++;
          }

          const survivalRate = survived / totalSimulations;
          const ev = survivalRate * Number(multipliers[blockIndex]) / 1e6;

          expect(ev).toBeLessThanOrEqual(0.97);
        }
      });
    });
  });
});
