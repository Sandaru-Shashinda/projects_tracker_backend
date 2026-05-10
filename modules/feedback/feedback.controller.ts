import { Response } from 'express';
import { ZodError } from 'zod';
import * as feedbackService from './feedback.service';
import {
  createFeedbackSchema,
  updateFeedbackStatusSchema,
  filterQuerySchema,
  feedbackIdSchema,
} from './feedback.validation';
import { AuthRequest } from '../auth/auth.middleware';

const handleZodError = (res: Response, error: ZodError) =>
  res.status(400).json({ errors: error.issues });

export const submit = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createFeedbackSchema.parse(req.body);
    const feedback = await feedbackService.submitFeedback(validatedData, req.user);
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error);
    res.status(400).json({ message: error.message });
  }
};

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const validatedQuery = filterQuerySchema.parse(req.query);
    const result = await feedbackService.getAllFeedback(validatedQuery, req.user);
    res.json(result);
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error);
    res.status(500).json({ message: error.message });
  }
};

export const getOne = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = feedbackIdSchema.parse(req.params);
    const feedback = await feedbackService.getFeedbackById(id, req.user);
    res.json(feedback);
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error);
    res.status(404).json({ message: error.message });
  }
};

export const moderate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = feedbackIdSchema.parse(req.params);
    const validatedData = updateFeedbackStatusSchema.parse(req.body);
    const feedback = await feedbackService.moderateFeedback(id, validatedData, req.user);
    res.json({ message: 'Feedback updated', feedback });
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error);
    res.status(403).json({ message: error.message });
  }
};

export const upvote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = feedbackIdSchema.parse(req.params);
    const feedback = await feedbackService.upvoteFeedback(id);
    res.json({ message: 'Upvoted successfully', feedback });
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error);
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = feedbackIdSchema.parse(req.params);
    await feedbackService.deleteFeedback(id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error);
    res.status(400).json({ message: error.message });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, ministryId } = req.query as { projectId?: string; ministryId?: string };
    const stats = await feedbackService.getFeedbackStats(projectId, ministryId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to retrieve feedback stats' });
  }
};
