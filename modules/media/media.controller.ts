import { Request, Response } from 'express';
import * as mediaService from './media.service';

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Determine folder based on query param or default to 'general'
    // e.g., ?type=evidence or ?type=logos
    const type = req.query.type as string || 'general';
    
    const url = await mediaService.uploadFile(req.file, type);

    res.status(201).json({ message: 'File uploaded successfully', url });
  } catch (error: any) {
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};