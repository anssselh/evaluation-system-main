import { z } from 'zod';

// Auth Schemas
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'company']),
  phone: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Stage Schemas
export const CreateStageSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  companyId: z.string().min(1, 'Company is required'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  startDate:  z.string(),
  endDate: z.string(),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  tasks: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
});

export const UpdateStageSchema = CreateStageSchema.partial();

// Report Schemas
export const CreateReportSchema = z.object({
  stageId: z.string().min(1, 'Stage ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  activitiesPerformed: z.array(z.string()).optional(),
  competenciesDeveloped: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  learnings: z.array(z.string()).optional(),
});

export const ReviewReportSchema = z.object({
  rating: z.number().min(0).max(5),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters'),
});

// Certificate Schemas
export const GenerateCertificateSchema = z.object({
  stageId: z.string().min(1, 'Stage ID is required'),
  competencies: z.array(z.string()),
  achievements: z.array(z.string()),
  expiryDate: z
  .string()
  .optional()
  .refine(val => !val || !val.trim() || z.string().datetime().safeParse(val).success, {
    message: 'Invalid datetime',
  }),
});

export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type CreateStageData = z.infer<typeof CreateStageSchema>;
export type UpdateStageData = z.infer<typeof UpdateStageSchema>;
export type CreateReportData = z.infer<typeof CreateReportSchema>;
export type ReviewReportData = z.infer<typeof ReviewReportSchema>;
export type GenerateCertificateData = z.infer<typeof GenerateCertificateSchema>;
