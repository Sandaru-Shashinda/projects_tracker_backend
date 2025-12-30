import { Request, Response } from 'express';
import { ZodError } from 'zod';
import * as ministryService from './ministry.service';
import { createMinistrySchema, updateMinistrySchema, ministryIdSchema } from './ministry.validation';
import { AuthRequest } from '../auth/auth.middleware';

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createMinistrySchema.parse(req.body);
    const ministry = await ministryService.createMinistry(validatedData);
    res.status(201).json(ministry);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(400).json({ message: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const ministries = await ministryService.getAllMinistries();
    res.json(ministries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const { id } = ministryIdSchema.parse(req.params);
    const ministry = await ministryService.getMinistryById(id);
    res.json(ministry);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(404).json({ message: error.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = ministryIdSchema.parse(req.params);
    const validatedData = updateMinistrySchema.parse(req.body);
    
    const updatedMinistry = await ministryService.updateMinistry(id, validatedData, req.user);
    res.json(updatedMinistry);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(403).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = ministryIdSchema.parse(req.params);
    await ministryService.deleteMinistry(id);
    res.json({ message: 'Ministry deleted successfully' });
  } catch (error: any) {
    if (error instanceof ZodError) return res.status(400).json({ errors: error.issues });
    res.status(400).json({ message: error.message });
  }
};