import mongoose, { Schema } from "mongoose";

const discussionMessageSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    sender: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
      email: { type: String },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const projectSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    desc: { type: String },
    startDate: { type: Date },
    dueDate: { type: Date },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // NEW: project-wide discussion board messages
    discussionMessages: [discussionMessageSchema],
  },
  { timestamps: true }
);

projectSchema.index({ ownerId: 1, createdAt: -1 });

export default mongoose.model("Project", projectSchema);