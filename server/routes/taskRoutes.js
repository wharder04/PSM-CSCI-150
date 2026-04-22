import { Router } from "express";
import { body, param } from "express-validator";
import auth from "../middleware/auth.js";
import { handleValidation } from "../middleware/validate.js";
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  addTaskComment,
} from "../controllers/taskController.js";

const router = Router({ mergeParams: true });

const taskIdRule = param("taskId").isMongoId().withMessage("Invalid task id");

const titleRule = body("title")
  .optional()
  .isString()
  .trim()
  .notEmpty()
  .withMessage("Title required");

const statusRule = body("status")
  .optional()
  .isIn(["UnAssigned", "Assigned", "InProgress", "Completed", "InComplete"])
  .withMessage("Invalid status");

router
  .route("/")
  .get(auth, listTasks)
  .post(
    auth,
    body("title").isString().trim().notEmpty().withMessage("Title required"),
    handleValidation,
    createTask
  );

router
  .route("/:taskId")
  .get(auth, taskIdRule, handleValidation, getTask)
  .put(auth, taskIdRule, titleRule, statusRule, handleValidation, updateTask)
  .delete(auth, taskIdRule, handleValidation, deleteTask);

router.post(
  "/:taskId/comments",
  auth,
  taskIdRule,
  body("text").isString().trim().notEmpty().withMessage("Comment required"),
  handleValidation,
  addTaskComment
);

export default router;