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
} from "../controllers/projectsController.js";

const router = Router();

router.get("/", auth, myProjects);
router.post("/", auth, createProject);

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

router.get("/progress/:projectId", auth, getProgress);
export default router;
