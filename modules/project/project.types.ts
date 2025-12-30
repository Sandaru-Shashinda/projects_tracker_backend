import { Document, Types } from "mongoose"

export enum PROJECT_STATUS {
  PLANNED = "Planned",
  ONGOING = "Ongoing",
  DELAYED = "Delayed",
  COMPLETED = "Completed",
  ON_HOLD = "OnHold",
}

export enum APPROVAL_STATUS {
  DRAFT = "Draft",
  PENDING_APPROVAL = "PendingApproval",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export enum KEY_PEOPLE_ROLE {
  PROPONENT = "PROPONENT",
  PROJECT_DIRECTOR = "PROJECT_DIRECTOR",
  IMPLEMENTATION_OFFICER = "IMPLEMENTATION_OFFICER",
}

export interface IKeyPerson {
  role: KEY_PEOPLE_ROLE
  name: string
  designation?: string
  startDate?: Date
  endDate?: Date
  active: boolean
  notes?: string
}

export interface ISchedule {
  planned: {
    startDate: Date
    endDate: Date
  }
  actual: {
    startDate?: Date
    expectedCompletionDate?: Date
    completionDate?: Date
  }
  delayReason?: string
  progressPercentage: number
}

export interface IBudget {
  currency: string
  allocated: number
  spent: number
}

export interface IProject extends Document {
  title: string
  description?: string
  ministryId: Types.ObjectId
  parentId?: Types.ObjectId
  location: { type: string; coordinates: number[] }
  status: PROJECT_STATUS
  approvalStatus: APPROVAL_STATUS
  keyPeople: IKeyPerson[]
  schedule: ISchedule
  budget: IBudget
  createdAt: Date
  updatedAt: Date
}
