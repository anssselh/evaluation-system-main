'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, Clock, AlertCircle, Link } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BlockchainInfoProps {
  certificateNumber: string;
  blockchainHash?:   string;
  blockchainStatus:  'pending' | 'confirmed' | 'failed';
  issueDate:         string;
  // Real Ethereum blockchain fields (from Ganache)
  txHash?:          string | null;
  blockNumber?:     number | null;
  contractAddress?: string | null;
  gasUsed?:         string | null;
  walletAddress?:   string | null;
}

export function BlockchainInfo({
  certificateNumber,
  blockchainHash,
  blockchainStatus,
  issueDate,
  txHash,
  blockNumber,
  contractAddress,
  gasUsed,
  walletAddress,
}: BlockchainInfoProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const statusConfig = {
    pending: {
      icon:        <Clock className="w-4 h-4" />,
      color:       'bg-yellow-100 text-yellow-800',
      label:       'Pending',
      description: 'Certificate is being recorded on the blockchain...',
    },
    confirmed: {
      icon:        <CheckCircle className="w-4 h-4" />,
      color:       'bg-green-100 text-green-800',
      label:       'On-Chain Confirmed',
      description: 'Certificate is permanently recorded on the Ethereum blockchain (Ganache)',
    },
    failed: {
      icon:        <AlertCircle className="w-4 h-4" />,
      color:       'bg-red-100 text-red-800',
      label:       'Blockchain Unavailable',
      description: 'Could not reach Ganache node. Certificate is valid but not yet on-chain.',
    },
  };

  const config = statusConfig[blockchainStatus];

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      year:   'numeric',
      month:  'long',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    });

  const shortHash = (hash: string, start = 10, end = 8) =>
    `${hash.substring(0, start)}...${hash.substring(hash.length - end)}`;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5 text-indigo-600" />
              Blockchain Security
            </CardTitle>
            <CardDescription>Ethereum verification — Ganache local network</CardDescription>
          </div>
          <Badge className={config.color}>{config.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {config.icon}
          <p className="text-sm text-gray-700">{config.description}</p>
        </div>

        <div className="bg-white p-3 rounded space-y-3">
          {/* Certificate Number */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Certificate Number</p>
            <p className="font-mono text-sm font-semibold">{certificateNumber}</p>
          </div>

          {/* Transaction Hash */}
          {txHash && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Transaction Hash (Ethereum)</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-gray-100 p-2 rounded flex-1 overflow-x-auto">
                  {shortHash(txHash)}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(txHash, 'Transaction hash')}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Block Number */}
          {blockNumber !== null && blockNumber !== undefined && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Block Number</p>
              <p className="font-mono text-sm font-semibold text-indigo-700">#{blockNumber}</p>
            </div>
          )}

          {/* Contract Address */}
          {contractAddress && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Smart Contract Address</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-gray-100 p-2 rounded flex-1 overflow-x-auto">
                  {shortHash(contractAddress, 14, 6)}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(contractAddress, 'Contract address')}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Wallet Address */}
          {walletAddress && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Issuer Wallet (Ganache account[0])</p>
              <code className="text-xs font-mono bg-gray-100 p-2 rounded block overflow-x-auto">
                {shortHash(walletAddress, 14, 6)}
              </code>
            </div>
          )}

          {/* Gas Used */}
          {gasUsed && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Gas Used</p>
              <p className="text-sm font-mono text-gray-700">
                {parseInt(gasUsed).toLocaleString()} units
              </p>
            </div>
          )}

          {/* Issue Date */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Issue Date</p>
            <p className="text-sm">{formatDate(issueDate)}</p>
          </div>

          {/* Fallback hash display when no real txHash */}
          {!txHash && blockchainHash && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Document Hash (SHA-256)</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-gray-100 p-2 rounded flex-1 overflow-x-auto">
                  {blockchainHash.substring(0, 32)}...
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(blockchainHash, 'Hash')}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {blockchainStatus === 'confirmed' ? (
          <p className="text-xs text-green-700 bg-green-50 border border-green-200 p-2 rounded">
            This certificate is permanently recorded on a local Ethereum blockchain (Ganache).
            The transaction hash proves the certificate data is immutable and tamper-proof.
            Network: <strong>Ganache — http://127.0.0.1:7545</strong>
          </p>
        ) : blockchainStatus === 'failed' ? (
          <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 p-2 rounded">
            Ganache was not reachable when this certificate was issued. Start Ganache and
            re-issue to record it on-chain.
          </p>
        ) : (
          <p className="text-xs text-gray-600 bg-white p-2 rounded">
            Waiting for Ganache to confirm the transaction...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
