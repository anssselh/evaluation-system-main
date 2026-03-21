'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { BookOpen, FileText, Award, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Stage {
  _id: string;
  title: string;
  position: string;
  company: string;
  status: string;
  startDate: string;
  endDate: string;
  duration: number;
}

interface StudentDashboard {
  activeStages: number;
  completedStages: number;
  reports: number;
  certificates: number;
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentDashboard>({
    activeStages: 0,
    completedStages: 0,
    reports: 0,
    certificates: 0,
  });
  const [recentStages, setRecentStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch stages
      const stagesRes = await fetch('/api/stages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!stagesRes.ok) {
        toast.error('Failed to fetch stages');
        return;
      }

      const stagesData = await stagesRes.json();
      
      // Fetch reports
      const reportsRes = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const reportsData = reportsRes.ok ? await reportsRes.json() : [];

      // Fetch certificates
      const certsRes = await fetch('/api/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const certsData = certsRes.ok ? await certsRes.json() : [];

      // Calculate stats
      const activeStages = stagesData.filter((s: any) => s.status === 'in_progress').length;
      const completedStages = stagesData.filter((s: any) => s.status === 'completed').length;

      setStats({
        activeStages,
        completedStages,
        reports: reportsData.length,
        certificates: certsData.length,
      });

      setRecentStages(stagesData.slice(0, 3));
    } catch (error) {
      console.error('[v0] Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Active Stages',
      value: stats.activeStages,
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Completed',
      value: stats.completedStages,
      icon: Award,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Reports',
      value: stats.reports,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Certificates',
      value: stats.certificates,
      icon: Award,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to Your Dashboard
        </h1>
        <p className="text-slate-400">
          Track your internship journey and manage your evaluations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-300 text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {isLoading ? '...' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Stages */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-white">Recent Stages</CardTitle>
            <CardDescription className="text-slate-400">
              Your current and upcoming internships
            </CardDescription>
          </div>
          <Button
            onClick={() => router.push('/dashboard/student/stages')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Stage
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-slate-400">Loading...</div>
          ) : recentStages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">No stages found</p>
              <Button
                onClick={() => router.push('/dashboard/student/stages')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Your First Stage
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentStages.map((stage: any) => {
                  const title    = stage.title || stage.position || `${stage.companyId?.companyName || stage.companyId?.name || 'Company'}'s Internship`;
                  const subtitle = stage.position || stage.university || '';
                  const company  = stage.companyId?.companyName || stage.companyId?.name || '';
                  const duration = stage.duration > 0 ? `${stage.duration} days` : 'Dates not set';

                  const statusStyles: Record<string, string> = {
                    pending:     'bg-yellow-500/20 text-yellow-400',
                    approved:    'bg-blue-500/20 text-blue-400',
                    in_progress: 'bg-green-500/20 text-green-400',
                    completed:   'bg-slate-500/20 text-slate-300',
                    rejected:    'bg-red-500/20 text-red-400',
                    cancelled:   'bg-red-500/20 text-red-400',
                  };
                  const statusLabel: Record<string, string> = {
                    pending:     'Pending',
                    approved:    'Approved',
                    in_progress: 'In Progress',
                    completed:   'Completed',
                    rejected:    'Rejected',
                    cancelled:   'Cancelled',
                  };

                  return (
                    <div
                      key={stage._id}
                      className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                      onClick={() => router.push('/dashboard/student/stages')}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-medium">{title}</h3>
                          <p className="text-sm text-slate-400">
                            {company}{subtitle && company ? ` • ${subtitle}` : subtitle}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[stage.status] || 'bg-slate-500/20 text-slate-400'}`}>
                          {statusLabel[stage.status] || stage.status}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-4 text-sm text-slate-400">
                        <span>Duration: {duration}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
