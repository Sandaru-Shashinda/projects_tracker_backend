import { Ministry } from './ministry.schema';
import { IMinistry } from './ministry.types';

export const createMinistry = async (data: Partial<IMinistry>) => {
  const ministry = new Ministry(data);
  return await ministry.save();
};

export const findAllMinistries = async (filter: any = {}) => {
  return await Ministry.find(filter).sort({ name: 1 });
};

export const findMinistryById = async (id: string) => {
  return await Ministry.findById(id);
};

export const findMinistryByCode = async (code: string) => {
  return await Ministry.findOne({ code: code.toUpperCase() });
};

export const updateMinistry = async (id: string, data: Partial<IMinistry>) => {
  return await Ministry.findByIdAndUpdate(id, data, { new: true });
};

export const deleteMinistry = async (id: string) => {
  return await Ministry.findByIdAndDelete(id);
};