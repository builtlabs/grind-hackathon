import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { Network } from "alchemy-sdk";

dotenv.config();

const network = Network.ABSTRACT_MAINNET;
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const provider = createPublicClient({
  chain: mainnet,
  transport: http(`https://${network}.g.alchemy.com/v2/${ALCHEMY_KEY}`),
});

const count = 2000;
const outputPath = path.join(__dirname, `../resources/block-data-${network}.json`);

async function main() {
  const latest = await provider.getBlockNumber();
  const startBlock = Number(latest) - (count - 1);

  const results: { blockNumber: number; hash: string; rng: string }[] = [];

  for (let i = 0; i < count; i++) {
    const blockNumber = startBlock + i;
    const block = await provider.getBlock({ blockNumber: BigInt(blockNumber) });

    if (block && block.hash) {
      const rng = (BigInt(block.hash) % BigInt(1e18)).toString();
      results.push({
        blockNumber,
        hash: block.hash,
        rng,
      });
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Wrote ${results.length} blocks to ${outputPath}`);
}

main().catch(console.error);
