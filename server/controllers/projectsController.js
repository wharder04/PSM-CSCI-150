import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import DiscussionMessage from "../models/DiscussionMessage.js";

function sameId(a, b) {
  return String(a || "") === String(b || "");
}

export async function myProjects(req, res, next) {
  try {
    const owner = await Project.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

    const memberships = await ProjectMember.find({
      memberId: req.user._id,
      isActive: true,
    }).select("projectId");

    const memberProjectIds = memberships.map((m) => m.projectId);

    const memberOf = await Project.find({
      _id: { $in: memberProjectIds },
      ownerId: { $ne: req.user._id },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        owner,
        memberOf,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function getDashboardData(req, res, next) {
  try {
    const ownerProjects = await Project.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

    const memberships = await ProjectMember.find({
      memberId: req.user._id,
      isActive: true,
    }).select("projectId");

    const memberProjectIds = memberships.map((m) => m.projectId);

    const memberProjects = await Project.find({
      _id: { $in: memberProjectIds },
      ownerId: { $ne: req.user._id },
    }).sort({ createdAt: -1 });

    const allProjects = [...ownerProjects, ...memberProjects];
    const uniqueProjects = Array.from(
      new Map(allProjects.map((p) => [String(p._id), p])).values()
    );

    const projectIds = uniqueProjects.map((p) => p._id);

    const tasks = projectIds.length
      ? await Task.find({ projectId: { $in: projectIds } })
      : [];

    const activeProjects = uniqueProjects.filter(
      (p) => (p.status || "Active") === "Active"
    ).length;

    const completedTasks = tasks.filter((t) => t.status === "Completed").length;

    res.json({
      success: true,
      data: {
        totalProjects: uniqueProjects.length,
        activeProjects,
        completedTasks,
        recentProjects: uniqueProjects.slice(0, 5),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function createProject(req, res, next) {
  try {
    const { name, desc, dueDate, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Project name is required",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      desc: desc || "",
      dueDate: dueDate || null,
      status: status || "Active",
      ownerId: req.user._id,
    });

    const populated = await Project.findById(project._id).populate("ownerId", "name email");

    res.status(201).json({ success: true, data: populated });
  } catch (e) {
    next(e);
  }
}

export async function getProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      "ownerId",
      "name email"
    );

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    const isOwner = sameId(project.ownerId?._id || project.ownerId, req.user._id);

    if (!isOwner) {
      const member = await ProjectMember.findOne({
        projectId: project._id,
        memberId: req.user._id,
        isActive: true,
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          error: "Not allowed to view this project",
        });
      }
    }

    res.json({ success: true, data: project });
  } catch (e) {
    next(e);
  }
}

export async function updateProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { name, desc, dueDate, status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    if (!sameId(project.ownerId, req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only the project admin can edit this project",
      });
    }

    if ("name" in req.body) project.name = name?.trim() || project.name;
    if ("desc" in req.body) project.desc = desc || "";
    if ("dueDate" in req.body) project.dueDate = dueDate || null;
    if ("status" in req.body) project.status = status || project.status;

    await project.save();

    const populated = await Project.findById(project._id).populate("ownerId", "name email");

    res.json({ success: true, data: populated });
  } catch (e) {
    next(e);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    if (!sameId(project.ownerId, req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only the project admin can delete this project",
      });
    }

    await Project.deleteOne({ _id: projectId });
    await ProjectMember.deleteMany({ projectId });
    await Task.deleteMany({ projectId });
    await DiscussionMessage.deleteMany({ projectId });

    res.json({ success: true, data: { _id: projectId } });
  } catch (e) {
    next(e);
  }
}

export async function listMembers(req, res, next) {
  try {
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    const isOwner = sameId(project.ownerId, req.user._id);
    if (!isOwner) {
      const member = await ProjectMember.findOne({
        projectId,
        memberId: req.user._id,
        isActive: true,
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          error: "Not allowed to view project members",
        });
      }
    }

    const members = await ProjectMember.find({ projectId })
      .populate("memberId", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: members });
  } catch (e) {
    next(e);
  }
}

export async function addMember(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const { email, memberId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    if (!sameId(project.ownerId, req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only the project admin can add members",
      });
    }

    let user = null;

    if (memberId) {
      user = await User.findById(memberId);
    } else if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const existing = await ProjectMember.findOne({
      projectId,
      memberId: user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "User is already a member of this project",
      });
    }

    const member = await ProjectMember.create({
      projectId,
      memberId: user._id,
      isActive: true,
      canManageTasks: true,
    });

    const populatedMember = await ProjectMember.findById(member._id).populate(
      "memberId",
      "name email"
    );

    return res.status(201).json({ success: true, data: populatedMember });
  } catch (e) {
    next(e);
  }
}

export async function toggleMemberStatus(req, res, next) {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    if (!sameId(project.ownerId, req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only the project admin can change member status",
      });
    }

    const member = await ProjectMember.findOne({ projectId, memberId });
    if (!member) {
      return res.status(404).json({ success: false, error: "Project member not found" });
    }

    member.isActive = !member.isActive;
    await member.save();

    const populatedMember = await ProjectMember.findById(member._id).populate(
      "memberId",
      "name email"
    );

    res.json({ success: true, data: populatedMember });
  } catch (e) {
    next(e);
  }
}

export async function toggleMemberTaskAccess(req, res, next) {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    if (!sameId(project.ownerId, req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only the project admin can change task permissions",
      });
    }

    const member = await ProjectMember.findOne({ projectId, memberId });
    if (!member) {
      return res.status(404).json({ success: false, error: "Project member not found" });
    }

    member.canManageTasks = !member.canManageTasks;
    await member.save();

    const populatedMember = await ProjectMember.findById(member._id).populate(
      "memberId",
      "name email"
    );

    res.json({ success: true, data: populatedMember });
  } catch (e) {
    next(e);
  }
}

export async function removeMember(req, res, next) {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    if (!sameId(project.ownerId, req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "Only the project admin can remove members",
      });
    }

    const member = await ProjectMember.findOneAndDelete({ projectId, memberId });
    if (!member) {
      return res.status(404).json({ success: false, error: "Project member not found" });
    }

    res.json({ success: true, data: { memberId } });
  } catch (e) {
    next(e);
  }
}

export async function getDiscussion(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    const isOwner = sameId(project.ownerId, req.user._id);
    if (!isOwner) {
      const member = await ProjectMember.findOne({
        projectId,
        memberId: req.user._id,
        isActive: true,
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          error: "Not allowed to view discussion",
        });
      }
    }

    const messages = await DiscussionMessage.find({ projectId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (e) {
    next(e);
  }
}

export async function addDiscussionMessage(req, res, next) {
  try {
    const { projectId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message text is required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    const isOwner = sameId(project.ownerId, req.user._id);
    if (!isOwner) {
      const member = await ProjectMember.findOne({
        projectId,
        memberId: req.user._id,
        isActive: true,
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          error: "Not allowed to post in discussion",
        });
      }
    }

    await DiscussionMessage.create({
      projectId,
      sender: req.user._id,
      text: text.trim(),
    });

    const messages = await DiscussionMessage.find({ projectId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (e) {
    next(e);
  }
}
