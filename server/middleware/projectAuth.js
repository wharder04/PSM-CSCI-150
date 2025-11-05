import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';

// Loads project to req.project if user is active member or owner
export async function requireProjectMember(req, res, next) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const isOwner = project.ownerId.toString() === req.user._id.toString();
    if (isOwner) { req.project = project; return next(); }

    const mem = await ProjectMember.findOne({
      projectId: project._id, memberId: req.user._id, isActive: true
    });
    if (!mem) return res.status(403).json({ error: 'Forbidden (not a project member)' });

    req.project = project;
    next();
  } catch (e) { next(e); }
}

export function requireProjectOwner(req, res, next) {
  if (!req.project) return res.status(500).json({ error: 'Project not loaded' });
  const isOwner = req.project.ownerId.toString() === req.user._id.toString();
  if (!isOwner) return res.status(403).json({ error: 'Owner action only' });
  next();
}
