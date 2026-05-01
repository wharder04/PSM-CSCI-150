import mongoose from "mongoose";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import createNotification from "../utils/createNotification.js";
import Notification from "../models/Notificationmodel.js";
import {
  getUnassignedMini,
  getUnassignedUser,
  isSystemPlaceholderUser,
  isUnassignedInput,
  isUnassignedMini,
  sameId,
} from "../utils/systemUsers.js";

function normalizeId(value) {
  if (!value) return null;
  if (typeof value === "object") return value._id || null;
  return value;
}

async function buildUserMini(userId) {
  if (isUnassignedInput(userId)) return getUnassignedMini();

  if (!mongoose.Types.ObjectId.isValid(String(userId))) return null;

  const user = await User.findById(userId).select("name email isSystemPlaceholder systemKey");
  if (!user) return null;

  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    isSystemPlaceholder: !!user.isSystemPlaceholder,
    systemKey: user.systemKey || null,
  };
}

async function getProjectAccess(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return null;

  const isAdmin = sameId(project.ownerId, userId);

  if (isAdmin) {
    return { project, isAdmin: true, memberRecord: null, canManageTasks: true };
  }

  const member = await ProjectMember.findOne({ projectId, memberId: userId, isActive: true });
  if (!member) return null;

  return { project, isAdmin: false, memberRecord: member, canManageTasks: !!member.canManageTasks };
}

async function getTaskAccess(taskId, userId) {
  const task = await Task.findById(taskId);

  if (!task) {
    return { task: null, project: null, isAdmin: false, memberRecord: null, canManageTasks: false };
  }

  const access = await getProjectAccess(task.projectId, userId);
  if (!access) {
    return { task, project: null, isAdmin: false, memberRecord: null, canManageTasks: false };
  }

  return {
    task,
    project: access.project,
    isAdmin: access.isAdmin,
    memberRecord: access.memberRecord,
    canManageTasks: access.canManageTasks,
  };
}

function taskAssignedMini(task) {
  return task?.assignedTo || task?.assignee || null;
}

function getRealAssignedUserId(task) {
  const assigned = taskAssignedMini(task);
  if (!assigned || isUnassignedMini(assigned) || isSystemPlaceholderUser(assigned)) return null;
  return normalizeId(assigned);
}

function canMoveTask(task, userId) {
  const assignedId = getRealAssignedUserId(task);
  if (!assignedId) return false;
  return sameId(assignedId, userId);
}

async function applyUnassignedState(task) {
  const unassignedMini = await getUnassignedMini();
  task.assignedTo = unassignedMini;
  task.assignee = unassignedMini;
  task.dateAssigned = null;
  task.status = "UnAssigned";
  task.order = 0;
}

function applyAssignedState(task, assignedToData, previousStatus) {
  task.assignedTo = assignedToData;
  task.assignee = assignedToData;
  task.dateAssigned = new Date();

  if (!previousStatus || previousStatus === "UnAssigned") {
    task.status = "Assigned";
  }

  if (!task.order || task.order === 0) {
    task.order = 1000;
  }
}

export async function createTask(req, res, next) {
  try {
    await getUnassignedUser();

    const projectId = req.params.projectId || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ success: false, error: "Project id is required" });
    }

    const access = await getProjectAccess(projectId, req.user._id);
    if (!access) {
      return res.status(403).json({ success: false, error: "Not allowed to create tasks for this project" });
    }

    if (!access.canManageTasks) {
      return res.status(403).json({ success: false, error: "You are not allowed to create tasks in this project" });
    }

    const { title, desc, dueDate, priority } = req.body;
    const incomingAssignedUserId = "assignedTo" in req.body ? req.body.assignedTo : req.body.assignee;
    const assignedToData = await buildUserMini(incomingAssignedUserId);

    if (!assignedToData) {
      return res.status(404).json({ success: false, error: "Assigned user does not exist" });
    }

    const isUnassigned = isUnassignedMini(assignedToData);

    const task = await Task.create({
      title,
      desc,
      dueDate,
      priority: priority || "Medium",
      projectId,
      createdBy: req.user._id,
      assignedTo: assignedToData,
      assignee: assignedToData,
      dateAssigned: isUnassigned ? null : new Date(),
      status: isUnassigned ? "UnAssigned" : "Assigned",
      order: isUnassigned ? 0 : 1000,
      comments: [],
    });

    if (!isUnassigned && !sameId(assignedToData._id, req.user._id)) {
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
    await getUnassignedUser();

    const filter = req.params.projectId ? { projectId: req.params.projectId } : {};

    if (req.params.projectId) {
      const access = await getProjectAccess(req.params.projectId, req.user._id);
      if (!access) {
        return res.status(403).json({ success: false, error: "Not allowed to view these tasks" });
      }
    }

    const tasks = await Task.find(filter).sort({ status: 1, order: 1, createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (e) {
    next(e);
  }
}

export async function getTask(req, res, next) {
  try {
    const { task, project } = await getTaskAccess(req.params.taskId, req.user._id);

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (!project) return res.status(403).json({ success: false, error: "Not allowed to view this task" });

    res.json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function updateTask(req, res, next) {
  try {
    await getUnassignedUser();

    const { task, project, canManageTasks } = await getTaskAccess(req.params.taskId, req.user._id);

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (!project) return res.status(403).json({ success: false, error: "Not allowed to update this task" });

    const isOnlyWorkflowMove =
      ("status" in req.body || "order" in req.body) &&
      !("title" in req.body) &&
      !("desc" in req.body) &&
      !("priority" in req.body) &&
      !("dueDate" in req.body) &&
      !("assignedTo" in req.body) &&
      !("assignee" in req.body);

    if (!isOnlyWorkflowMove && !canManageTasks) {
      return res.status(403).json({ success: false, error: "You are not allowed to edit tasks in this project" });
    }

    const previousAssignedToId = getRealAssignedUserId(task);
    const previousStatus = task.status;

    for (const field of ["title", "desc", "dueDate", "priority"]) {
      if (field in req.body) task[field] = req.body[field];
    }

    const hasAssignedToUpdate = "assignedTo" in req.body || "assignee" in req.body;

    if (hasAssignedToUpdate) {
      const incomingAssignedUserId = "assignedTo" in req.body ? req.body.assignedTo : req.body.assignee;

      if (isUnassignedInput(incomingAssignedUserId)) {
        await applyUnassignedState(task);
      } else {
        const assignedToData = await buildUserMini(incomingAssignedUserId);
        if (!assignedToData || isUnassignedMini(assignedToData)) {
          return res.status(404).json({ success: false, error: "Assigned user does not exist" });
        }
        applyAssignedState(task, assignedToData, previousStatus);
      }
    }

    const currentAssignedToId = getRealAssignedUserId(task);
    const wantsWorkflowMove =
      ("status" in req.body && req.body.status !== previousStatus) || "order" in req.body;

    if (wantsWorkflowMove) {
      if (!currentAssignedToId) {
        await applyUnassignedState(task);
      } else {
        if (!canMoveTask(task, req.user._id)) {
          return res.status(403).json({ success: false, error: "Only the assigned user can move this task." });
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

        if ("order" in req.body) task.order = req.body.order;
      }
    }

    const finalAssignedToId = getRealAssignedUserId(task);
    if (!finalAssignedToId) await applyUnassignedState(task);

    await task.save();

    if (
      finalAssignedToId &&
      !sameId(previousAssignedToId, finalAssignedToId) &&
      !sameId(finalAssignedToId, req.user._id)
    ) {
      await createNotification({
        user: finalAssignedToId,
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
      return res.status(400).json({ success: false, error: "Comment text is required" });
    }

    const { task, project } = await getTaskAccess(req.params.taskId, req.user._id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (!project) return res.status(403).json({ success: false, error: "Not allowed to comment on this task" });

    const author = await buildUserMini(req.user._id);
    task.comments.push({ text: text.trim(), createdBy: author });
    await task.save();

    const assignedUserId = getRealAssignedUserId(task);
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

    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    if (!project) return res.status(403).json({ success: false, error: "Not allowed to delete this task" });

    if (!isAdmin && !sameId(task.createdBy, req.user._id)) {
      return res.status(403).json({ success: false, error: "Only the project admin or task creator can delete this task." });
    }

    await Task.deleteOne({ _id: req.params.taskId });
    await Notification.deleteMany({ task: req.params.taskId });

    res.json({ success: true, data: { _id: req.params.taskId } });
  } catch (e) {
    next(e);
  }
}
