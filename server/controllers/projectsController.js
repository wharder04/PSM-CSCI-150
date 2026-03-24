// server/controllers/projectsController.js

import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/mailer.js";

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
      discussionMessages: [],
    });

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

export async function addMember(req, res, next) {
  try {
    let { memberId, email } = req.body;

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

    const doc = await ProjectMember.findOneAndUpdate(
      { projectId: req.project._id, memberId },
      {
        $set: { isActive: true, modifiedDate: new Date() },
        $setOnInsert: { addDate: new Date() },
      },
      { new: true, upsert: true }
    ).populate("memberId", "name email");

    try {
      const projectName = req.project.name;
      const inviterName = req.user.name;
      const dashboardUrl = `${process.env.CLIENT_URL}/projects/${req.project._id}`;

      const message = `
        <h1>You have been added to a project</h1>
        <p>Hello ${doc.memberId.name},</p>
        <p><strong>${inviterName}</strong> has added you to the project <strong>${projectName}</strong>.</p>
        <p>Click below to view the project:</p>
        <a href="${dashboardUrl}">${dashboardUrl}</a>
      `;

      await sendEmail({
        to: doc.memberId.email,
        subject: `New Project: ${projectName}`,
        html: message,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
    }

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

    const memberData = await ProjectMember.findOne({
      projectId: req.project._id,
      memberId,
    }).populate("memberId", "name email");

    if (memberData && memberData.memberId && memberData.memberId.email) {
      try {
        const projectName = req.project.name;
        const removerName = req.user.name;

        const message = `
          <h1>You have been removed from a project</h1>
          <p>Hello ${memberData.memberId.name},</p>
          <p><strong>${removerName}</strong> has removed you from the project <strong>${projectName}</strong>.</p>
        `;

        await sendEmail({
          to: memberData.memberId.email,
          subject: `Removed from Project: ${projectName}`,
          html: message,
        });
      } catch (emailError) {
        console.error("Failed to send removal email:", emailError);
      }
    }

    await ProjectMember.deleteOne({ projectId: req.project._id, memberId });
    res.json({ success: true, data: { memberId } });
  } catch (e) {
    next(e);
  }
}

// -----------------------------------------------------------------------------
// PROJECT DISCUSSION BOARD
// -----------------------------------------------------------------------------
export async function getDiscussionMessages(req, res, next) {
  try {
    const project = await Project.findById(req.project._id).select("discussionMessages");

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    res.json({
      success: true,
      data: project.discussionMessages || [],
    });
  } catch (e) {
    next(e);
  }
}

export async function addDiscussionMessage(req, res, next) {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Message text is required" });
    }

    const project = await Project.findById(req.project._id);

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    project.discussionMessages.push({
      text: text.trim(),
      sender: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });

    await project.save();

    res.json({
      success: true,
      data: project.discussionMessages || [],
    });
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