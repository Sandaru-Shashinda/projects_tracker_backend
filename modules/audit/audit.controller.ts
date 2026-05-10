import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import * as auditService from './audit.service';

export const getLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { collection, documentId, action, page, limit } = req.query as Record<string, string>;

    const result = await auditService.getAuditLogs(
      {
        targetCollection: collection,
        targetDocumentId: documentId,
        action,
      },
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
