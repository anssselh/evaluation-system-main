'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel, Field } from '@/components/ui/field';
import { toast } from 'sonner';

const stageFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  company: z.string().min(2, 'Company name is required'),
  startDate: z.string(),
  endDate: z.string(),
});

type StageFormData = z.infer<typeof stageFormSchema>;

interface StageFormProps {
  onSubmit: (data: StageFormData) => Promise<void>;
  initialData?: Partial<StageFormData>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function StageForm({
  onSubmit,
  initialData,
  isLoading = false,
  submitLabel = 'Create Stage',
}: StageFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StageFormData>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: initialData,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: StageFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success('Stage saved successfully');
    } catch (error) {
      console.error('[v0] Form submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internship Stage Details</CardTitle>
        <CardDescription>Fill in all the required information about the internship</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <FieldGroup>
            <FieldLabel>Stage Title</FieldLabel>
            <Field>
              <Input
                placeholder="e.g., Full Stack Development Internship"
                {...register('title')}
                disabled={isLoading || isSubmitting}
              />
            </Field>
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Company Name</FieldLabel>
            <Field>
              <Input
                placeholder="Company name"
                {...register('company')}
                disabled={isLoading || isSubmitting}
              />
            </Field>
            {errors.company && <p className="text-sm text-red-600">{errors.company.message}</p>}
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Description</FieldLabel>
            <Field>
              <Textarea
                placeholder="Describe your responsibilities, projects, and learning outcomes"
                rows={5}
                {...register('description')}
                disabled={isLoading || isSubmitting}
              />
            </Field>
            {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
          </FieldGroup>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <FieldLabel>Start Date</FieldLabel>
              <Field>
                <Input
                  type="date"
                  {...register('startDate')}
                  disabled={isLoading || isSubmitting}
                />
              </Field>
              {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>End Date</FieldLabel>
              <Field>
                <Input
                  type="date"
                  {...register('endDate')}
                  disabled={isLoading || isSubmitting}
                />
              </Field>
              {errors.endDate && <p className="text-sm text-red-600">{errors.endDate.message}</p>}
            </FieldGroup>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
