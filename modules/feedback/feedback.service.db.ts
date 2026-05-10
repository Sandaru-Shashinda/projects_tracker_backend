import { Types } from 'mongoose';
import { Feedback } from './feedback.schema';
import { FEEDBACK_STATUS, IFeedback } from './feedback.types';

type FeedbackFilter = Partial<Record<keyof IFeedback, any>> & Record<string, any>;

export const createFeedback = async (data: Partial<IFeedback>) => {
  const feedback = new Feedback(data);
  return await feedback.save();
};

export const findFeedbackById = async (id: string) => {
  return await Feedback.findById(id)
    .populate('projectId', 'title')
    .populate('ministryId', 'name code');
};

export const findAllFeedback = async (filter: FeedbackFilter, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const feedbacks = await Feedback.find(filter)
    .populate('projectId', 'title')
    .populate('ministryId', 'name code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Feedback.countDocuments(filter);
  return { feedbacks, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const updateFeedback = async (id: string, data: Partial<IFeedback>) => {
  return await Feedback.findByIdAndUpdate(id, data, { new: true });
};

export const deleteFeedback = async (id: string) => {
  return await Feedback.findByIdAndDelete(id);
};

export const incrementUpvote = async (id: string) => {
  return await Feedback.findByIdAndUpdate(id, { $inc: { upvotes: 1 } }, { new: true });
};

export const getFeedbackStats = async (projectId?: string, ministryId?: string) => {
  const matchStage: FeedbackFilter = { status: FEEDBACK_STATUS.PUBLISHED };
  if (projectId) matchStage.projectId = new Types.ObjectId(projectId);
  if (ministryId) matchStage.ministryId = new Types.ObjectId(ministryId);

  const stats = await Feedback.aggregate([
    { $match: matchStage },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const total = await Feedback.countDocuments(matchStage);
  const result: Record<string, number> = { total };
  stats.forEach((s) => { if (s._id) result[s._id] = s.count; });
  return result;
};
