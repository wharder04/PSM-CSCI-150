import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id name email');
    if (!user) return res.status(401).json({ ok: false, error: 'User not found' });

    req.user = user; // attach minimal user context
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Token invalid or expired' });
  }
};
