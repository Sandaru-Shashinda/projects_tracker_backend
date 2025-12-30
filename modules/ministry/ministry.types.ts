import { Document } from 'mongoose';

export interface IContactDetails {
  phone?: string;
  email?: string;
  address?: string;
}

export interface IMinistry extends Document {
  name: string;
  code: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  contactDetails?: IContactDetails;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}