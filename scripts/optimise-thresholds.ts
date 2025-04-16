// scripts/optimizeThresholds.ts

import fs from "fs";
import path from "path";
import crypto from "crypto";

const maxBlock = 50;
const targetEV = 0.97;
const iterations = 500;

// Fixed multipliers (1e6 scaled)
const multipliers = [
  500000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000,
  6000000, 7000000, 9000000, 10000000, 12500000, 15000000, 17500000, 20000000, 22500000,
  25000000, 27500000, 30000000, 32500000, 35000000, 37500000, 40000000, 42500000, 45000000,
  47500000, 50000000, 52500000, 55000000, 57500000, 60000000, 62500000, 65000000, 67500000,
  70000000, 72500000, 75000000, 77500000, 80000000, 82500000, 85000000, 87500000, 90000000,
  92500000, 95000000, 97500000, 100000000
];

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

// Simulate EV of a block
function simulateEV(thresholds: bigint[], blockIndex: number, simulations = 5000): number {
  const allrngs = Array.from({ length: simulations + thresholds.length }, () => BigInt("0x" + crypto.randomBytes(32).toString("hex")) % BigInt(1e18));

  let survived = 0;
  let totalSimulations = 0;
  let i = 0;
  while (i < allrngs.length) {
    const rngs = allrngs.slice(i, i + maxBlock);
    const result = simulateGame(rngs, thresholds);
    if (result > blockIndex) survived++;
    i += result + 1;
    totalSimulations++;
  }

  const survivalRate = survived / totalSimulations;
  return survivalRate * Number(multipliers[blockIndex]) / 1e6;
}

// Initialize uniform thresholds
let thresholds = Array.from({ length: maxBlock }, () => BigInt(5e17)); // 50% base

let learningRate = 0.1;
let simulations = 1000;

// Optimization loop
for (let iter = 0; iter < iterations; iter++) {
  console.log(`Iteration ${iter + 1}/${iterations}`);

  for (let i = 0; i < maxBlock; i++) {
    const currentEV = simulateEV(thresholds, i, simulations);
    if (currentEV > targetEV) {
      thresholds[i] = thresholds[i] + BigInt(Math.ceil(Number(thresholds[i]) * learningRate));
    } else {
      thresholds[i] = thresholds[i] - BigInt(Math.ceil(Number(thresholds[i]) * learningRate));
    }

    if (thresholds[i] < BigInt(1)) thresholds[i] = BigInt(1);
    if (thresholds[i] > BigInt(1e18)) thresholds[i] = BigInt(1e18);
  }

  learningRate *= 0.99; // Decrease learning rate
  if (learningRate < 0.01) learningRate = 0.01; // Minimum learning rate

  // Increase simulations
  simulations = Math.min(simulations * 1.05, 10000);
  if (simulations > 10000) simulations = 10000; // Cap simulations

  // Check for convergence
  const evs = thresholds.map((_, i) => simulateEV(thresholds, i));
  const maxEV = Math.max(...evs);
  const minEV = Math.min(...evs);
  const evDiff = maxEV - minEV;

  if (evDiff < 0.01) {
    console.log("Converged!");
    break;
  }
}

// console the final evs
console.log("Final EVs:");
for (let i = 0; i < maxBlock; i++) {
  const finalEV = simulateEV(thresholds, i);
  console.log(`Block ${i + 1} EV: ${finalEV.toFixed(4)}`);
}

// Write to CSV
const outDir = path.join(__dirname, "../resources/loot-tables/optimized");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

fs.writeFileSync(path.join(outDir, "thresholds.csv"), thresholds.map(t => t.toString()).join("\n"));
fs.writeFileSync(path.join(outDir, "multipliers.csv"), multipliers.join("\n"));

console.log("✅ Optimization complete. Files saved to /optimized/");
