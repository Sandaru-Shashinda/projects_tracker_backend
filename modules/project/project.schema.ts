import mongoose, { Schema, Types } from 'mongoose';
import { APPROVAL_STATUS, IProject, KEY_PEOPLE_ROLE, PROJECT_STATUS } from './project.types';
const { ObjectId } = Types;

const ProjectSchema = new Schema<IProject>({
  // --- HIERARCHY & IDENTITY ---
  title: { type: String, required: true, index: true },
  description: { type: String },
  ministryId: { type: ObjectId, ref: 'Ministry', required: true, index: true },
  
  // Sub-project Logic: If this is a sub-project, this field links to the Parent
  parentId: { type: ObjectId, ref: 'Project', default: null, index: true },
  
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [Longitude, Latitude]
  },

  status: { 
    type: String, 
    enum: Object.values(PROJECT_STATUS),
    default: PROJECT_STATUS.PLANNED,
    index: true 
  },

  approvalStatus: { 
    type: String, 
    enum: Object.values(APPROVAL_STATUS),
    default: APPROVAL_STATUS.DRAFT,
    index: true 
  },

  // --- KEY PEOPLE (Your Requirement) ---
  keyPeople: [{
    role: { 
      type: String, 
      enum: Object.values(KEY_PEOPLE_ROLE),
      required: true 
    },
    name: { type: String, required: true },
    designation: { type: String }, // e.g., "Minister of X" or "Director General"
    startDate: { type: Date },
    endDate: { type: Date }, // Null if they are currently in this role
    active: { type: Boolean, default: true }, // False for past directors
    notes: { type: String } // e.g., "Proposed under Vision 2025"
  }],

  // --- TIMELINE TRACKING (Planned vs Actual) ---
  schedule: {
    planned: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    },
    actual: {
      startDate: { type: Date },
      expectedCompletionDate: { type: Date }, // Auto-updated based on progress
      completionDate: { type: Date } // Filled only when 100% done
    },
    delayReason: { type: String }, // Mandatory if status === 'Delayed'
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 }
  },

  // --- FINANCIAL ---
  budget: {
    currency: { type: String, default: 'LKR' },
    allocated: { type: Number, default: 0 },
    spent: { type: Number, default: 0 }
  }
}, { timestamps: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);