import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStage extends Document {
  studentId: Types.ObjectId;
  companyId: Types.ObjectId;
  // Student Application Details (required for initial application)
  studentName: string;
  university: string;
  studentEmail: string;
  cvFile?: string;
  cvFileName?: string;
  cvFileSize?: number;
  // Stage Details (filled after approval - optional initially)
  title?: string;
  description?: string;
  position?: string;
  department?: string;
  startDate?: Date;
  endDate?: Date;
  duration?: number;
  address?: string;
  phone?: string;
  email?: string;
  tasks: string[];
  achievements: string[];
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StageSchema = new Schema<IStage>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Student Application Details (required)
    studentName: {
      type: String,
      required: [true, 'Please provide student name'],
      trim: true,
    },
    university: {
      type: String,
      required: [true, 'Please provide university name'],
      trim: true,
    },
    studentEmail: {
      type: String,
      required: [true, 'Please provide student email'],
      trim: true,
    },
    cvFile: {
      type: String,
      trim: true,
    },
    cvFileName: {
      type: String,
      trim: true,
    },
    cvFileSize: {
      type: Number,
    },
    // Stage Details (optional - filled after approval)
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    position: {
      type: String,
    },
    department: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    tasks: [
      {
        type: String,
      },
    ],
    achievements: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate duration before saving (only if dates are provided)
StageSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    const durationInDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    this.duration = durationInDays;
  }
  next();
});

export default mongoose.models.Stage ||
  mongoose.model<IStage>('Stage', StageSchema);
