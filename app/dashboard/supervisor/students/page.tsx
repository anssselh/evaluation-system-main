'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

interface Stage {
  _id: string;
  title: string;
  studentId: any;
  position: string;
  department: string;
  status: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  stages: Stage[];
}

export default function SupervisorStudentsPage() {
  const [students, setStudents] = useState<Map<string, Student>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch stages to get students
      const stagesRes = await fetch('/api/stages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!stagesRes.ok) {
        toast.error('Failed to fetch student data');
        return;
      }

      const stagesData = await stagesRes.json();

      // Group stages by student
      const studentMap = new Map<string, Student>();

      stagesData.forEach((stage: Stage) => {
        const studentId = stage.supervisorId;
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            _id: studentId,
            name: stage.studentId?.name || 'Unknown',
            email: stage.studentId?.email || 'N/A',
            stages: [],
          });
        }
        const student = studentMap.get(studentId)!;
        student.stages.push(stage);
      });

      setStudents(studentMap);
    } catch (error) {
      console.error('[v0] Fetch error:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const studentArray = Array.from(students.values());

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <Users className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Supervised Students</h1>
          <p className="text-slate-400 mt-2">
            Manage and track your students' internship progress
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-300 text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading ? '...' : studentArray.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-300 text-sm font-medium">
              Active Internships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading
                ? '...'
                : studentArray.reduce(
                    (sum, s) =>
                      sum +
                      s.stages.filter((st) => st.status === 'in_progress').length,
                    0
                  )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-300 text-sm font-medium">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {isLoading
                ? '...'
                : studentArray.reduce(
                    (sum, s) =>
                      sum +
                      s.stages.filter((st) => st.status === 'completed').length,
                    0
                  )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-400">Loading...</p>
            </CardContent>
          </Card>
        ) : studentArray.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-400">
                No students assigned to you yet
              </p>
            </CardContent>
          </Card>
        ) : (
          studentArray.map((student) => (
            <Card
              key={student._id}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{student.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {student.email}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">
                      {student.stages.length} stage(s)
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {student.stages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-300 font-medium">
                      Current Internships:
                    </p>
                    <div className="space-y-2">
                      {student.stages.map((stage) => (
                        <div
                          key={stage._id}
                          className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-slate-300 font-medium">
                                {stage.title}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {stage.position} • {stage.department}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
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
                        </div>
                      ))}
                    </div>
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
