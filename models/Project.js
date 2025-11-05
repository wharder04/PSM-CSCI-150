import mongoose, { Schema } from 'mongoose';

const projectSchema = new Schema({
  name: { type: String, required: true, index: true },
  desc: { type: String },
  startDate: { type: Date },
  dueDate: { type: Date },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

projectSchema.index({ ownerId: 1, createdAt: -1 });

export default mongoose.model('Project', projectSchema);
