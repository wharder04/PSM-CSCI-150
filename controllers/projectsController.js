import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';

export async function createProject(req, res, next) {
  try {
    const { name, desc, startDate, dueDate } = req.body;
    const project = await Project.create({
      name, desc, startDate, dueDate, ownerId: req.user._id
    });
    // owner is implicitly a member (active)
    await ProjectMember.updateOne(
      { projectId: project._id, memberId: req.user._id },
      { $set: { isActive: true, modifiedDate: new Date() }, $setOnInsert: { addDate: new Date() } },
      { upsert: true }
    );
    res.status(201).json({ ok: true, data: project });
  } catch (e) { next(e); }
}

export async function myProjects(req, res, next) {
  try {
    const owner = await Project.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    const memberIds = await ProjectMember.find({ memberId: req.user._id, isActive: true }).distinct('projectId');
    const memberOf = await Project.find({ _id: { $in: memberIds }, ownerId: { $ne: req.user._id } }).sort({ createdAt: -1 });
    res.json({ ok: true, data: { owner, memberOf } });
  } catch (e) { next(e); }
}

export async function getProject(req, res) {
  res.json({ ok: true, data: req.project });
}

export async function updateProject(req, res, next) {
  try {
    const fields = ['name','desc','startDate','dueDate'];
    for (const k of fields) if (k in req.body) req.project[k] = req.body[k];
    await req.project.save();
    res.json({ ok: true, data: req.project });
  } catch (e) { next(e); }
}

export async function deleteProject(req, res, next) {
  try {
    await ProjectMember.deleteMany({ projectId: req.project._id });
    await req.project.deleteOne();
    res.json({ ok: true, data: { _id: req.params.projectId } });
  } catch (e) { next(e); }
}

// --- Membership ---
export async function listMembers(req, res, next) {
  try {
    const members = await ProjectMember
      .find({ projectId: req.project._id })
      .populate('memberId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ ok: true, data: members });
  } catch (e) { next(e); }
}

export async function addMember(req, res, next) {
  try {
    const { memberId } = req.body;
    const doc = await ProjectMember.findOneAndUpdate(
      { projectId: req.project._id, memberId },
      { $set: { isActive: true, modifiedDate: new Date() }, $setOnInsert: { addDate: new Date() } },
      { new: true, upsert: true }
    );
    res.status(201).json({ ok: true, data: doc });
  } catch (e) { next(e); }
}

export async function setMemberActive(req, res, next) {
  try {
    const { memberId } = req.params;
    const { isActive } = req.body; // boolean
    const doc = await ProjectMember.findOneAndUpdate(
      { projectId: req.project._id, memberId },
      { $set: { isActive: !!isActive, modifiedDate: new Date() } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'Member not found' });
    res.json({ ok: true, data: doc });
  } catch (e) { next(e); }
}

export async function removeMember(req, res, next) {
  try {
    const { memberId } = req.params;
    await ProjectMember.deleteOne({ projectId: req.project._id, memberId });
    res.json({ ok: true, data: { memberId } });
  } catch (e) { next(e); }
}
