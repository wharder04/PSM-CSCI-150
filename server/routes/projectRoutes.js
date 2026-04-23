import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  myProjects,
  getDashboardData,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  listMembers,
  addMember,
  removeMember,
  toggleMemberStatus,
  toggleMemberTaskAccess,
  getDiscussion,
  addDiscussionMessage,
} from "../controllers/projectsController.js";
const router = Router();

router.get("/dashboard", auth, getDashboardData);
router.get("/mine", auth, myProjects);
router.get("/dashboard", auth, getDashboardData);
router.post("/", auth, createProject);

router.get("/:projectId", auth, getProject);
router.put("/:projectId", auth, updateProject);
router.delete("/:projectId", auth, deleteProject);

router.get("/:projectId/members", auth, listMembers);
router.post("/:projectId/members", auth, addMember);
router.patch("/:projectId/members/:memberId/status", auth, toggleMemberStatus);
router.patch("/:projectId/members/:memberId/task-permission", auth, toggleMemberTaskAccess);
router.delete("/:projectId/members/:memberId", auth, removeMember);

router.get("/:projectId/discussion", auth, getDiscussion);
router.post("/:projectId/discussion", auth, addDiscussionMessage);

export default router;