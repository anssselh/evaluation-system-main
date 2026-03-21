import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReport extends Document {
  stageId: Types.ObjectId;
  studentId: Types.ObjectId;
  companyId: Types.ObjectId;
  title: string;
  content: string;
  pdfFile?: string;
  fileName?: string;
  fileSize?: number;
  activitiesPerformed: string[];
  competenciesDeveloped: string[];
  challenges: string[];
  learnings: string[];
  rating: number;
  feedback: string;
  submittedAt: Date;
  status: 'draft' | 'submitted' | 'reviewed';
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    stageId: {
      type: Schema.Types.ObjectId,
      ref: 'Stage',
      required: true,
    },
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
    title: {
      type: String,
      required: [true, 'Please provide a report title'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    pdfFile: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    activitiesPerformed: [
      {
        type: String,
      },
    ],
    competenciesDeveloped: [
      {
        type: String,
      },
    ],
    challenges: [
      {
        type: String,
      },
    ],
    learnings: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'reviewed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Report ||
  mongoose.model<IReport>('Report', ReportSchema);
