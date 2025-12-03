// server/controllers/projectsController.js

import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Task from "../models/Task.js";
import User from "../models/User.js";  // 👈 NEW for lookup by email

// -----------------------------------------------------------------------------
// CREATE PROJECT
// -----------------------------------------------------------------------------
export async function createProject(req, res, next) {
  try {
    const { name, desc, startDate, dueDate } = req.body;
    const project = await Project.create({
      name,
      desc,
      startDate,
      dueDate,
      ownerId: req.user._id,
    });
    // owner is implicitly a member (active)
    await ProjectMember.updateOne(
      { projectId: project._id, memberId: req.user._id },
      {
        $set: { isActive: true, modifiedDate: new Date() },
        $setOnInsert: { addDate: new Date() },
      },
      { upsert: true }
    );
    res.status(201).json({ success: true, data: project });
  } catch (e) {
    next(e);
  }
}

// -----------------------------------------------------------------------------
// LIST PROJECTS FOR CURRENT USER
// -----------------------------------------------------------------------------
export async function myProjects(req, res, next) {
  try {
    const owner = await Project.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });

    const memberIds = await ProjectMember.find({
      memberId: req.user._id,
      isActive: true,
    }).distinct("projectId");

    const memberOf = await Project.find({
      _id: { $in: memberIds },
      ownerId: { $ne: req.user._id },
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: { owner, memberOf } });
  } catch (e) {
    next(e);
  }
}

// -----------------------------------------------------------------------------
// SINGLE PROJECT
// -----------------------------------------------------------------------------
export async function getProject(req, res) {
  res.json({ success: true, data: req.project });
}

export async function updateProject(req, res, next) {
  try {
    const fields = ["name", "desc", "startDate", "dueDate"];
    for (const k of fields) {
      if (k in req.body) req.project[k] = req.body[k];
    }
    await req.project.save();
    res.json({ success: true, data: req.project });
  } catch (e) {
    next(e);
  }
}

export async function deleteProject(req, res, next) {
  try {
    await ProjectMember.deleteMany({ projectId: req.project._id });
    await req.project.deleteOne();
    res.json({ success: true, data: { _id: req.params.projectId } });
  } catch (e) {
    next(e);
  }
}

// -----------------------------------------------------------------------------
// MEMBERSHIP
// -----------------------------------------------------------------------------
export async function listMembers(req, res, next) {
  try {
    const members = await ProjectMember.find({ projectId: req.project._id })
      .populate("memberId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: members });
  } catch (e) {
    next(e);
  }
}

// ✅ ADD MEMBER (by email or memberId)
export async function addMember(req, res, next) {
  try {
    let { memberId, email } = req.body;

    // Allow adding by email
    if (!memberId && email) {
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User with that email not found" });
      }
      memberId = user._id;
    }

    if (!memberId) {
      return res
        .status(400)
        .json({ success: false, error: "memberId or email is required" });
    }

    // Cannot add the same person twice in the same way
    const doc = await ProjectMember.findOneAndUpdate(
      { projectId: req.project._id, memberId },
      {
        $set: { isActive: true, modifiedDate: new Date() },
        $setOnInsert: { addDate: new Date() },
      },
      { new: true, upsert: true }
    ).populate("memberId", "name email");

    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    next(e);
  }
}

export async function toggleMemberStatus(req, res, next) {
  try {
    const { memberId } = req.params;

    const memberData = await ProjectMember.findOne({
      projectId: req.project._id,
      memberId,
    }).populate("memberId", "name email");

    if (!memberData) {
      return res
        .status(404)
        .json({ success: false, error: "Member not found" });
    }

    memberData.isActive = !memberData.isActive;
    memberData.modifiedDate = new Date();
    await memberData.save();

    res.json({ success: true, data: memberData });
  } catch (e) {
    next(e);
  }
}

export async function removeMember(req, res, next) {
  try {
    const { memberId } = req.params;
    await ProjectMember.deleteOne({ projectId: req.project._id, memberId });
    res.json({ success: true, data: { memberId } });
  } catch (e) {
    next(e);
  }
}

// -----------------------------------------------------------------------------
// PROGRESS FOR A SINGLE PROJECT
// -----------------------------------------------------------------------------
export async function getProgress(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const total = await Task.countDocuments({ projectId });
    const completed = await Task.countDocuments({
      projectId,
      status: "Completed",
    });
    const percent = total ? Math.round((completed / total) * 100) : 0;
    res.json({ success: true, data: { completed, total, percent } });
  } catch (err) {
    next(err);
  }
}

// -----------------------------------------------------------------------------
// DASHBOARD OVERVIEW (ALL DATA IN ONE API)
// -----------------------------------------------------------------------------
export async function getDashboardData(req, res, next) {
  try {
    const userId = req.user._id;

    const owner = await Project.find({ ownerId: userId }).sort({
      createdAt: -1,
    });

    const memberIds = await ProjectMember.find({
      memberId: userId,
      isActive: true,
    }).distinct("projectId");

    const memberOf = await Project.find({
      _id: { $in: memberIds },
      ownerId: { $ne: userId },
    }).sort({ createdAt: -1 });

    const projectIds = [
      ...owner.map((p) => p._id),
      ...memberOf.map((p) => p._id),
    ];

    const taskFilter = projectIds.length
      ? { projectId: { $in: projectIds } }
      : { createdBy: userId };

    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      assignedTasks,
      testingTasks,
      recentTasks,
    ] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: "Completed" }),
      Task.countDocuments({ ...taskFilter, status: "InProgress" }),
      Task.countDocuments({ ...taskFilter, status: "Assigned" }),
      Task.countDocuments({ ...taskFilter, status: "Testing" }),
      Task.find(taskFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("projectId", "name"),
    ]);

    const completionRate = totalTasks
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        projects: {
          owner,
          memberOf,
          total: owner.length + memberOf.length,
        },
        taskStats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          assignedTasks,
          testingTasks,
          completionRate,
        },
        recentTasks,
      },
    });
  } catch (e) {
    next(e);
  }
}
