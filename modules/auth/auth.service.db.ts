import { User } from './auth.schema';
import { IUserSchema } from './auth.types';

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const createUser = async (userData: Partial<IUserSchema>) => {
  const user = new User(userData);
  return await user.save();
};

export const findUserById = async (id: string) => {
  return await User.findById(id).select('-password'); // Exclude password from result
};