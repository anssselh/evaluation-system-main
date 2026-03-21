'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Stage {
  _id: string;
  title: string;
  studentId: any;
  position: string;
  department: string;
  duration: number;
  status: string;
  startDate: string;
  endDate: string;
}

export default function CompanyStagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Active Internship Programs</h1>
        <p className="text-slate-400 mt-2">Manage students in your internship programs</p>
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
              <p className="text-slate-400">No active internships</p>
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
                  <div>
                    <CardTitle className="text-white">{stage.title}</CardTitle>
                    <CardDescription className="text-slate-400">
                      Student: {stage.studentId?.name} • {stage.position}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      stage.status === 'in_progress'
                        ? 'bg-green-500/20 text-green-400'
                        : stage.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {stage.status === 'in_progress'
                      ? 'Active'
                      : stage.status === 'completed'
                      ? 'Completed'
                      : 'Cancelled'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm text-slate-400">
                  <div>Department: {stage.department}</div>
                  <div>Duration: {stage.duration} days</div>
                  <div>
                    Progress: {Math.round(
                      ((new Date().getTime() - new Date(stage.startDate).getTime()) /
                        (new Date(stage.endDate).getTime() -
                          new Date(stage.startDate).getTime())) *
                        100
                    )}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.round(
                          ((new Date().getTime() - new Date(stage.startDate).getTime()) /
                            (new Date(stage.endDate).getTime() -
                              new Date(stage.startDate).getTime())) *
                            100
                        ),
                        100
                      )}%`,
                    }}
                  ></div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
