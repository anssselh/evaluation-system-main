/**
 * GET /api/blockchain/status
 *
 * Verifies the connection to Ganache and the deployed smart contract.
 * Use this to confirm everything is working before testing certificate generation.
 */
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET() {
  const results: Record<string, any> = {
    env:         {},
    ganache:     {},
    contract:    {},
    overall:     'checking',
  };

  // ── 1. Check environment variables ───────────────────────────────────────
  const rpcUrl          = process.env.BLOCKCHAIN_RPC_URL;
  const privateKey      = process.env.BLOCKCHAIN_PRIVATE_KEY;
  const contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

  results.env = {
    BLOCKCHAIN_RPC_URL:          rpcUrl          ? rpcUrl           : 'MISSING',
    BLOCKCHAIN_PRIVATE_KEY:      privateKey      ? '0x****...'      : 'MISSING',
    BLOCKCHAIN_CONTRACT_ADDRESS: contractAddress ? contractAddress  : 'MISSING',
    allSet: !!(rpcUrl && privateKey && contractAddress),
  };

  if (!results.env.allSet) {
    results.overall = 'failed';
    return NextResponse.json(results, { status: 200 });
  }

  // ── 2. Connect to Ganache ─────────────────────────────────────────────────
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network  = await provider.getNetwork();
    const blockNum = await provider.getBlockNumber();
    const accounts = await provider.listAccounts();

    const signer        = new ethers.Wallet(privateKey!, provider);
    const signerAddress = await signer.getAddress();
    const signerBalance = await provider.getBalance(signerAddress);

    results.ganache = {
      connected:      true,
      networkId:      network.chainId.toString(),
      latestBlock:    blockNum,
      signerAddress,
      signerBalance:  `${ethers.formatEther(signerBalance)} ETH`,
      totalAccounts:  accounts.length,
    };
  } catch (err: any) {
    results.ganache = {
      connected: false,
      error:     err.message,
      hint:      'Make sure Ganache is running on port 7545',
    };
    results.overall = 'failed';
    return NextResponse.json(results, { status: 200 });
  }

  // ── 3. Verify the smart contract ──────────────────────────────────────────
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer   = new ethers.Wallet(privateKey!, provider);

    const abi = [
      {
        name: 'totalCertificates',
        type: 'function',
        stateMutability: 'view',
        inputs:  [],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ];

    const contract = new ethers.Contract(contractAddress!, abi, signer);

    // Check there is code at the address (i.e. contract is deployed)
    const code  = await provider.getCode(contractAddress!);
    const total = await (contract.totalCertificates as any)();

    results.contract = {
      address:              contractAddress,
      deployed:             code !== '0x',
      totalCertificates:    Number(total),
      codeSize:             (code.length - 2) / 2 + ' bytes',
    };

    results.overall = 'ok';
  } catch (err: any) {
    results.contract = {
      deployed: false,
      error:    err.message,
      hint:     'Run: truffle migrate --network development  and update BLOCKCHAIN_CONTRACT_ADDRESS in .env',
    };
    results.overall = 'failed';
  }

  return NextResponse.json(results, { status: 200 });
}
