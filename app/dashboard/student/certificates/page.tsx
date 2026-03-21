'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useCertificateDownload } from '@/hooks/use-certificate-download';

interface Certificate {
  _id: string;
  certificateNumber: string;
  status: 'generated' | 'sent' | 'verified';
  blockchainHash?: string;
  blockchainStatus: 'pending' | 'confirmed' | 'failed';
  issueDate: string;
  competencies: string[];
  achievements: string[];
  stageId: any;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { downloadCertificate } = useCertificateDownload();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        toast.error('Failed to fetch certificates');
        return;
      }

      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error('[v0] Fetch certificates error:', error);
      toast.error('Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (cert: Certificate) => {
    downloadCertificate(cert._id, cert.certificateNumber);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My Certificates</h1>
        <p className="text-slate-400 mt-2">
          Your internship certificates and blockchain verification status
        </p>
      </div>

      {/* Certificates List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400">Loading...</p>
            </CardContent>
          </Card>
        ) : certificates.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-400">No certificates yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Certificates will appear here once your company generates them
              </p>
            </CardContent>
          </Card>
        ) : (
          certificates.map((cert) => (
            <Card
              key={cert._id}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">
                      {cert.stageId?.title || 'Certificate'}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Certificate #{cert.certificateNumber}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        cert.status === 'verified'
                          ? 'bg-green-500/20 text-green-400'
                          : cert.status === 'sent'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {cert.status === 'verified' && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {cert.status.charAt(0).toUpperCase() +
                        cert.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-400">
                  Issued: {new Date(cert.issueDate).toLocaleDateString()}
                </div>

                {/* Competencies */}
                {cert.competencies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">
                      Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cert.competencies.map((comp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blockchain Status */}
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">
                      Blockchain Status:
                    </span>
                    <span
                      className={
                        cert.blockchainStatus === 'confirmed'
                          ? 'text-green-400 font-medium'
                          : cert.blockchainStatus === 'pending'
                          ? 'text-yellow-400 font-medium'
                          : 'text-red-400 font-medium'
                      }
                    >
                      {cert.blockchainStatus.charAt(0).toUpperCase() +
                        cert.blockchainStatus.slice(1)}
                    </span>
                  </div>
                  {cert.blockchainHash && (
                    <div className="text-xs text-slate-500 mt-2 break-all font-mono">
                      Hash: {cert.blockchainHash.substring(0, 32)}...
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <Button
                  onClick={() => handleDownload(cert)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate PDF
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
