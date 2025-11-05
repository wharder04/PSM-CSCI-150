import Task from '../models/Task.js';

// CREATE
export async function createTask(req, res, next) {
  try {
    const payload = {
      ...req.body,
      projectId: req.params.projectId || req.body.projectId,
      createdBy: req.user?._id
    };
    const task = await Task.create(payload);
    res.status(201).json({ ok: true, data: task });
  } catch (err) { next(err); }
}

// LIST
export async function listTasks(req, res, next) {
  try {
    const q = {};
    if (req.params.projectId) q.projectId = req.params.projectId;
    if (req.query.status) q.status = req.query.status;
    if (req.query.priority) q.priority = req.query.priority;
    if (req.query.assignee) q.assignee = req.query.assignee;
    const tasks = await Task.find(q).populate('assignee', 'name email').sort({ createdAt: -1 });
    res.json({ ok: true, data: tasks });
  } catch (err) { next(err); }
}
export { listTasks as getTasks }; // alias for any older imports

// READ
export async function getTask(req, res, next) {
  try {
    const f = { _id: req.params.taskId };
    if (req.params.projectId) f.projectId = req.params.projectId;
    const task = await Task.findOne(f);
    if (!task) return res.status(404).json({ ok: false, error: 'Task not found' });
    res.json({ ok: true, data: task });
  } catch (err) { next(err); }
}

// UPDATE
export async function updateTask(req, res, next) {
  try {
    const f = { _id: req.params.taskId };
    if (req.params.projectId) f.projectId = req.params.projectId;
    const task = await Task.findOneAndUpdate(f, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ ok: false, error: 'Task not found' });
    res.json({ ok: true, data: task });
  } catch (err) { next(err); }
}

// DELETE
export async function deleteTask(req, res, next) {
  try {
    const f = { _id: req.params.taskId };
    if (req.params.projectId) f.projectId = req.params.projectId;
    const task = await Task.findOneAndDelete(f);
    if (!task) return res.status(404).json({ ok: false, error: 'Task not found' });
    res.json({ ok: true, data: { _id: task._id } });
  } catch (err) { next(err); }
}

// PROGRESS
export async function getProgress(req, res, next) {
  try {
    const f = {};
    if (req.params.projectId) f.projectId = req.params.projectId;
    const total = await Task.countDocuments(f);
    const completed = await Task.countDocuments({ ...f, status: 'Completed' });
    const percent = total ? Math.round((completed / total) * 100) : 0;
    res.json({ ok: true, data: { completed, total, percent } });
  } catch (err) { next(err); }
}
