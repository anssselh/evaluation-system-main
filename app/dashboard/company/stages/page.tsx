'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, CheckCircle, XCircle, Clock, Download, User, Building2, Mail, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Stage {
  _id: string;
  studentId: any;
  studentName: string;
  university: string;
  studentEmail: string;
  cvFile?: string;
  cvFileName?: string;
  cvFileSize?: number;
  title?: string;
  position?: string;
  department?: string;
  duration?: number;
  status: string;
  startDate?: string;
  endDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function CompanyStagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        toast.error('Failed to fetch stages');
        return;
      }

      const data = await response.json();
      setStages(data);
    } catch (error) {
      console.error('[v0] Fetch stages error:', error);
      toast.error('Failed to load stages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (stageId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stages/${stageId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to approve stage');
        return;
      }

      toast.success('Stage request approved successfully');
      fetchStages();
    } catch (error) {
      console.error('[v0] Approve error:', error);
      toast.error('Failed to approve stage');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (stageId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stages/${stageId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to complete stage');
        return;
      }

      toast.success('Internship marked as completed');
      fetchStages();
    } catch (error) {
      console.error('[v0] Complete error:', error);
      toast.error('Failed to complete stage');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (stage: Stage) => {
    setSelectedStage(stage);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedStage || rejectionReason.trim().length < 10) {
      toast.error('Please provide a rejection reason (minimum 10 characters)');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stages/${selectedStage._id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject stage');
        return;
      }

      toast.success('Stage request rejected');
      setRejectDialogOpen(false);
      setSelectedStage(null);
      setRejectionReason('');
      fetchStages();
    } catch (error) {
      console.error('[v0] Reject error:', error);
      toast.error('Failed to reject stage');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingStages = stages.filter(s => s.status === 'pending');
  const approvedStages = stages.filter(s => s.status === 'approved' || s.status === 'in_progress');
  const completedStages = stages.filter(s => s.status === 'completed');
  const rejectedStages = stages.filter(s => s.status === 'rejected');

  const renderStageCard = (stage: Stage, showActions: boolean = false) => (
    <Card
      key={stage._id}
      className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              {stage.studentName}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Applied: {new Date(stage.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              stage.status === 'pending'
                ? 'bg-yellow-500/20 text-yellow-400'
                : stage.status === 'approved' || stage.status === 'in_progress'
                ? 'bg-green-500/20 text-green-400'
                : stage.status === 'completed'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {stage.status === 'pending' && <Clock className="w-3 h-3" />}
            {(stage.status === 'approved' || stage.status === 'in_progress') && <CheckCircle className="w-3 h-3" />}
            {stage.status === 'pending'
              ? 'Pending Review'
              : stage.status === 'approved'
              ? 'Approved'
              : stage.status === 'in_progress'
              ? 'Active'
              : stage.status === 'completed'
              ? 'Completed'
              : 'Rejected'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Student Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">University:</span>
            <span className="text-slate-400">{stage.university}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Email:</span>
            <span className="text-slate-400">{stage.studentEmail}</span>
          </div>
        </div>

        {/* CV Download */}
        {stage.cvFile && (
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <FileText className="w-8 h-8 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm text-slate-300 font-medium">
                {stage.cvFileName || 'CV.pdf'}
              </p>
              <p className="text-xs text-slate-400">
                {stage.cvFileSize ? `${(stage.cvFileSize / 1024 / 1024).toFixed(2)} MB` : 'PDF Document'}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(stage.cvFile, '_blank')}
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              <Download className="w-3 h-3 mr-1" />
              View CV
            </Button>
          </div>
        )}

        {stage.rejectionReason && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-300 font-medium">Rejection Reason:</p>
            <p className="text-sm text-slate-400 mt-1">{stage.rejectionReason}</p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleApprove(stage._id)}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Approve Application
            </Button>
            <Button
              size="sm"
              onClick={() => handleRejectClick(stage)}
              disabled={actionLoading}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 flex-1"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {stage.status === 'in_progress' && (
          <Button
            size="sm"
            onClick={() => handleComplete(stage._id)}
            disabled={actionLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
          >
            <Flag className="w-3 h-3 mr-1" />
            {actionLoading ? 'Completing...' : 'Mark as Complete'}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Internship Requests & Programs</h1>
        <p className="text-slate-400 mt-2">Manage student internship requests and active programs</p>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Stage Request</DialogTitle>
            <DialogDescription className="text-slate-400">
              Please provide a reason for rejecting this internship request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="Enter rejection reason (minimum 10 characters)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectSubmit}
                disabled={actionLoading || rejectionReason.trim().length < 10}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700">
            Pending ({pendingStages.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-slate-700">
            Approved ({approvedStages.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-slate-700">
            Completed ({completedStages.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-slate-700">
            Rejected ({rejectedStages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-slate-400">Loading...</p>
              </CardContent>
            </Card>
          ) : pendingStages.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-400">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingStages.map((stage) => renderStageCard(stage, true))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {isLoading ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-slate-400">Loading...</p>
              </CardContent>
            </Card>
          ) : approvedStages.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-400">No approved internships</p>
              </CardContent>
            </Card>
          ) : (
            approvedStages.map((stage) => renderStageCard(stage))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-slate-400">Loading...</p>
              </CardContent>
            </Card>
          ) : completedStages.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-400">No completed internships</p>
              </CardContent>
            </Card>
          ) : (
            completedStages.map((stage) => renderStageCard(stage))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {isLoading ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-slate-400">Loading...</p>
              </CardContent>
            </Card>
          ) : rejectedStages.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-400">No rejected requests</p>
              </CardContent>
            </Card>
          ) : (
            rejectedStages.map((stage) => renderStageCard(stage))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
