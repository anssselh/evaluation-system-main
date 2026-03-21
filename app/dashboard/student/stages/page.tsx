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
import { Plus, Trash2, Edit2, Clock, CheckCircle, XCircle, AlertCircle, Play, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Stage {
  _id: string;
  studentName: string;
  university: string;
  studentEmail: string;
  title?: string;
  description?: string;
  position?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  address?: string;
  duration?: number;
  status: string;
  rejectionReason?: string;
  companyId?: any;
}


export default function StudentStagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCV, setSelectedCV] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    studentName: '',
    university: '',
    studentEmail: '',
  });

  useEffect(() => {
    fetchStages();
    fetchCompanies(); // ✅ NEW

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
  const fetchCompanies = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users?role=company', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    console.log('COMPANIES RESPONSE:', data); // ✅ ADD THIS

    setCompanies(data);
  } catch (err) {
    console.error('Failed to fetch companies', err);
  }
};
  

  const handleCVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('CV file size must be less than 5MB');
        return;
      }
      setSelectedCV(file);
    }
  };

  const handleCreateStage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCV) {
      toast.error('Please upload your CV');
      return;
    }

    if (!formData.companyId || !formData.studentName || !formData.university || !formData.studentEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('cvFile', selectedCV);
      uploadData.append('companyId', formData.companyId);
      uploadData.append('studentName', formData.studentName);
      uploadData.append('university', formData.university);
      uploadData.append('studentEmail', formData.studentEmail);

      const response = await fetch('/api/stages/apply', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit application');
        return;
      }

      toast.success('Internship application submitted successfully! Waiting for company review.');
      setFormData({
        companyId: '',
        studentName: '',
        university: '',
        studentEmail: '',
      });
      setSelectedCV(null);
      setIsDialogOpen(false);
      fetchStages();
    } catch (error) {
      console.error('[v0] Submit application error:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stage?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        toast.error('Failed to delete stage');
        return;
      }

      toast.success('Stage deleted successfully');
      fetchStages();
    } catch (error) {
      console.error('[v0] Delete stage error:', error);
      toast.error('Failed to delete stage');
    }
  };

  const handleStartStage = async (id: string) => {
    if (!confirm('Are you sure you want to start this internship? This will change the status to "In Progress".')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stages/${id}/start`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to start stage');
        return;
      }

      toast.success('Internship started successfully!');
      fetchStages();
    } catch (error) {
      console.error('[v0] Start stage error:', error);
      toast.error('Failed to start stage');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">My Internship Requests</h1>
          <p className="text-slate-400 mt-2">Track your internship requests and active stages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Request Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Request Internship</DialogTitle>
              <DialogDescription className="text-slate-400">
                Send an internship request to a company. The company will review and approve or decline your request.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateStage} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Company *</Label>
                <select
                  value={formData.companyId}
                  onChange={(e) =>
                    setFormData({ ...formData, companyId: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white border rounded px-3 py-2 w-full text-sm"
                  required
                >
                  <option value="">Select company</option>
                  {companies.map((company: any) => (
                    <option key={company._id} value={company._id}>
                      {company.companyName || company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Full Name *</Label>
                <Input
                  placeholder="Enter your full name"
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData({ ...formData, studentName: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">University *</Label>
                <Input
                  placeholder="Your university name"
                  value={formData.university}
                  onChange={(e) =>
                    setFormData({ ...formData, university: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Email *</Label>
                <Input
                  type="email"
                  placeholder="your.email@university.edu"
                  value={formData.studentEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, studentEmail: e.target.value })
                  }
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Upload CV (PDF) *</Label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 bg-slate-700/30 hover:bg-slate-700/50 transition-colors relative">
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    {selectedCV ? (
                      <>
                        <FileText className="w-12 h-12 text-blue-400" />
                        <p className="text-sm text-slate-300 font-medium">
                          {selectedCV.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(selectedCV.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedCV(null);
                          }}
                          className="mt-2 border-red-500/50 text-red-400 hover:bg-red-500/10 pointer-events-auto"
                        >
                          Remove CV
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-slate-400" />
                        <p className="text-sm text-slate-300">
                          Click to upload your CV
                        </p>
                        <p className="text-xs text-slate-400">
                          PDF only (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                  {!selectedCV && (
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleCVChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !selectedCV}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stages List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400">Loading...</p>
            </CardContent>
          </Card>
        ) : stages.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-400 mb-4">No stages found</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Your First Stage
              </Button>
            </CardContent>
          </Card>
        ) : (
          stages.map((stage) => (
            <Card
              key={stage._id}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white">
                      {stage.title || `Internship Application - ${stage.companyId?.companyName || stage.companyId?.name || 'Company'}`}
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                      {stage.position && stage.department
                        ? `${stage.position} • ${stage.department}`
                        : `Application from ${stage.university}`
                      }
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {/* Only show edit button for pending applications */}
                    {stage.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info('Edit functionality coming soon');
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    {/* Only allow deletion of pending or rejected applications */}
                    {(stage.status === 'pending' || stage.status === 'rejected') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStage(stage._id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Application Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase">Student Name</span>
                    <span className="text-sm text-slate-300 font-medium">{stage.studentName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase">University</span>
                    <span className="text-sm text-slate-300 font-medium">{stage.university}</span>
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <span className="text-xs text-slate-500 uppercase">Email</span>
                    <span className="text-sm text-slate-300 font-medium">{stage.studentEmail}</span>
                  </div>
                </div>

                {/* Stage Details (shown after approval) */}
                {stage.title && stage.position && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-300 uppercase font-medium mb-2">Internship Details</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {stage.position && <div className="text-slate-400">Position: <span className="text-slate-300">{stage.position}</span></div>}
                      {stage.department && <div className="text-slate-400">Department: <span className="text-slate-300">{stage.department}</span></div>}
                      {stage.duration && <div className="text-slate-400">Duration: <span className="text-slate-300">{stage.duration} days</span></div>}
                      {stage.address && <div className="text-slate-400 col-span-2">Address: <span className="text-slate-300">{stage.address}</span></div>}
                    </div>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      stage.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : stage.status === 'approved' || stage.status === 'in_progress'
                        ? 'bg-green-500/20 text-green-400'
                        : stage.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : stage.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {stage.status === 'pending' && <Clock className="w-3 h-3" />}
                    {(stage.status === 'approved' || stage.status === 'in_progress') && <CheckCircle className="w-3 h-3" />}
                    {stage.status === 'rejected' && <XCircle className="w-3 h-3" />}
                    {stage.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                    {stage.status === 'pending'
                      ? 'Pending Company Approval'
                      : stage.status === 'approved'
                      ? 'Approved by Company'
                      : stage.status === 'in_progress'
                      ? 'In Progress'
                      : stage.status === 'completed'
                      ? 'Completed'
                      : stage.status === 'rejected'
                      ? 'Rejected'
                      : 'Cancelled'}
                  </span>
                </div>

                {/* Rejection Reason */}
                {stage.status === 'rejected' && stage.rejectionReason && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-300 font-medium">Rejection Reason:</p>
                        <p className="text-sm text-slate-400 mt-1">{stage.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Info */}
                {stage.status === 'pending' && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-300">
                      <Clock className="w-4 h-4 inline mr-1.5" />
                      Your internship request has been sent to {stage.companyId?.companyName || stage.companyId?.name || 'the company'}. Waiting for approval...
                    </p>
                  </div>
                )}

                {/* Approved - Ready to Start */}
                {stage.status === 'approved' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-300">
                        <CheckCircle className="w-4 h-4 inline mr-1.5" />
                        Your internship has been approved by {stage.companyId?.companyName || stage.companyId?.name}! Click "Start Internship" to begin.
                      </p>
                    </div>
                    <Button
                      onClick={() => handleStartStage(stage._id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Internship
                    </Button>
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
