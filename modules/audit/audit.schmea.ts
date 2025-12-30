import mongoose, { Schema, Types } from 'mongoose';
const { ObjectId } = Types;

const AuditLogSchema = new Schema({
  action: { type: String, required: true }, // e.g., "UPDATE_STATUS", "CHANGE_DIRECTOR"
  
  actor: {
    userId: { type: ObjectId, ref: 'User' },
    email: { type: String }, // Snapshot in case user is deleted later
    role: { type: String }
  },
  
  target: {
    collection: { type: String, required: true }, // "projects"
    documentId: { type: ObjectId, required: true }
  },
  
  changes: { type: Object }, // Store the diff { old: "Planned", new: "Ongoing" }
  
  ipAddress: { type: String }
}, { timestamps: true }); // Automatically adds createdAt

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);