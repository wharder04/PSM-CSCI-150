// server/routes/projects.js

import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  requireProjectMember,
  requireProjectOwner,
} from "../middleware/projectAuth.js";
import {
  createProject,
  myProjects,
  getProject,
  updateProject,
  deleteProject,
  listMembers,
  addMember,
  toggleMemberStatus,
  removeMember,
  getProgress,
  getDashboardData,
} from "../controllers/projectsController.js";

const router = Router();

router.get("/", auth, myProjects);
router.post("/", auth, createProject);

router.get("/dashboard", auth, getDashboardData);

router.get("/:projectId", auth, requireProjectMember, getProject);

router.put(
  "/:projectId",
  auth,
  requireProjectMember,
  requireProjectOwner,
  updateProject
);

router.delete(
  "/:projectId",
  auth,
  requireProjectMember,
  requireProjectOwner,
  deleteProject
);

// 👇 MEMBERS
router.get("/:projectId/members", auth, requireProjectMember, listMembers);

router.post(
  "/:projectId/members",
  auth,
  requireProjectMember,
  requireProjectOwner,
  addMember
);

router.patch(
  "/:projectId/members/:memberId",
  auth,
  requireProjectMember,
  requireProjectOwner,
  toggleMemberStatus
);

router.delete(
  "/:projectId/members/:memberId",
  auth,
  requireProjectMember,
  requireProjectOwner,
  removeMember
);

// PROGRESS
router.get("/progress/:projectId", auth, getProgress);

export default router;
