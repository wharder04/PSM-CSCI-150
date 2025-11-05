// models/PasswordResetToken.js  — ESM
import mongoose from 'mongoose';

const prtSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  usedAt:    { type: Date }
}, { timestamps: true });

export default mongoose.model('PasswordResetToken', prtSchema);
