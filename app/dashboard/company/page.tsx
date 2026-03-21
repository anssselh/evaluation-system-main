'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Users, FileText, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyStats {
  activeStages: number;
  totalStudents: number;
  certificates: number;
  pendingRequests: number;
}

export default function CompanyDashboard() {
  const [stats, setStats] = useState<CompanyStats>({
    activeStages: 0,
    totalStudents: 0,
    certificates: 0,
    pendingRequests: 0,
  });
  const [recentStages, setRecentStages] = useState<any[]>([]);
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

      // Fetch certificates
      const certsRes = await fetch('/api/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const certsData = certsRes.ok ? await certsRes.json() : [];

      const activeStages = stagesData.filter((s: any) => s.status === 'approved' || s.status === 'in_progress').length;
      const totalStudents = stagesData.length;
      const pendingRequests = stagesData.filter((s: any) => s.status === 'pending').length;

      setStats({
        activeStages,
        totalStudents,
        certificates: certsData.length,
        pendingRequests,
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
      title: 'Active Internships',
      value: stats.activeStages,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Certificates',
      value: stats.certificates,
      icon: Award,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Company Dashboard
        </h1>
        <p className="text-slate-400 mt-2">
          Manage internship programs and student evaluations
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
            <CardTitle className="text-white">Recent Internships</CardTitle>
            <CardDescription className="text-slate-400">
              Students currently in your programs
            </CardDescription>
          </div>
          <Button
            onClick={() => router.push('/dashboard/company/stages')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-slate-400">Loading...</div>
          ) : recentStages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No internships yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentStages.map((stage) => {
                const studentName = stage.studentName || stage.studentId?.name || 'Unknown Student';
                const title       = stage.title || stage.position || `${studentName}'s Internship`;
                const dept        = stage.department || stage.university || '—';
                const duration    = stage.duration > 0 ? `${stage.duration} days` : 'Dates not set';

                const statusStyles: Record<string, string> = {
                  pending:     'bg-yellow-500/20 text-yellow-400',
                  approved:    'bg-blue-500/20 text-blue-400',
                  in_progress: 'bg-green-500/20 text-green-400',
                  completed:   'bg-slate-500/20 text-slate-400',
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
                    className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">{title}</h3>
                        <p className="text-sm text-slate-400">
                          {studentName}{stage.position ? ` • ${stage.position}` : ''}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[stage.status] || 'bg-slate-500/20 text-slate-400'}`}>
                        {statusLabel[stage.status] || stage.status}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-4 text-sm text-slate-400">
                      <span>Duration: {duration}</span>
                      <span>Dept: {dept}</span>
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
