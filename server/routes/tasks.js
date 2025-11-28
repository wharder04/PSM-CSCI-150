
import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = Router({ mergeParams: true });

router.get("/", auth, listTasks);
router.post("/", auth, createTask);
router.get("/:taskId", auth, getTask);
router.put("/:taskId", auth, updateTask);
router.delete("/:taskId", auth, deleteTask);

export default router;
