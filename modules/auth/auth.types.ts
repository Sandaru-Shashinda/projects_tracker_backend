import { Document, Types } from 'mongoose';

export enum ROLE {
  PUBLIC_USER = 'PUBLIC_USER',
  MINISTRY_OPERATOR = 'MINISTRY_OPERATOR',
  MINISTRY_APPROVER = 'MINISTRY_APPROVER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface IUserSchema extends Document {
  name: string;
  email: string;
  password: string;
  role: ROLE;
  ministryId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>
}
