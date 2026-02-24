import mongoose, { Schema } from 'mongoose';

export const TaskStatus = [
  'UnAssigned', 'Assigned', 'InProgress', 'Testing', 'Completed', 'InComplete'
];

const taskSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  title: { type: String, required: true },
  desc: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low', index: true },
  dueDate: { type: Date, index: true },
  dateAssigned: { type: Date, index: true },
  assignee: {
    _id: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    name: { type: String }
  },
  assignedTo: {
    _id: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    name: { type: String }
  },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: TaskStatus, default: 'UnAssigned', index: true },

  // Used for ordering tasks within a status column (drag/drop)
  order: { type: Number, default: 0, index: true }
}, { timestamps: true });

taskSchema.index({ projectId: 1, status: 1, order: 1, createdAt: -1 });

export default mongoose.model('Task', taskSchema);
