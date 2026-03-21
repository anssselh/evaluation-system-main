import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStage extends Document {
  title: string;
  description: string;
  studentId: Types.ObjectId;
  companyId: Types.ObjectId;
  supervisorId?: Types.ObjectId;
  position: string;
  department: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  address: string;
  phone: string;
  email: string;
  tasks: string[];
  achievements: string[];
  status: 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const StageSchema = new Schema<IStage>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a stage title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
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
    supervisorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    position: {
      type: String,
      required: [true, 'Please provide a position'],
    },
    department: {
      type: String,
      required: [true, 'Please provide a department'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
    duration: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
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
      enum: ['in_progress', 'completed', 'cancelled'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate duration before saving
StageSchema.pre('save', function (next) {
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  const durationInDays = Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  this.duration = durationInDays;
  next();
});

export default mongoose.models.Stage ||
  mongoose.model<IStage>('Stage', StageSchema);
