import mongoose, { Schema } from 'mongoose';
import { IMinistry } from './ministry.types';

const MinistrySchema = new Schema<IMinistry>({
  name: { type: String, required: true, unique: true }, // "Ministry of Transport"
  code: { type: String, required: true, unique: true, uppercase: true }, // "MOT"
  
  logoUrl: { type: String }, 
  description: { type: String },
  website: { type: String },
  
  // Public Contact Info
  contactDetails: {
    phone: { type: String },
    email: { type: String },
    address: { type: String }
  },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Ministry = mongoose.model<IMinistry>('Ministry', MinistrySchema);