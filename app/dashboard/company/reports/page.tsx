'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';
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
  studentId: any;
  submittedAt?: string;
  createdAt: string;
}

export default function CompanyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        toast.error('Failed to fetch reports');
        return;
      }

      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('[v0] Fetch reports error:', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = (pdfFile: string) => {
    window.open(pdfFile, '_blank');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Student Technical Reports</h1>
        <p className="text-slate-400 mt-2">
          View and review technical reports submitted by your interns
        </p>
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
              <p className="text-slate-400">No technical reports received yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Reports will appear here when students submit their technical documentation
              </p>
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
                      Student: {report.studentId?.name} • {report.stageId?.title || 'Stage'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        report.status === 'draft'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : report.status === 'submitted'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {report.status === 'submitted' && <Clock className="w-3 h-3" />}
                      {report.status === 'reviewed' && <CheckCircle className="w-3 h-3" />}
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
                        {report.fileSize
                          ? `${(report.fileSize / 1024 / 1024).toFixed(2)} MB`
                          : 'PDF Document'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleDownloadReport(report.pdfFile!)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      View PDF
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {report.content || 'No content'}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                  <div>
                    Submitted:{' '}
                    {report.submittedAt
                      ? new Date(report.submittedAt).toLocaleDateString()
                      : 'Not submitted'}
                  </div>
                  <div>
                    Position: {report.stageId?.position || 'N/A'}
                  </div>
                </div>

                {report.rating && (
                  <div className="text-sm text-slate-400">
                    Rating: {report.rating}/5
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
