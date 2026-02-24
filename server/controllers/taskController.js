import Task from "../models/Task.js";
import User from "../models/User.js";

export async function createTask(req, res, next) {
  try {
    console.log("body: ", req.body);
    const { title, desc, dueDate, priority, assignedTo, status: requestedStatus } = req.body;

    // Fetch assignee (current user) data
    const assigneeUser = await User.findById(req.user._id).select("name email");
    const assigneeData = assigneeUser ? {
      _id: assigneeUser._id,
      email: assigneeUser.email,
      name: assigneeUser.name
    } : null;

    // Fetch assignedTo user data if provided
    let assignedToData = null;
    if (assignedTo) {
      const assignedToUser = await User.findById(assignedTo).select("name email");
      if (assignedToUser) {
        assignedToData = {
          _id: assignedToUser._id,
          email: assignedToUser.email,
          name: assignedToUser.name
        };
      }
    }

    // If the client provides a status (ex: from the modal dropdown), honor it if valid.
    // Otherwise, infer it from whether there's an assignee.
    const status =
      typeof requestedStatus === "string" && Task.schema.path("status")?.enumValues?.includes(requestedStatus)
        ? requestedStatus
        : assignedTo
        ? "Assigned"
        : "UnAssigned";

    // Place new task at the end of its column
    const max = await Task.find({ projectId: req.params.projectId, status })
      .sort({ order: -1 })
      .limit(1)
      .select("order");
    const nextOrder = (max?.[0]?.order ?? 0) + 1000;

    const task = await Task.create({
      title,
      desc,
      dueDate,
      status,
      projectId: req.params.projectId,
      createdBy: req.user._id,
      priority: priority,
      assignee: assigneeData,
      assignedTo: assignedToData,
      dateAssigned: new Date(),
      order: nextOrder,
    });

    res.status(201).json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function listTasks(req, res, next) {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId }).sort({
      status: 1,
      order: 1,
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
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const allowed = ["title", "desc", "status", "dueDate", "priority", "order"];

    // Track if status changed so we can set a reasonable default order
    const prevStatus = task.status;
    for (const k of allowed) if (k in req.body) task[k] = req.body[k];

    // Handle assignedTo update with user data
    if ("assignedTo" in req.body) {
      if (req.body.assignedTo) {
        const assignedToUser = await User.findById(req.body.assignedTo).select("name email");
        if (assignedToUser) {
          task.assignedTo = {
            _id: assignedToUser._id,
            email: assignedToUser.email,
            name: assignedToUser.name
          };
          if (task.status === "UnAssigned") {
            task.status = "Assigned";
          }
          if (!task.dateAssigned) {
            task.dateAssigned = new Date();
          }
        }
      } else {
        task.assignedTo = null;
        if (task.status === "Assigned") {
          task.status = "UnAssigned";
        }
      }
    }

    // If the column/status changed but an explicit order wasn't provided,
    // push the task to the end of the destination column.
    const statusChanged = task.status !== prevStatus;
    const orderProvided = Object.prototype.hasOwnProperty.call(req.body, "order");
    if (statusChanged && !orderProvided) {
      const max = await Task.find({ projectId: task.projectId, status: task.status })
        .sort({ order: -1 })
        .limit(1)
        .select("order");
      task.order = (max?.[0]?.order ?? 0) + 1000;
    }

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
