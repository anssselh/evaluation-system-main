import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICertificate extends Document {
  stageId: Types.ObjectId;
  studentId: Types.ObjectId;
  companyId: Types.ObjectId;
  certificateNumber: string;
  issueDate: Date;
  expiryDate?: Date;
  competencies: string[];
  achievements: string[];
  certificateUrl: string;
  blockchainHash?: string;
  blockchainStatus: 'pending' | 'confirmed' | 'failed';
  status: 'generated' | 'sent' | 'verified';
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
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
    certificateNumber: {
      type: String,
      required: [true, 'Please provide a certificate number'],
      unique: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    competencies: [
      {
        type: String,
      },
    ],
    achievements: [
      {
        type: String,
      },
    ],
    certificateUrl: {
      type: String,
      default: '',
    },
    blockchainHash: {
      type: String,
      default: null,
    },
    blockchainStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['generated', 'sent', 'verified'],
      default: 'generated',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);
