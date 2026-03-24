import User from '../models/User.js';

// GET /api/profile/me
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ ok: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile/me
export const updateProfile = async (req, res, next) => {
  try {
    const fields = ['name', 'bio', 'course', 'status', 'password'];
    const update = {};
    for (const key of fields) if (key in req.body) update[key] = req.body[key];

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ ok: true, data: user });
  } catch (err) {
    next(err);
  }
};
