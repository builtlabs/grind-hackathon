import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts';

async function main() {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAddress(privateKey);

  console.log(`Private Key: ${privateKey}`);
  console.log(`Account: ${account}`);
}

main().catch(console.error);
