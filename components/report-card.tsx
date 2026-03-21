import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ReportCardProps {
  id: string;
  title: string;
  period: string;
  submissionDate: string;
  status: 'submitted' | 'pending' | 'reviewed' | 'rejected';
  reviewComments?: string;
  grade?: number;
  onViewClick?: (id: string) => void;
  onEditClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
}

export function ReportCard({
  id,
  title,
  period,
  submissionDate,
  status,
  reviewComments,
  grade,
  onViewClick,
  onEditClick,
  onDeleteClick,
}: ReportCardProps) {
  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    submitted: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-800', label: 'Submitted' },
    pending: { icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
    reviewed: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800', label: 'Reviewed' },
    rejected: { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-800', label: 'Rejected' },
  };

  const config = statusConfig[status];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{period}</CardDescription>
          </div>
          <Badge className={config.color}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Submitted: {formatDate(submissionDate)}</span>
        </div>

        {grade !== undefined && (
          <div className="text-sm">
            <span className="font-semibold">Grade: </span>
            <span>{grade}/20</span>
          </div>
        )}

        {reviewComments && (
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p className="font-semibold mb-1">Reviewer Comments:</p>
            <p className="text-gray-700">{reviewComments}</p>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          {onViewClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewClick(id)}
              className="flex-1"
            >
              View
            </Button>
          )}
          {onEditClick && status === 'rejected' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditClick(id)}
              className="flex-1"
            >
              Revise
            </Button>
          )}
          {onDeleteClick && status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDeleteClick(id)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
