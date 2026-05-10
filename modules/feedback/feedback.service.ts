import { FEEDBACK_STATUS } from './feedback.types';
import { ROLE } from '../auth/auth.types';
import { Project } from '../project/project.schema';
import * as feedbackDb from './feedback.service.db';

export const submitFeedback = async (data: any, user: any) => {
  const project = await Project.findById(data.projectId);
  if (!project) throw new Error('Project not found');

  const feedbackData: any = {
    projectId: data.projectId,
    ministryId: project.ministryId,
    type: data.type,
    subject: data.subject,
    message: data.message,
    user: {
      isAnonymous: data.isAnonymous ?? false,
      userId: user ? user.id : null,
      tempName: data.isAnonymous ? data.tempName : undefined,
    },
    status: FEEDBACK_STATUS.PENDING_REVIEW,
  };

  return await feedbackDb.createFeedback(feedbackData);
};

export const getAllFeedback = async (query: any, user: any) => {
  const { page, limit, resolved, ...filters } = query;
  const dbQuery: any = { ...filters };

  if (!user || user.role === ROLE.PUBLIC_USER) {
    dbQuery.status = FEEDBACK_STATUS.PUBLISHED;
  } else if (user.role === ROLE.MINISTRY_OPERATOR || user.role === ROLE.MINISTRY_APPROVER) {
    dbQuery.ministryId = user.ministryId;
  }

  if (resolved !== undefined) dbQuery.resolved = resolved;

  return await feedbackDb.findAllFeedback(dbQuery, page, limit);
};

export const getFeedbackById = async (id: string, user: any) => {
  const feedback = await feedbackDb.findFeedbackById(id);
  if (!feedback) throw new Error('Feedback not found');

  if (!user || user.role === ROLE.PUBLIC_USER) {
    if (feedback.status !== FEEDBACK_STATUS.PUBLISHED) {
      throw new Error('Feedback not found');
    }
  } else if (user.role === ROLE.MINISTRY_OPERATOR || user.role === ROLE.MINISTRY_APPROVER) {
    if (feedback.ministryId.toString() !== user.ministryId.toString()) {
      throw new Error('Access denied');
    }
  }

  return feedback;
};

export const moderateFeedback = async (id: string, data: any, user: any) => {
  const feedback = await feedbackDb.findFeedbackById(id);
  if (!feedback) throw new Error('Feedback not found');

  if (user.role === ROLE.MINISTRY_OPERATOR || user.role === ROLE.MINISTRY_APPROVER) {
    if (feedback.ministryId.toString() !== user.ministryId.toString()) {
      throw new Error('Access denied: You can only moderate feedback for your own ministry.');
    }
  }

  return await feedbackDb.updateFeedback(id, data);
};

export const upvoteFeedback = async (id: string) => {
  const feedback = await feedbackDb.findFeedbackById(id);
  if (!feedback) throw new Error('Feedback not found');
  if (feedback.status !== FEEDBACK_STATUS.PUBLISHED) {
    throw new Error('Only published feedback can be upvoted');
  }
  return await feedbackDb.incrementUpvote(id);
};

export const deleteFeedback = async (id: string) => {
  const feedback = await feedbackDb.findFeedbackById(id);
  if (!feedback) throw new Error('Feedback not found');
  return await feedbackDb.deleteFeedback(id);
};

export const getFeedbackStats = (projectId?: string, ministryId?: string) => {
  return feedbackDb.getFeedbackStats(projectId, ministryId);
};
