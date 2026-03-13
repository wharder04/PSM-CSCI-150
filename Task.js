
import mongoose, { Schema } from "mongoose";

export const TaskStatus = [
  "UnAssigned",
  "Assigned",
  "InProgress",
  "Testing",
  "Completed",
  "InComplete",
];

const taskCommentSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    createdBy: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: { type: String },
      name: { type: String },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const taskSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    desc: { type: String },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
      index: true,
    },
    dueDate: { type: Date, index: true },
    dateAssigned: { type: Date, index: true },
    assignee: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: { type: String },
      name: { type: String },
    },
    assignedTo: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: { type: String },
      name: { type: String },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: TaskStatus,
      default: "UnAssigned",
      index: true,
    },
    order: { type: Number, default: 0 },
    comments: [taskCommentSchema],
  },
  { timestamps: true }
);

taskSchema.index({ projectId: 1, createdAt: -1 });

export default mongoose.model("Task", taskSchema);