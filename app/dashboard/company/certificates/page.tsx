'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  _id: string;
  certificateNumber: string;
  status: 'generated' | 'sent' | 'verified';
  blockchainStatus: 'pending' | 'confirmed' | 'failed';
  stageId: any;
  studentId: any;
  issueDate: string;
  blockchainHash?: string;
}

interface Stage {
  _id: string;
  title: string;
  position: string;
}

export default function CompanyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    stageId: '',
    competencies: [] as string[],
    achievements: [] as string[],
    expiryDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch certificates
      const certsRes = await fetch('/api/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (certsRes.ok) {
        const certsData = await certsRes.json();
        setCertificates(certsData);
      }

      // Fetch stages
      const stagesRes = await fetch('/api/stages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (stagesRes.ok) {
        const stagesData = await stagesRes.json();
        setStages(stagesData);
      }
    } catch (error) {
      console.error('[v0] Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate certificate');
        return;
      }

      toast.success('Certificate generated successfully');
      setFormData({
        stageId: '',
        competencies: [],
        achievements: [],
        expiryDate: '',
      });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('[v0] Generate certificate error:', error);
      toast.error('Failed to generate certificate');
    }
  };

  const handleDelete = async (certId: string) => {
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/certificates/${certId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete certificate');
        return;
      }

      toast.success('Certificate deleted successfully');
      fetchData();
    } catch (error) {
      console.error('[v0] Delete certificate error:', error);
      toast.error('Failed to delete certificate');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Student Certificates</h1>
          <p className="text-slate-400 mt-2">
            Generate and manage internship completion certificates
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Generate Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Generate Certificate</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a completion certificate for a student
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleGenerateCertificate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Select Stage</Label>
                <Select
                  value={formData.stageId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, stageId: value })
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage._id} value={stage._id}>
                        {stage.title} - {stage.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Generate Certificate
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
              <p className="text-slate-400 mb-4">No certificates generated yet</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Generate Your First Certificate
              </Button>
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
                      Student: {cert.studentId?.name}
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
                      {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                  <div>
                    Certificate #: <span className="font-mono">{cert.certificateNumber}</span>
                  </div>
                  <div>Issued: {new Date(cert.issueDate).toLocaleDateString()}</div>
                </div>

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

                {/* Delete Button */}
                <Button
                  onClick={() => handleDelete(cert._id)}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Certificate
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
