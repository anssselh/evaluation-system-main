'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SupervisorStats {
  totalStudents: number;
  reportsReceived: number;
  reportsPending: number;
  certificatesIssued: number;
}

export default function SupervisorDashboard() {
  const [stats, setStats] = useState<SupervisorStats>({
    totalStudents: 0,
    reportsReceived: 0,
    reportsPending: 0,
    certificatesIssued: 0,
  });
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch reports
      const reportsRes = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!reportsRes.ok) {
        toast.error('Failed to fetch reports');
        return;
      }

      const reportsData = await reportsRes.json();
      const pending = reportsData.filter((r: any) => r.status === 'submitted');
      const reviewed = reportsData.filter((r: any) => r.status === 'reviewed');

      setStats({
        totalStudents: reportsData.length,
        reportsReceived: reviewed.length,
        reportsPending: pending.length,
        certificatesIssued: 0,
      });

      setPendingReports(pending.slice(0, 3));
    } catch (error) {
      console.error('[v0] Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Students Supervised',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Reports Reviewed',
      value: stats.reportsReceived,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pending Review',
      value: stats.reportsPending,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Total Reports',
      value: stats.totalStudents,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Supervisor Dashboard</h1>
        <p className="text-slate-400 mt-2">
          Oversee student internship progress and provide feedback
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

      {/* Pending Reports */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-white">Pending Report Reviews</CardTitle>
            <CardDescription className="text-slate-400">
              Reports waiting for your feedback
            </CardDescription>
          </div>
          <Button
            onClick={() => router.push('/dashboard/supervisor/reports')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-slate-400">Loading...</div>
          ) : pendingReports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No pending reports</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <div
                  key={report._id}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                  onClick={() => router.push('/dashboard/supervisor/reports')}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{report.title}</h3>
                      <p className="text-sm text-slate-400">
                        By: {report.studentId?.name}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                    {report.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
