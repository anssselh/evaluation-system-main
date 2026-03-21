import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICertificate extends Document {
  stageId:           Types.ObjectId;
  studentId:         Types.ObjectId;
  companyId:         Types.ObjectId;
  certificateNumber: string;
  issueDate:         Date;
  expiryDate?:       Date;
  competencies:      string[];
  achievements:      string[];
  certificateUrl:    string;

  // Legacy field — kept for UI compatibility (contains txHash when blockchain is real)
  blockchainHash?:   string;

  // Real Ethereum blockchain fields (populated after Ganache transaction)
  txHash:            string | null;   // 0x... transaction hash
  blockNumber:       number | null;   // Block number on Ganache
  contractAddress:   string | null;   // CertificateRegistry contract address
  gasUsed:           string | null;   // Gas used (as string)
  walletAddress:     string | null;   // Signer wallet that issued the tx

  blockchainStatus:  'pending' | 'confirmed' | 'failed';
  status:            'generated' | 'sent' | 'verified';
  createdAt:         Date;
  updatedAt:         Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    stageId: {
      type:     Schema.Types.ObjectId,
      ref:      'Stage',
      required: true,
    },
    studentId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    companyId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    certificateNumber: {
      type:     String,
      required: [true, 'Please provide a certificate number'],
      unique:   true,
    },
    issueDate: {
      type:    Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    competencies: [{ type: String }],
    achievements: [{ type: String }],
    certificateUrl: {
      type:    String,
      default: '',
    },

    // Legacy — set to txHash for UI compatibility
    blockchainHash: {
      type:    String,
      default: null,
    },

    // Real Ethereum blockchain data
    txHash: {
      type:    String,
      default: null,
    },
    blockNumber: {
      type:    Number,
      default: null,
    },
    contractAddress: {
      type:    String,
      default: null,
    },
    gasUsed: {
      type:    String,
      default: null,
    },
    walletAddress: {
      type:    String,
      default: null,
    },

    blockchainStatus: {
      type:    String,
      enum:    ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
    status: {
      type:    String,
      enum:    ['generated', 'sent', 'verified'],
      default: 'generated',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Certificate ||
  mongoose.model<ICertificate>('Certificate', CertificateSchema);
