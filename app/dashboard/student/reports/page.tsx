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
import { Plus, Send, Trash2, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  _id: string;
  title: string;
  content: string;
  pdfFile?: string;
  fileName?: string;
  fileSize?: number;
  status: 'draft' | 'submitted' | 'reviewed';
  rating?: number;
  stageId: any;
  companyId?: any;
  submittedAt?: string;
}

interface Stage {
  _id: string;
  title: string;
  position: string;
  status: string;
  companyId?: any;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    stageId: '',
    title: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch reports
      const reportsRes = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }

      // Fetch stages
      const stagesRes = await fetch('/api/stages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (stagesRes.ok) {
        const stagesData = await stagesRes.json();
        // Only show approved or completed stages for technical reports
        const eligibleStages = stagesData.filter(
          (stage: Stage) =>
            stage.status === 'approved' ||
            stage.status === 'in_progress' ||
            stage.status === 'completed'
        );
        setStages(eligibleStages);
      }
    } catch (error) {
      console.error('[v0] Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    if (!formData.stageId || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem('token');

      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('stageId', formData.stageId);
      uploadData.append('title', formData.title);

      const response = await fetch('/api/reports/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload report');
        return;
      }

      toast.success('Technical report uploaded successfully');
      setFormData({
        stageId: '',
        title: '',
      });
      setSelectedFile(null);
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('[v0] Upload report error:', error);
      toast.error('Failed to upload report');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitReport = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit report');
        return;
      }

      toast.success('Report submitted successfully');
      fetchData();
    } catch (error) {
      console.error('[v0] Submit report error:', error);
      toast.error('Failed to submit report');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        toast.error('Failed to delete report');
        return;
      }

      toast.success('Report deleted successfully');
      fetchData();
    } catch (error) {
      console.error('[v0] Delete report error:', error);
      toast.error('Failed to delete report');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Technical Reports</h1>
          <p className="text-slate-400 mt-2">
            Submit technical reports documenting your internship experience, tasks, and learnings after completing your stage
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create Technical Report</DialogTitle>
              <DialogDescription className="text-slate-400">
                Submit a comprehensive technical report documenting your internship activities, achievements, and professional development
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateReport} className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label className="text-slate-300">Select Approved Stage</Label>
                <Select
                  value={formData.stageId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, stageId: value })
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select an approved internship" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-slate-400">
                        No approved stages available. Please wait for company approval.
                      </div>
                    ) : (
                      stages.map((stage) => (
                        <SelectItem key={stage._id} value={stage._id}>
                          {stage.title} - {stage.position} ({stage.companyId?.companyName || stage.companyId?.name})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Report Title</Label>
                <Input
                  placeholder="e.g., Technical Report - Web Development Internship"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Upload Technical Report (PDF)</Label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 bg-slate-700/30 hover:bg-slate-700/50 transition-colors relative">
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    {selectedFile ? (
                      <>
                        <FileText className="w-12 h-12 text-blue-400" />
                        <p className="text-sm text-slate-300 font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedFile(null);
                          }}
                          className="mt-2 border-red-500/50 text-red-400 hover:bg-red-500/10 pointer-events-auto"
                        >
                          Remove File
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-slate-400" />
                        <p className="text-sm text-slate-300">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-400">
                          PDF only (Max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  {!selectedFile && (
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Your technical report should include: role overview, technical tasks, technologies used, skills developed, challenges & solutions, and key achievements.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Technical Report
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400">Loading...</p>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-400 mb-2">No technical reports yet</p>
              {stages.length === 0 ? (
                <p className="text-sm text-slate-500">
                  You need an approved internship to create a technical report
                </p>
              ) : (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                >
                  Create Your First Technical Report
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card
              key={report._id}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{report.title}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {report.stageId?.title || 'Stage'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'draft'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : report.status === 'submitted'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.pdfFile ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <FileText className="w-8 h-8 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 font-medium">
                        {report.fileName || 'Technical Report.pdf'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {report.fileSize ? `${(report.fileSize / 1024 / 1024).toFixed(2)} MB` : 'PDF Document'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(report.pdfFile, '_blank')}
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      View PDF
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 line-clamp-2">{report.content || 'No content'}</p>
                )}

                <div className="text-sm text-slate-400">
                  Sent to: {report.companyId?.companyName || report.companyId?.name || 'Company'}
                </div>

                {report.rating && (
                  <div className="text-sm text-slate-400">
                    Rating: {report.rating}/5
                  </div>
                )}

                <div className="flex gap-2">
                  {report.status === 'draft' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReport(report._id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Submit to Company
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteReport(report._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
