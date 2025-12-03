import Task from "../models/Task.js";

export async function createTask(req, res, next) {
  try {
    const { title, desc, dueDate } = req.body;

    const task = await Task.create({
      title,
      desc,
      dueDate,
      projectId: req.params.projectId,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function listTasks(req, res, next) {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, data: tasks });
  } catch (e) {
    next(e);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.taskId);

    res.json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.taskId);

    const allowed = ["title", "desc", "status", "dueDate"];
    for (const k of allowed) if (k in req.body) task[k] = req.body[k];

    await task.save();
    res.json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function deleteTask(req, res, next) {
  try {
    await Task.deleteOne({ _id: req.params.taskId });
    res.json({ success: true, data: { _id: req.params.taskId } });
  } catch (e) {
    next(e);
  }
}
