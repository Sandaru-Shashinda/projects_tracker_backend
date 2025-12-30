import mongoose from "mongoose"
import { Project } from "./project.schema"
import { APPROVAL_STATUS, IProject, PROJECT_STATUS } from "./project.types"

// Define a simple filter type
type ProjectFilter = Partial<Record<keyof IProject, any>> & Record<string, any>

export const createProject = async (data: Partial<IProject>) => {
  const project = new Project(data)
  return await project.save()
}

export const findProjectById = async (id: string) => {
  return await Project.findById(id)
    .populate("ministryId", "name code")
    .populate("parentId", "title")
}

export const findAllProjects = async (filter: ProjectFilter, page: number, limit: number) => {
  const skip = (page - 1) * limit
  const projects = await Project.find(filter)
    .populate("ministryId", "name code")
    .sort({ "schedule.planned.startDate": -1 })
    .skip(skip)
    .limit(limit)
  const total = await Project.countDocuments(filter)
  return { projects, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export const updateProject = async (id: string, data: Partial<IProject>) => {
  return await Project.findByIdAndUpdate(id, data, { new: true })
}

export const deleteProject = async (id: string) => {
  // You might want to check for sub-projects before deleting
  return await Project.findByIdAndDelete(id)
}

export const getDashboardStats = async (ministryId?: string) => {
  const matchStage: ProjectFilter = {
    approvalStatus: APPROVAL_STATUS.APPROVED,
  }

  if (ministryId) {
    matchStage.ministryId = new mongoose.Types.ObjectId(ministryId)
  }

  const stats = await Project.aggregate([
    { $match: matchStage },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ])

  const total = await Project.countDocuments(matchStage)

  const result: Record<string, number> = {
    total,
    [PROJECT_STATUS.PLANNED]: 0,
    [PROJECT_STATUS.ONGOING]: 0,
    [PROJECT_STATUS.DELAYED]: 0,
    [PROJECT_STATUS.COMPLETED]: 0,
    [PROJECT_STATUS.ON_HOLD]: 0,
  }

  stats.forEach((stat) => {
    if (stat._id) result[stat._id] = stat.count
  })

  return result
}
