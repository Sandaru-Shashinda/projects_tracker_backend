import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import * as authDb from './auth.db';
import { IUserSchema } from './auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_prod';

export const registerUser = async (userData: any) => {
  const { email, password, ...rest } = userData

  // Check if user exists
  const existingUser = await authDb.findUserByEmail(email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create user
  const newUser = await authDb.createUser({
    email,
    password: hashedPassword,
    ...rest,
  })

  return newUser
}

export const loginUser = async (credentials: any) => {
  const { email, password } = credentials

  const user = await authDb.findUserByEmail(email)
  if (!user) {
    throw new Error("Invalid credentials")
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials")
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, ministryId: user.ministryId },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  )

  return { user, token }
}

export const getUserProfile = async (userId: string) => {
  return await authDb.findUserById(userId);
}
