import { APPROVAL_STATUS, IProject } from './project.types';
import { ROLE } from '../auth/auth.types';
import * as projectDb from './project.service.db';
import { logAction } from '../audit/audit.service';

export const createProject = async (data: any, user: any, ipAddress?: string) => {
  if (!user.ministryId) {
    throw new Error('Operators must be associated with a ministry to create a project.');
  }
  const projectData = { ...data, ministryId: user.ministryId, approvalStatus: APPROVAL_STATUS.DRAFT };
  const project = await projectDb.createProject(projectData);
  await logAction({
    action: 'CREATE_PROJECT',
    actor: { userId: user.id, email: user.email, role: user.role },
    targetCollection: 'projects',
    targetDocumentId: (project as any)._id.toString(),
    ipAddress,
  });
  return project;
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

export const updateProject = async (id: string, data: any, user: any, ipAddress?: string) => {
    const project = await projectDb.findProjectById(id);
    if (!project) throw new Error('Project not found');

    if (user.role === ROLE.MINISTRY_OPERATOR && project.ministryId._id.toString() !== user.ministryId.toString()) {
        throw new Error('Access denied: You can only update projects for your own ministry.');
    }

    if (user.role === ROLE.MINISTRY_OPERATOR && data.approvalStatus) {
        delete data.approvalStatus;
    }

    const before: Record<string, any> = {};
    const after: Record<string, any> = {};
    for (const key of Object.keys(data)) {
        before[key] = (project as any)[key];
        after[key] = data[key];
    }

    const updated = await projectDb.updateProject(id, data);
    await logAction({
        action: 'UPDATE_PROJECT',
        actor: { userId: user.id, email: user.email, role: user.role },
        targetCollection: 'projects',
        targetDocumentId: id,
        changes: { before, after },
        ipAddress,
    });
    return updated;
};

export const deleteProject = async (id: string, user?: any, ipAddress?: string) => {
    const project = await projectDb.findProjectById(id);
    if (!project) throw new Error('Project not found');
    const result = await projectDb.deleteProject(id);
    await logAction({
        action: 'DELETE_PROJECT',
        actor: { userId: user?.id, email: user?.email, role: user?.role },
        targetCollection: 'projects',
        targetDocumentId: id,
        ipAddress,
    });
    return result;
};

const changeApprovalStatus = async (id: string, newStatus: APPROVAL_STATUS, action: string, user: any, ipAddress?: string) => {
    const project = await projectDb.findProjectById(id);
    if (!project) throw new Error('Project not found');

    if (user.role === ROLE.MINISTRY_APPROVER && project.ministryId._id.toString() !== user.ministryId.toString()) {
        throw new Error('Access denied: You can only approve projects for your own ministry.');
    }

    const updated = await projectDb.updateProject(id, { approvalStatus: newStatus });
    await logAction({
        action,
        actor: { userId: user.id, email: user.email, role: user.role },
        targetCollection: 'projects',
        targetDocumentId: id,
        changes: { before: { approvalStatus: project.approvalStatus }, after: { approvalStatus: newStatus } },
        ipAddress,
    });
    return updated;
};

export const submitProjectForApproval = async (id: string, user: any, ipAddress?: string) => {
    const project = await projectDb.findProjectById(id);
    if (!project) throw new Error('Project not found');
    if (project.ministryId._id.toString() !== user.ministryId.toString()) {
        throw new Error('Access denied: You can only submit projects for your own ministry.');
    }
    if (project.approvalStatus !== APPROVAL_STATUS.DRAFT && project.approvalStatus !== APPROVAL_STATUS.REJECTED) {
        throw new Error(`Project in '${project.approvalStatus}' status cannot be submitted.`);
    }
    return await changeApprovalStatus(id, APPROVAL_STATUS.PENDING_APPROVAL, 'SUBMIT_PROJECT', user, ipAddress);
};

export const approveProject = (id: string, user: any, ipAddress?: string) => {
    return changeApprovalStatus(id, APPROVAL_STATUS.APPROVED, 'APPROVE_PROJECT', user, ipAddress);
};

export const rejectProject = (id: string, user: any, ipAddress?: string) => {
    return changeApprovalStatus(id, APPROVAL_STATUS.REJECTED, 'REJECT_PROJECT', user, ipAddress);
};

export const attachMediaToProject = async (id: string, url: string, user: any, ipAddress?: string) => {
  const project = await projectDb.findProjectById(id);
  if (!project) throw new Error('Project not found');

  if (user.role === ROLE.MINISTRY_OPERATOR && project.ministryId._id.toString() !== user.ministryId.toString()) {
    throw new Error('Access denied: You can only attach media to projects in your own ministry.');
  }

  const updated = await projectDb.pushMediaUrl(id, url);
  await logAction({
    action: 'ATTACH_MEDIA',
    actor: { userId: user.id, email: user.email, role: user.role },
    targetCollection: 'projects',
    targetDocumentId: id,
    changes: { after: { mediaUrl: url } },
    ipAddress,
  });
  return updated;
};

export const getDashboardStats = (ministryId?: string) => {
    return projectDb.getDashboardStats(ministryId);
};