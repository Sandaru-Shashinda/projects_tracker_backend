import { APPROVAL_STATUS, IProject } from './project.types';
import { ROLE } from '../auth/auth.types';
import * as projectDb from './project.service.db';

export const createProject = async (data: any, user: any) => {
  if (!user.ministryId) {
    throw new Error('Operators must be associated with a ministry to create a project.');
  }
  const projectData = { ...data, ministryId: user.ministryId, approvalStatus: APPROVAL_STATUS.DRAFT };
  return await projectDb.createProject(projectData);
};

export const getAllProjects = async (query: any, user: any) => {
    const { page, limit, search, ...filters } = query;
    const dbQuery = { ...filters };

    // Role-based filtering for data visibility
    if (!user || user.role === ROLE.PUBLIC_USER) {
        dbQuery.approvalStatus = APPROVAL_STATUS.APPROVED;
    } else if (user.role === ROLE.MINISTRY_OPERATOR || user.role === ROLE.MINISTRY_APPROVER) {
        dbQuery.ministryId = user.ministryId;
    } // SUPER_ADMIN can see all projects without filters

    if (search) {
        dbQuery.title = { $regex: search, $options: 'i' };
    }

    return await projectDb.findAllProjects(dbQuery, page, limit);
};

export const getProjectById = async (id: string, user: any) => {
    const project = await projectDb.findProjectById(id);
    if (!project) throw new Error('Project not found');

    // Role-based access control
    if (!user || user.role === ROLE.PUBLIC_USER) {
        if (project.approvalStatus !== APPROVAL_STATUS.APPROVED) {
            throw new Error('Project not found or not approved for public view');
        }
    } else if (user.role === ROLE.MINISTRY_OPERATOR || user.role === ROLE.MINISTRY_APPROVER) {
        if (project.ministryId._id.toString() !== user.ministryId.toString()) {
            throw new Error('Access denied: You do not have permission to view this project');
        }
    } // SUPER_ADMIN can view all

    return project;
};

export const updateProject = async (id: string, data: any, user: any) => {
    const project = await projectDb.findProjectById(id);
    if (!project) throw new Error('Project not found');

    // Ownership check
    if (user.role === ROLE.MINISTRY_OPERATOR && project.ministryId._id.toString() !== user.ministryId.toString()) {
        throw new Error('Access denied: You can only update projects for your own ministry.');
    }

    // Prevent operators from changing approval status directly
    if (user.role === ROLE.MINISTRY_OPERATOR && data.approvalStatus) {
        delete data.approvalStatus;
    }

    return await projectDb.updateProject(id, data);
};

export const deleteProject = async (id: string) => {
    const project = await projectDb.findProjectById(id);
    if (!project) throw new Error('Project not found');
    return await projectDb.deleteProject(id);
};

const changeApprovalStatus = async (id: string, newStatus: APPROVAL_STATUS, user: any) => {
    const project = await projectDb.findProjectById(id);
    if (!project) throw new Error('Project not found');

    // Ownership check for approvers
    if (user.role === ROLE.MINISTRY_APPROVER && project.ministryId._id.toString() !== user.ministryId.toString()) {
        throw new Error('Access denied: You can only approve projects for your own ministry.');
    }

    return await projectDb.updateProject(id, { approvalStatus: newStatus });
}

export const submitProjectForApproval = async (id: string, user: any) => {
    const project = await projectDb.findProjectById(id);
    if (!project) throw new Error('Project not found');
    if (project.ministryId._id.toString() !== user.ministryId.toString()) {
        throw new Error('Access denied: You can only submit projects for your own ministry.');
    }
    if (project.approvalStatus !== APPROVAL_STATUS.DRAFT && project.approvalStatus !== APPROVAL_STATUS.REJECTED) {
        throw new Error(`Project in '${project.approvalStatus}' status cannot be submitted.`);
    }
    return await changeApprovalStatus(id, APPROVAL_STATUS.PENDING_APPROVAL, user);
};

export const approveProject = (id: string, user: any) => {
    return changeApprovalStatus(id, APPROVAL_STATUS.APPROVED, user);
};

export const rejectProject = (id: string, user: any) => {
    return changeApprovalStatus(id, APPROVAL_STATUS.REJECTED, user);
};

export const getDashboardStats = (ministryId?: string) => {
    return projectDb.getDashboardStats(ministryId);
};