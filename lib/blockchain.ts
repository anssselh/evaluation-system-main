/**
 * lib/blockchain.ts
 *
 * Connects the Next.js backend to a local Ganache Ethereum node via ethers.js v6.
 * Only imported by server-side API routes — never bundled for the browser.
 *
 * Prerequisites (run once before npm run dev):
 *   1. Start Ganache on port 7545
 *   2. truffle compile && truffle migrate --network development
 *   3. Set BLOCKCHAIN_RPC_URL, BLOCKCHAIN_PRIVATE_KEY, BLOCKCHAIN_CONTRACT_ADDRESS in .env
 */

import { ethers } from 'ethers';

// ── ABI: only the functions/events we use from CertificateRegistry ─────────────
const CERTIFICATE_REGISTRY_ABI = [
  // issueCertificate(string,string,string,string)
  {
    name:             'issueCertificate',
    type:             'function',
    stateMutability:  'nonpayable',
    inputs: [
      { name: 'certificateNumber', type: 'string' },
      { name: 'studentName',       type: 'string' },
      { name: 'companyName',       type: 'string' },
      { name: 'position',          type: 'string' },
    ],
    outputs: [],
  },
  // verifyCertificate(string) => (string,string,string,uint256,address,bool)
  {
    name:            'verifyCertificate',
    type:            'function',
    stateMutability: 'view',
    inputs:  [{ name: 'certificateNumber', type: 'string' }],
    outputs: [
      { name: 'studentName', type: 'string'  },
      { name: 'companyName', type: 'string'  },
      { name: 'position',    type: 'string'  },
      { name: 'issuedAt',    type: 'uint256' },
      { name: 'issuedBy',    type: 'address' },
      { name: 'exists',      type: 'bool'    },
    ],
  },
  // totalCertificates() => uint256
  {
    name:            'totalCertificates',
    type:            'function',
    stateMutability: 'view',
    inputs:  [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // event CertificateIssued(...)
  {
    name: 'CertificateIssued',
    type: 'event',
    inputs: [
      { name: 'certificateNumber', type: 'string',  indexed: true  },
      { name: 'studentName',       type: 'string',  indexed: false },
      { name: 'companyName',       type: 'string',  indexed: false },
      { name: 'position',          type: 'string',  indexed: false },
      { name: 'issuedAt',          type: 'uint256', indexed: false },
      { name: 'issuedBy',          type: 'address', indexed: true  },
    ],
  },
] as const;

// ── Singletons — reused across Next.js hot-reloads ────────────────────────────
let _provider: ethers.JsonRpcProvider | null = null;
let _signer:   ethers.Wallet          | null = null;
let _contract: ethers.Contract        | null = null;

function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
  if (!rpcUrl) throw new Error('BLOCKCHAIN_RPC_URL is not set in .env');
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return _provider;
}

function getSigner(): ethers.Wallet {
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
  if (!privateKey) throw new Error('BLOCKCHAIN_PRIVATE_KEY is not set in .env');
  if (!_signer) {
    _signer = new ethers.Wallet(privateKey, getProvider());
  }
  return _signer;
}

function getContract(): ethers.Contract {
  const contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error('BLOCKCHAIN_CONTRACT_ADDRESS is not set in .env');
  if (!_contract) {
    _contract = new ethers.Contract(
      contractAddress,
      CERTIFICATE_REGISTRY_ABI,
      getSigner()
    );
  }
  return _contract;
}

// ── Public Types ──────────────────────────────────────────────────────────────

export interface BlockchainReceipt {
  txHash:          string;   // Ethereum transaction hash (0x...)
  blockNumber:     number;   // Block number on Ganache
  contractAddress: string;   // Deployed CertificateRegistry contract address
  gasUsed:         string;   // Gas consumed (as string to avoid BigInt issues)
  walletAddress:   string;   // Signer wallet address that paid gas
}

export interface OnChainCertificate {
  studentName: string;
  companyName: string;
  position:    string;
  issuedAt:    Date;
  issuedBy:    string;  // Ethereum address
  exists:      boolean;
}

// ── Write: Register certificate on Ganache ───────────────────────────────────

/**
 * Calls `CertificateRegistry.issueCertificate()` on Ganache.
 * Waits for 1 confirmation (Ganache auto-mines instantly).
 *
 * @throws If Ganache is not running or env vars are not set.
 */
export async function registerCertificateOnChain(
  certificateNumber: string,
  studentName:       string,
  companyName:       string,
  position:          string
): Promise<BlockchainReceipt> {
  const contract = getContract();
  const signer   = getSigner();

  // Send the transaction to Ganache
  const tx = await (contract.issueCertificate as any)(
    certificateNumber,
    studentName,
    companyName,
    position
  ) as ethers.ContractTransactionResponse;

  // Wait for 1 block confirmation (instant on Ganache)
  const receipt = await tx.wait(1);

  if (!receipt) {
    throw new Error('No receipt returned — is Ganache running on port 7545?');
  }

  return {
    txHash:          receipt.hash,
    blockNumber:     receipt.blockNumber,
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS!,
    gasUsed:         receipt.gasUsed.toString(),
    walletAddress:   await signer.getAddress(),
  };
}

// ── Read: Verify certificate on Ganache ──────────────────────────────────────

/**
 * Calls `CertificateRegistry.verifyCertificate()` — read-only, no gas cost.
 */
export async function verifyCertificateOnChain(
  certificateNumber: string
): Promise<OnChainCertificate> {
  const contract = getContract();

  const result = await (contract.verifyCertificate as any)(certificateNumber);

  return {
    studentName: result.studentName,
    companyName: result.companyName,
    position:    result.position,
    issuedAt:    new Date(Number(result.issuedAt) * 1000),
    issuedBy:    result.issuedBy,
    exists:      result.exists,
  };
}

/**
 * Returns the total number of certificates registered on-chain.
 */
export async function getTotalCertificatesOnChain(): Promise<number> {
  const contract = getContract();
  const total = await (contract.totalCertificates as any)();
  return Number(total);
}
