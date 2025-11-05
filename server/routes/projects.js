import { Router } from 'express';
import auth from '../middleware/auth.js';
import { requireProjectMember, requireProjectOwner } from '../middleware/projectAuth.js';
import {
  createProject, myProjects, getProject, updateProject, deleteProject,
  listMembers, addMember, setMemberActive, removeMember
} from '../controllers/projectsController.js';

const r = Router();

r.get('/', auth, myProjects);
r.post('/', auth, createProject);

r.get('/:projectId', auth, requireProjectMember, getProject);
r.put('/:projectId', auth, requireProjectMember, requireProjectOwner, updateProject);
r.delete('/:projectId', auth, requireProjectMember, requireProjectOwner, deleteProject);

r.get('/:projectId/members', auth, requireProjectMember, listMembers);
r.post('/:projectId/members', auth, requireProjectMember, requireProjectOwner, addMember);
r.patch('/:projectId/members/:memberId', auth, requireProjectMember, requireProjectOwner, setMemberActive);
r.delete('/:projectId/members/:memberId', auth, requireProjectMember, requireProjectOwner, removeMember);

export default r;
