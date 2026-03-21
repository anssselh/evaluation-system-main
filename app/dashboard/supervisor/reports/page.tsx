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
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  _id: string;
  title: string;
  content: string;
  status: 'draft' | 'submitted' | 'reviewed';
  rating?: number;
  feedback?: string;
  studentId: any;
  submittedAt?: string;
}

export default function SupervisorReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    feedback: '',
  });

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReport) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/${selectedReport._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit review');
        return;
      }

      toast.success('Review submitted successfully');
      setIsReviewDialogOpen(false);
      setReviewData({ rating: 0, feedback: '' });
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('[v0] Review error:', error);
      toast.error('Failed to submit review');
    }
  };

  const openReviewDialog = (report: Report) => {
    setSelectedReport(report);
    setReviewData({ rating: 0, feedback: '' });
    setIsReviewDialogOpen(true);
  };

  const filteredReports = {
    pending: reports.filter((r) => r.status === 'submitted'),
    reviewed: reports.filter((r) => r.status === 'reviewed'),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Student Reports</h1>
        <p className="text-slate-400 mt-2">
          Review and provide feedback on student internship reports
        </p>
      </div>

      {/* Pending Reports Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Pending Review</h2>
        <div className="grid gap-4">
          {isLoading ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-slate-400">Loading...</p>
              </CardContent>
            </Card>
          ) : filteredReports.pending.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-400">No pending reports</p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.pending.map((report) => (
              <Card
                key={report._id}
                className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{report.title}</CardTitle>
                      <CardDescription className="text-slate-400">
                        By: {report.studentId?.name} • Submitted:{' '}
                        {report.submittedAt
                          ? new Date(report.submittedAt).toLocaleDateString()
                          : 'N/A'}
                      </CardDescription>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                      Pending
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-400">{report.content}</p>

                  <Dialog
                    open={
                      isReviewDialogOpen &&
                      selectedReport?._id === report._id
                    }
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsReviewDialogOpen(false);
                        setSelectedReport(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => openReviewDialog(report)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Review Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Review Report
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Provide rating and feedback for: {report.title}
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Rating (1-5)</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setReviewData({ ...reviewData, rating: star })
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  reviewData.rating >= star
                                    ? 'bg-amber-500/30 text-amber-400'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                              >
                                <Star className="w-5 h-5" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Feedback</Label>
                          <textarea
                            placeholder="Provide constructive feedback"
                            value={reviewData.feedback}
                            onChange={(e) =>
                              setReviewData({
                                ...reviewData,
                                feedback: e.target.value,
                              })
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
                          Submit Review
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Reviewed Reports Section */}
      {filteredReports.reviewed.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Reviewed Reports</h2>
          <div className="grid gap-4">
            {filteredReports.reviewed.map((report) => (
              <Card
                key={report._id}
                className="bg-slate-800/50 border-slate-700 opacity-75"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{report.title}</CardTitle>
                      <CardDescription className="text-slate-400">
                        By: {report.studentId?.name}
                      </CardDescription>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      Reviewed
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {report.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">Rating:</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (report.rating || 0)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-medium">
                        {report.rating}/5
                      </span>
                    </div>
                  )}
                  {report.feedback && (
                    <div className="text-sm text-slate-400">
                      Feedback: {report.feedback}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
