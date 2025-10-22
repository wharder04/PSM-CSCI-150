import Task from '../models/Task.js';

// POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ ok: true, data: task });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name email').sort({ createdAt: -1 });
    res.json({ ok: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ ok: false, error: 'Task not found' });
    res.json({ ok: true, data: task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ ok: false, error: 'Task not found' });
    res.json({ ok: true, data: { _id: task._id } });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/progress
export const getProgress = async (req, res, next) => {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ status: 'Completed' });
    const percent = total ? Math.round((completed / total) * 100) : 0;
    res.json({ ok: true, data: { completed, total, percent } });
  } catch (err) {
    next(err);
  }
};
