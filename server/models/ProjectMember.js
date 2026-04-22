import mongoose from "mongoose";

const ProjectMemberSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    canManageTasks: {
      type: Boolean,
      default: true,
    },
    addDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

ProjectMemberSchema.index({ projectId: 1, memberId: 1 }, { unique: true });

const ProjectMember =
  mongoose.models?.ProjectMember ||
  mongoose.model("ProjectMember", ProjectMemberSchema);

export default ProjectMember;