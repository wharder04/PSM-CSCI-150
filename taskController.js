import Task from "../models/Task.js";
import User from "../models/User.js";

async function buildUserMini(userId) {
  if (!userId) return null;

  const user = await User.findById(userId).select("name email");
  if (!user) return null;

  return {
    _id: user._id,
    email: user.email,
    name: user.name,
  };
}

export async function createTask(req, res, next) {
  try {
    const { title, desc, dueDate, priority, assignedTo, status } = req.body;

    const assigneeData = await buildUserMini(req.user._id);
    const assignedToData = assignedTo ? await buildUserMini(assignedTo) : null;

    const task = await Task.create({
      title,
      desc,
      dueDate,
      status: status || (assignedTo ? "Assigned" : "UnAssigned"),
      projectId: req.params.projectId,
      createdBy: req.user._id,
      priority: priority || "Medium",
      assignee: assigneeData,
      assignedTo: assignedToData,
      dateAssigned: new Date(),
      comments: [],
    });

    res.status(201).json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function listTasks(req, res, next) {
  try {
    const filter = req.params.projectId
      ? { projectId: req.params.projectId }
      : {};

    const tasks = await Task.find(filter).sort({
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

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    res.json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const allowed = ["title", "desc", "status", "dueDate", "priority", "order"];
    for (const key of allowed) {
      if (key in req.body) {
        task[key] = req.body[key];
      }
    }

    if ("assignedTo" in req.body) {
      if (req.body.assignedTo) {
        const assignedToData = await buildUserMini(req.body.assignedTo);
        task.assignedTo = assignedToData;

        if (task.status === "UnAssigned") {
          task.status = "Assigned";
        }

        if (!task.dateAssigned) {
          task.dateAssigned = new Date();
        }
      } else {
        task.assignedTo = null;
        if (task.status === "Assigned") {
          task.status = "UnAssigned";
        }
      }
    }

    await task.save();

    res.json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function addTaskComment(req, res, next) {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Comment text is required" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const author = await buildUserMini(req.user._id);

    task.comments.push({
      text: text.trim(),
      createdBy: author,
    });

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