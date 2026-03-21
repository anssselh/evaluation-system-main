import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Building2, FileText } from 'lucide-react';

interface StageCardProps {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  reportsCount?: number;
  onViewClick?: (id: string) => void;
  onEditClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
}

export function StageCard({
  id,
  title,
  company,
  startDate,
  endDate,
  status,
  reportsCount = 0,
  onViewClick,
  onEditClick,
  onDeleteClick,
}: StageCardProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Building2 className="w-4 h-4" />
              {company}
            </CardDescription>
          </div>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {formatDate(startDate)} - {formatDate(endDate)}
          </span>
        </div>

        {reportsCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{reportsCount} report(s)</span>
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
          {onEditClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditClick(id)}
              className="flex-1"
            >
              Edit
            </Button>
          )}
          {onDeleteClick && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 flex-1"
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
