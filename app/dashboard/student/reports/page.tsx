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
import { Plus, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  _id: string;
  title: string;
  content: string;
  status: 'draft' | 'submitted' | 'reviewed';
  rating?: number;
  stageId: any;
  submittedAt?: string;
}

interface Stage {
  _id: string;
  title: string;
  position: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    stageId: '',
    title: '',
    content: '',
    activitiesPerformed: [] as string[],
    competenciesDeveloped: [] as string[],
    challenges: [] as string[],
    learnings: [] as string[],
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
        setStages(stagesData);
      }
    } catch (error) {
      console.error('[v0] Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to create report');
        return;
      }

      toast.success('Report created successfully');
      setFormData({
        stageId: '',
        title: '',
        content: '',
        activitiesPerformed: [],
        competenciesDeveloped: [],
        challenges: [],
        learnings: [],
      });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('[v0] Create report error:', error);
      toast.error('Failed to create report');
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
          <h1 className="text-3xl font-bold text-white">My Reports</h1>
          <p className="text-slate-400 mt-2">Create and manage your stage reports</p>
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
              <DialogTitle className="text-white">Create New Report</DialogTitle>
              <DialogDescription className="text-slate-400">
                Document your internship experience and learnings
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateReport} className="space-y-4 max-h-96 overflow-y-auto">
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

              <div className="space-y-2">
                <Label className="text-slate-300">Report Title</Label>
                <Input
                  placeholder="Report title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Content</Label>
                <textarea
                  placeholder="Describe your internship experience, tasks, and learnings"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white border rounded px-3 py-2 w-full text-sm"
                  rows={4}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Report
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
              <p className="text-slate-400 mb-4">No reports yet</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Your First Report
              </Button>
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
                <p className="text-sm text-slate-400 line-clamp-2">{report.content}</p>
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
                        Submit
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
