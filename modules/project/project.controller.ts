import { Response } from "express"
import { ZodError } from "zod"
import * as projectService from "./project.service"
import {
  createProjectSchema,
  updateProjectSchema,
  filterQuerySchema,
  projectIdSchema,
} from "./project.validation"
import { AuthRequest } from "../auth/auth.middleware"
import { ROLE } from "../auth/auth.types"

const handleZodError = (res: Response, error: ZodError) =>
  res.status(400).json({ errors: error.issues })

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createProjectSchema.parse(req.body)
    const project = await projectService.createProject(validatedData, req.user)
    res.status(201).json(project)
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error)
    res.status(400).json({ message: error.message })
  }
}

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const validatedQuery = filterQuerySchema.parse(req.query)
    const result = await projectService.getAllProjects(validatedQuery, req.user)
    res.json(result)
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error)
    res.status(500).json({ message: error.message })
  }
}

export const getOne = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = projectIdSchema.parse(req.params)
    const project = await projectService.getProjectById(id, req.user)
    res.json(project)
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error)
    res.status(404).json({ message: error.message })
  }
}

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = projectIdSchema.parse(req.params)
    const validatedData = updateProjectSchema.parse(req.body)
    const updatedProject = await projectService.updateProject(id, validatedData, req.user)
    res.json(updatedProject)
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error)
    res.status(403).json({ message: error.message })
  }
}

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = projectIdSchema.parse(req.params)
    await projectService.deleteProject(id)
    res.json({ message: "Project deleted successfully" })
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error)
    res.status(400).json({ message: error.message })
  }
}

export const submit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = projectIdSchema.parse(req.params)
    const project = await projectService.submitProjectForApproval(id, req.user)
    res.json({ message: "Project submitted for approval", project })
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error)
    res.status(403).json({ message: error.message })
  }
}

export const approve = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = projectIdSchema.parse(req.params)
    const project = await projectService.approveProject(id, req.user)
    res.json({ message: "Project approved successfully", project })
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error)
    res.status(403).json({ message: error.message })
  }
}

export const reject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = projectIdSchema.parse(req.params)
    const project = await projectService.rejectProject(id, req.user)
    res.json({ message: "Project rejected", project })
  } catch (error: any) {
    if (error instanceof ZodError) return handleZodError(res, error)
    res.status(403).json({ message: error.message })
  }
}

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    let ministryId: string | undefined
    if (
      req.user &&
      (req.user.role === ROLE.MINISTRY_APPROVER || req.user.role === ROLE.MINISTRY_OPERATOR)
    ) {
      ministryId = req.user.ministryId
    }
    const stats = await projectService.getDashboardStats(ministryId)
    res.json(stats)
  } catch (error: any) {
    res.status(500).json({ message: "Failed to retrieve dashboard stats" })
  }
}
