import * as ministryDb from './ministry.service.db';
import { IMinistry } from './ministry.types';
import { ROLE } from '../auth/auth.types';

export const createMinistry = async (data: any) => {
  const existing = await ministryDb.findMinistryByCode(data.code);
  if (existing) {
    throw new Error(`Ministry with code ${data.code} already exists`);
  }
  return await ministryDb.createMinistry(data);
};

export const getAllMinistries = async () => {
  return await ministryDb.findAllMinistries({ isActive: true });
};

export const getMinistryById = async (id: string) => {
  const ministry = await ministryDb.findMinistryById(id);
  if (!ministry) {
    throw new Error('Ministry not found');
  }
  return ministry;
};

export const updateMinistry = async (id: string, data: any, user: any) => {
  // Authorization Check:
  // SUPER_ADMIN can update any ministry (handled by route guard).
  // MINISTRY_APPROVER can only update their own ministry.
  if (user.role === ROLE.MINISTRY_APPROVER && user.ministryId?.toString() !== id) {
    throw new Error('Access denied: You can only update your own ministry');
  }

  const ministry = await ministryDb.findMinistryById(id);
  if (!ministry) {
    throw new Error('Ministry not found');
  }

  return await ministryDb.updateMinistry(id, data);
};

export const deleteMinistry = async (id: string) => {
  const ministry = await ministryDb.findMinistryById(id);
  if (!ministry) {
    throw new Error('Ministry not found');
  }
  // Hard delete or Soft delete depending on requirements. 
  // Using hard delete here as per standard CRUD, but often soft delete (isActive=false) is better.
  return await ministryDb.deleteMinistry(id);
};