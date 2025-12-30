import { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as authService from './auth.service';
import { registerSchema, loginSchema } from './auth.validation';
import { AuthRequest } from './auth.middleware';

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validate Input
    const validatedData = registerSchema.parse(req.body);

    // 2. Call Service
    const user = await authService.registerUser(validatedData);

    // 3. Send Response (exclude password)
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    res.status(201).json({ message: 'User registered successfully', user: userResponse });
  } catch (error: any) {
    if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.issues });
    }
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { user, token } = await authService.loginUser(validatedData);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ministryId: user.ministryId
      }
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(401).json({ message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};