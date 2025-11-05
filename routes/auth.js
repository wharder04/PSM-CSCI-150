const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { signJwt, setAuthCookie, clearAuthCookie } = require('../utils/tokens');
const auth = require('../middleware/auth');
const { authLimiter, resetLimiter } = require('../middleware/limit');
const { validateBody, schemas } = require('../middleware/validate');
const { sendPasswordReset } = require('../services/email');

const router = express.Router();

// REGISTER
router.post('/register', authLimiter, validateBody(schemas.register), async (req, res) => {
  const { email, password, name } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, name });
  const token = signJwt({ sub: user._id.toString() }, process.env.JWT_EXPIRES_SHORT);
  setAuthCookie(res, token, false);
  res.status(201).json({ message: 'Registered', user: { id: user._id, email: user.email, name: user.name } });
});

// LOGIN
router.post('/login', authLimiter, validateBody(schemas.login), async (req, res) => {
  const { email, password, remember } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const exp = remember ? process.env.JWT_EXPIRES_LONG : process.env.JWT_EXPIRES_SHORT;
  const token = signJwt({ sub: user._id.toString() }, exp);
  setAuthCookie(res, token, !!remember);
  res.json({ message: 'Logged in', remember: !!remember });
});

// LOGOUT
router.post('/logout', auth, (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
});

// ME
router.get('/me', auth, (req, res) => {
  const { _id, email, name } = req.user;
  res.json({ id: _id, email, name });
});

// FORGOT PASSWORD
router.post('/forgot-password', resetLimiter, validateBody(schemas.forgot), async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Always respond success to avoid account enumeration
  if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

  // Make token and store hash
  const raw = crypto.randomBytes(32).toString('hex'); // send raw
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const ttlMin = parseInt(process.env.RESET_TOKEN_TTL_MIN || '30', 10);
  const expiresAt = new Date(Date.now() + ttlMin*60*1000);

  await PasswordResetToken.deleteMany({ userId: user._id }); // one active
  await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${raw}`;
  await sendPasswordReset(user.email, resetUrl);

  res.json({ message: 'If that email exists, a reset link was sent.' });
});

// RESET PASSWORD
router.post('/reset-password', validateBody(schemas.reset), async (req, res) => {
  const { token, password } = req.body;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const doc = await PasswordResetToken.findOne({ tokenHash, usedAt: { $exists: false } });
  if (!doc) return res.status(400).json({ error: 'Invalid or expired reset token' });
  if (doc.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid or expired reset token' });

  const user = await User.findById(doc.userId);
  if (!user) return res.status(400).json({ error: 'Invalid token' });

  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordChangedAt = new Date();
  await user.save();

  doc.usedAt = new Date();
  await doc.save();

  // optional: auto-login after reset
  const tokenJwt = signJwt({ sub: user._id.toString() }, process.env.JWT_EXPIRES_SHORT);
  setAuthCookie(res, tokenJwt, false);

  res.json({ message: 'Password reset successful' });
});

module.exports = router;
