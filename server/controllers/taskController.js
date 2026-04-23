import Task from "../models/Task.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import createNotification from "../utils/createNotification.js";

function sameId(a, b) {
  return String(a || "") === String(b || "");
}

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

async function getProjectAccess(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return null;

  const isAdmin = sameId(project.ownerId, userId);
  if (isAdmin) {
    return {
      project,
      isAdmin: true,
      memberRecord: null,
      canManageTasks: true,
    };
  }

  const member = await ProjectMember.findOne({
    projectId,
    memberId: userId,
    isActive: true,
  });

  if (!member) return null;

  return {
    project,
    isAdmin: false,
    memberRecord: member,
    canManageTasks: !!member.canManageTasks,
  };
}

async function getTaskAccess(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) {
    return {
      task: null,
      project: null,
      isAdmin: false,
      memberRecord: null,
      canManageTasks: false,
    };
  }

  const access = await getProjectAccess(task.projectId, userId);
  if (!access) {
    return {
      task,
      project: null,
      isAdmin: false,
      memberRecord: null,
      canManageTasks: false,
    };
  }

  return {
    task,
    project: access.project,
    isAdmin: access.isAdmin,
    memberRecord: access.memberRecord,
    canManageTasks: access.canManageTasks,
  };
}

function canMoveTask(task, userId) {
  const assignedId = task?.assignedTo?._id || task?.assignedTo;
  if (!assignedId) return false;
  return sameId(assignedId, userId);
}

export async function createTask(req, res, next) {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ success: false, error: "Project id is required" });
    }

    const access = await getProjectAccess(projectId, req.user._id);
    if (!access) {
      return res.status(403).json({
        success: false,
        error: "Not allowed to create tasks for this project",
      });
    }

    if (!access.canManageTasks) {
      return res.status(403).json({
        success: false,
        error: "You are not allowed to create tasks in this project",
      });
    }

    const { title, desc, dueDate, priority } = req.body;

    const incomingAssignedUserId = req.body.assignedTo || req.body.assignee || null;
    const assignedToData = incomingAssignedUserId
      ? await buildUserMini(incomingAssignedUserId)
      : null;

    if (incomingAssignedUserId && !assignedToData) {
      return res.status(404).json({
        success: false,
        error: "Assigned user does not exist",
      });
    }

    const task = await Task.create({
      title,
      desc,
      dueDate,
      priority: priority || "Medium",
      projectId,
      createdBy: req.user._id,
      assignedTo: assignedToData,
      assignee: assignedToData,
      dateAssigned: assignedToData ? new Date() : null,
      status: assignedToData ? "Assigned" : "UnAssigned",
      order: assignedToData ? 1000 : 0,
      comments: [],
    });

    if (assignedToData && !sameId(assignedToData._id, req.user._id)) {
      await createNotification({
        user: assignedToData._id,
        actor: req.user._id,
        project: projectId,
        task: task._id,
        type: "task_assigned",
        message: `${req.user.name} assigned you to task "${task.title}".`,
      });
    }

    res.status(201).json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function listTasks(req, res, next) {
  try {
    const filter = req.params.projectId ? { projectId: req.params.projectId } : {};

    if (req.params.projectId) {
      const access = await getProjectAccess(req.params.projectId, req.user._id);
      if (!access) {
        return res.status(403).json({
          success: false,
          error: "Not allowed to view these tasks",
        });
      }
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (e) {
    next(e);
  }
}

export async function getTask(req, res, next) {
  try {
    const { task, project } = await getTaskAccess(req.params.taskId, req.user._id);

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    if (!project) {
      return res.status(403).json({ success: false, error: "Not allowed to view this task" });
    }

    res.json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function updateTask(req, res, next) {
  try {
    const { task, project, canManageTasks } = await getTaskAccess(
      req.params.taskId,
      req.user._id
    );

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    if (!project) {
      return res.status(403).json({ success: false, error: "Not allowed to update this task" });
    }

    const workflowOnlyMove =
      ("status" in req.body &&
        !("title" in req.body) &&
        !("desc" in req.body) &&
        !("priority" in req.body) &&
        !("dueDate" in req.body) &&
        !("assignedTo" in req.body) &&
        !("assignee" in req.body)) ||
      ("order" in req.body &&
        !("title" in req.body) &&
        !("desc" in req.body) &&
        !("priority" in req.body) &&
        !("dueDate" in req.body) &&
        !("assignedTo" in req.body) &&
        !("assignee" in req.body));

    if (!workflowOnlyMove && !canManageTasks) {
      return res.status(403).json({
        success: false,
        error: "You are not allowed to edit tasks in this project",
      });
    }

    const allowedFields = ["title", "desc", "dueDate", "priority"];
    for (const field of allowedFields) {
      if (field in req.body) {
        task[field] = req.body[field];
      }
    }

    const previousAssignedToId = task?.assignedTo?._id || task?.assignedTo || null;
    const previousStatus = task.status;

    const incomingAssignedUserId =
      ("assignedTo" in req.body ? req.body.assignedTo : undefined) ??
      ("assignee" in req.body ? req.body.assignee : undefined);

    if (incomingAssignedUserId !== undefined) {
      if (incomingAssignedUserId && String(incomingAssignedUserId).trim() !== "") {
        const assignedToData = await buildUserMini(incomingAssignedUserId);

        if (!assignedToData) {
          return res.status(404).json({
            success: false,
            error: "Assigned user does not exist",
          });
        }

        task.assignedTo = assignedToData;
        task.assignee = assignedToData;
        task.dateAssigned = new Date();
        task.status = previousStatus === "UnAssigned" ? "Assigned" : task.status;

        if (!task.order || task.order === 0) {
          task.order = 1000;
        }
      } else {
        task.assignedTo = null;
        task.assignee = null;
        task.status = "UnAssigned";
        task.order = 0;
      }
    }

    const nextAssignedToId = task?.assignedTo?._id || task?.assignedTo || null;
    const wantsWorkflowMove =
      ("status" in req.body && req.body.status !== previousStatus) || "order" in req.body;

    if (wantsWorkflowMove) {
      if (!nextAssignedToId) {
        task.status = "UnAssigned";
        task.order = 0;
      } else {
        if (!canMoveTask(task, req.user._id)) {
          return res.status(403).json({
            success: false,
            error: "Only the assigned user can move this task.",
          });
        }

        if ("status" in req.body) {
          const nextStatus = req.body.status;

          if (nextStatus === "UnAssigned") {
            return res.status(400).json({
              success: false,
              error: "Tasks cannot be dragged back to Unassigned. Remove the assignee instead.",
            });
          }

          task.status = nextStatus;
        }

        if ("order" in req.body) {
          task.order = req.body.order;
        }
      }
    }

    if (!nextAssignedToId) {
      task.status = "UnAssigned";
      task.order = 0;
    }

    await task.save();

    if (
      nextAssignedToId &&
      !sameId(previousAssignedToId, nextAssignedToId) &&
      !sameId(nextAssignedToId, req.user._id)
    ) {
      await createNotification({
        user: nextAssignedToId,
        actor: req.user._id,
        project: task.projectId,
        task: task._id,
        type: "task_assigned",
        message: `${req.user.name} assigned you to task "${task.title}".`,
      });
    }

    res.json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function addTaskComment(req, res, next) {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Comment text is required",
      });
    }

    const { task, project } = await getTaskAccess(req.params.taskId, req.user._id);

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    if (!project) {
      return res.status(403).json({
        success: false,
        error: "Not allowed to comment on this task",
      });
    }

    const author = await buildUserMini(req.user._id);

    task.comments.push({
      text: text.trim(),
      createdBy: author,
    });

    await task.save();

    const assignedUserId = task?.assignedTo?._id || task?.assignedTo || null;

    if (assignedUserId && !sameId(assignedUserId, req.user._id)) {
      await createNotification({
        user: assignedUserId,
        actor: req.user._id,
        project: task.projectId,
        task: task._id,
        type: "task_comment",
        message: `${req.user.name} commented on task "${task.title}".`,
      });
    }

    res.json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { task, project, isAdmin } = await getTaskAccess(req.params.taskId, req.user._id);

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    if (!project) {
      return res.status(403).json({ success: false, error: "Not allowed to delete this task" });
    }

    if (!isAdmin && !sameId(task.createdBy, req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only the project admin or task creator can delete this task.",
      });
    }

    await Task.deleteOne({ _id: req.params.taskId });

    res.json({ success: true, data: { _id: req.params.taskId } });
  } catch (e) {
    next(e);
  }
}
