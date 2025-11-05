import mongoose, { Schema } from 'mongoose';

const projectMemberSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  memberId:  { type: Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
  isActive:  { type: Boolean, default: true },
  addDate:   { type: Date, default: Date.now },
  modifiedDate: { type: Date }
}, { timestamps: true });

projectMemberSchema.index({ projectId: 1, memberId: 1 }, { unique: true });

export default mongoose.model('ProjectMember', projectMemberSchema);
