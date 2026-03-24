import useSWR from 'swr';
import { useState } from 'react';
import { toast } from 'sonner';

interface Stage {
  _id: string;
  title: string;
  description: string;
  company: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  studentId?: string;
  reportsCount?: number;
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

export function useStages() {
  const { data, error, isLoading, mutate } = useSWR<Stage[]>('/api/stages', fetcher);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createStage = async (stageData: Omit<Stage, '_id'>) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stageData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      await mutate();
      toast.success('Stage created successfully');
      return response.json();
    } catch (error) {
      console.error('[v0] Create stage error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create stage');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStage = async (id: string, stageData: Partial<Stage>) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stageData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      await mutate();
      toast.success('Stage updated successfully');
      return response.json();
    } catch (error) {
      console.error('[v0] Update stage error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update stage');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteStage = async (id: string) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/stages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      await mutate();
      toast.success('Stage deleted successfully');
    } catch (error) {
      console.error('[v0] Delete stage error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete stage');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    stages: data || [],
    isLoading,
    error,
    isSubmitting,
    createStage,
    updateStage,
    deleteStage,
    mutate,
  };
}
