import mongoose, { Schema, Types } from 'mongoose';
import { FEEDBACK_STATUS, FEEDBACK_TYPE, IFeedback } from './feedback.types';
const { ObjectId } = Types;

const FeedbackSchema = new Schema<IFeedback>({
  projectId: { type: ObjectId, ref: 'Project', required: true, index: true },
  ministryId: { type: ObjectId, ref: 'Ministry', required: true }, // Denormalized for fast filtering

  // Citizen Info
  user: {
    isAnonymous: { type: Boolean, default: false },
    userId: { type: ObjectId, ref: 'CitizenUser', default: null }, // If you have public login
    tempName: { type: String } // Used if anonymous
  },

  // Content
  type: { 
    type: String, 
    enum: Object.values(FEEDBACK_TYPE), 
    required: true 
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  
  // Moderation Workflow
  status: { 
    type: String, 
    enum: Object.values(FEEDBACK_STATUS), 
    default: FEEDBACK_STATUS.PENDING_REVIEW,
    index: true
  },
  
  // Gov Response
  adminReply: { type: String },
  resolved: { type: Boolean, default: false },

  // Metrics
  upvotes: { type: Number, default: 0 },
  sentimentScore: { type: Number } // -1 (Negative) to +1 (Positive)
}, { timestamps: true });

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);