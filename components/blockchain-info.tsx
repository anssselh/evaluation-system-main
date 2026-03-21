import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BlockchainInfoProps {
  certificateNumber: string;
  blockchainHash?: string;
  blockchainStatus: 'pending' | 'confirmed' | 'failed';
  issueDate: string;
}

export function BlockchainInfo({
  certificateNumber,
  blockchainHash,
  blockchainStatus,
  issueDate,
}: BlockchainInfoProps) {
  const [copied, setCopied] = useState(false);

  const statusConfig = {
    pending: {
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Pending Verification',
      description: 'Your certificate is being recorded on the blockchain...',
    },
    confirmed: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-green-100 text-green-800',
      label: 'Verified',
      description: 'Certificate verified and stored on blockchain',
    },
    failed: {
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'bg-red-100 text-red-800',
      label: 'Verification Failed',
      description: 'Failed to verify certificate on blockchain',
    },
  };

  const config = statusConfig[blockchainStatus];

  const copyHash = () => {
    if (blockchainHash) {
      navigator.clipboard.writeText(blockchainHash);
      setCopied(true);
      toast.success('Hash copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Certificate Security</CardTitle>
            <CardDescription>Blockchain verification status</CardDescription>
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
          <div>
            <p className="text-xs text-gray-500 mb-1">Certificate Number</p>
            <p className="font-mono text-sm font-semibold">{certificateNumber}</p>
          </div>

          {blockchainHash && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Blockchain Hash (SHA-256)</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-gray-100 p-2 rounded flex-1 overflow-x-auto">
                  {blockchainHash.substring(0, 32)}...
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyHash}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1">Issue Date</p>
            <p className="text-sm">{formatDate(issueDate)}</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 bg-white p-2 rounded">
          This certificate is secured using cryptographic hashing. The blockchain hash ensures the integrity and authenticity of your document.
        </p>
      </CardContent>
    </Card>
  );
}
