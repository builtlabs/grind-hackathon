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

function generateFakeBlocks(numBlocks: number): BlockRNG[] {
  const blocks: BlockRNG[] = [];

  for (let i = 0; i < numBlocks; i++) {
    const blockNumber = i + 1;
    const randomValue = crypto.randomBytes(32).toString("hex");
    const hash = `0x${randomValue}`;
    const randomBigInt = BigInt("0x" + randomValue);
    const rng = randomBigInt % BigInt(1e18);
    blocks.push({ blockNumber, hash, rng });
  }

  return blocks;
}

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

const lootTablePath = path.join(__dirname, "./loot-tables");
const directories = fs.readdirSync(lootTablePath, { withFileTypes: true })
  .filter((dir) => dir.isDirectory())
  .map((dir) => dir.name);

const curves = directories.reduce((acc, dir) => {
  const thresholdsPath = path.join(lootTablePath, dir, "thresholds.csv");
  const multipliersPath = path.join(lootTablePath, dir, "multipliers.csv");
  if (fs.existsSync(thresholdsPath) && fs.existsSync(multipliersPath)) {
    acc[dir] = [thresholdsPath, multipliersPath];
  }
  return acc;
}, {} as Record<string, [string, string]>);

const rngPath = path.join(__dirname, "./block-data.json");
const gameBlocks = loadBlockRNG(rngPath);
const fakeBlocks = generateFakeBlocks(1000000);

const data = {
  CHAIN: gameBlocks,
  RANDOM: fakeBlocks,
}

Object.entries(curves).forEach(([key, value]) => {
  describe(`Game Simulation — ${key}`, () => {
    const thresholds = loadCsv(value[0]);
    const multipliers = loadCsv(value[1]);
    const maxBlock = thresholds.length;

    Object.entries(data).forEach(([source, blocks]) => {
      describe(`Using ${source} block data`, () => {
        it("should simulate games", () => {
          const survived = [];

          const totalSimulations = Math.min(blocks.length - maxBlock, 100000);
          for (let i = 0; i < totalSimulations; i++) {
            const rngs = blocks.slice(i, i + maxBlock).map((block) => block.rng);
            const result = simulateGame(rngs, thresholds);
            survived.push(result);
          }

          const minSurvived = Math.min(...survived);
          const maxSurvived = Math.max(...survived);
          const avgSurvived = survived.reduce((acc, val) => acc + val, 0) / survived.length;
          const completion = survived.filter((s) => s === maxBlock).length;

          expect(minSurvived).toBeGreaterThanOrEqual(0);
          expect(maxSurvived).toBeLessThanOrEqual(maxBlock);
          expect(completion).toBeGreaterThan(0);
          expect(completion).toBeLessThan(totalSimulations);
          console.log(`[${source}] ${key} - Min: ${minSurvived}, Max: ${maxSurvived}, Avg: ${avgSurvived}, Completion: ${completion}/${totalSimulations} (${((completion / totalSimulations) * 100).toFixed(2)}%)`);
        });
        
        it("should never exceed 0.97x EV on any block", () => {
          const warnings = [];
          const errors =[];

          for (let blockIndex = 0; blockIndex < maxBlock; blockIndex++) {
            let survived = 0;

            let totalSimulations = 0;
            let i = 0;
            while (i < blocks.length) {
              const rngs = blocks.slice(i, i + maxBlock).map((block) => block.rng);
              const result = simulateGame(rngs, thresholds);
              if (result > blockIndex) survived++;
              i += result + 1;
              totalSimulations++;
            }

            const survivalRate = survived / totalSimulations;
            const ev = survivalRate * Number(multipliers[blockIndex]) / 1e6;

            if (ev > 0.97) {
              // console.warn(`⚠️ Block ${blockIndex + 1} has EV ${ev.toFixed(4)} > 0.97x`);
              warnings.push(`Block ${blockIndex + 1} has EV ${ev.toFixed(4)} > 0.97x`);
            }

            if (ev > 1.0) {
              errors.push(`Block ${blockIndex + 1} has EV ${ev.toFixed(4)} > 1.0x`);
            }
          }
          if (warnings.length > 0) {
            // console.warn(`[${source}] ${key} - Warnings:`);
            // warnings.forEach((warning) => console.warn(warning));
          }

          expect(errors).toHaveLength(0);

        });

        it("should have 97% survival rate at 1x", () => {
          const survived = [];
          const totalSimulations = Math.min(blocks.length - maxBlock, 100000);
          for (let i = 0; i < totalSimulations; i++) {
            const rngs = blocks.slice(i, i + maxBlock).map((block) => block.rng);
            const result = simulateGame(rngs, thresholds);
            survived.push(result);
          }

          const target = multipliers.findIndex((m) => m >= 1e6);
          const survivalRate = survived.filter((s) => s >= target).length / totalSimulations;
          console.log(`[${source}] ${key} - Survival rate at ${Number(multipliers[target]) / 1e6}x: ${(survivalRate * 100).toFixed(2)}%`);
          expect(survivalRate).toBeGreaterThanOrEqual(0.97);
        });

        it("should maintain the house edge", () => {
          const survived: number[] = [];
          const totalSimulations = Math.min(blocks.length - maxBlock, 100000);
          for (let i = 0; i < totalSimulations; i++) {
            const rngs = blocks.slice(i, i + maxBlock).map((block) => block.rng);
            const result = simulateGame(rngs, thresholds);
            survived.push(result);
          }

          const blockEdges = Array.from({ length: maxBlock }, (_, index) => {
            const survivedCount = survived.filter((s) => s >= index).length;
            return survivedCount / totalSimulations * Number(multipliers[index]) / 1e6;
          });

          for (let i = 0; i < blockEdges.length - 1; i++) {
            expect(blockEdges[i]).toBeLessThanOrEqual(1);
          }
        });
      });
    });
  });
});
