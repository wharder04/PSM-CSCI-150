
import mongoose, { Schema } from 'mongoose';

export const TaskStatus = [
  'UnAssigned','Assigned','InProgress','Testing','Completed','InComplete'
];

const taskSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title:     { type: String, required: true },
  desc:      { type: String },
  priority:  { type: String, enum: ['Low','Medium','High'], default: 'Low', index: true },
  dueDate:   { type: Date, index: true },

  assignee:  { type: Schema.Types.ObjectId, ref: 'User' },   // who is responsible
  assignedTo:{ type: Schema.Types.ObjectId, ref: 'User' },   // alias if you want both fields

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status:    { type: String, enum: TaskStatus, default: 'UnAssigned', index: true }
}, { timestamps: true });

taskSchema.index({ projectId: 1, createdAt: -1 });

export default mongoose.model('Task', taskSchema);
