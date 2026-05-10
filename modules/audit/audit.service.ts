import { AuditLog } from './audit.schmea';

interface LogActionParams {
  action: string;
  actor: { userId?: string; email?: string; role?: string };
  targetCollection: string;
  targetDocumentId: string;
  changes?: object;
  ipAddress?: string;
}

export const logAction = async (params: LogActionParams): Promise<void> => {
  try {
    await AuditLog.create({
      action: params.action,
      actor: {
        userId: params.actor.userId,
        email: params.actor.email,
        role: params.actor.role,
      },
      target: {
        collection: params.targetCollection,
        documentId: params.targetDocumentId,
      },
      changes: params.changes,
      ipAddress: params.ipAddress,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write audit log:', err);
  }
};

export const getAuditLogs = async (
  filters: { targetCollection?: string; targetDocumentId?: string; action?: string },
  page = 1,
  limit = 20
) => {
  const query: Record<string, any> = {};

  if (filters.targetCollection) query['target.collection'] = filters.targetCollection;
  if (filters.targetDocumentId) query['target.documentId'] = filters.targetDocumentId;
  if (filters.action) query.action = filters.action;

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(query),
  ]);

  return { logs, total, page, totalPages: Math.ceil(total / limit) };
};
