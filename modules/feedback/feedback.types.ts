import { Document, Types } from 'mongoose';

export enum FEEDBACK_TYPE {
  COMPLAINT = 'COMPLAINT',
  SUGGESTION = 'SUGGESTION',
  APPRECIATION = 'APPRECIATION',
  QUESTION = 'QUESTION',
}

export enum FEEDBACK_STATUS {
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

export interface IFeedbackUser {
  isAnonymous: boolean;
  userId?: Types.ObjectId;
  tempName?: string;
}

export interface IFeedback extends Document {
  projectId: Types.ObjectId;
  ministryId: Types.ObjectId;
  user: IFeedbackUser;
  type: FEEDBACK_TYPE;
  subject: string;
  message: string;
  status: FEEDBACK_STATUS;
  adminReply?: string;
  resolved: boolean;
  upvotes: number;
  sentimentScore?: number;
  createdAt: Date;
  updatedAt: Date;
}