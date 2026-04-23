import { Router } from "express";
import auth from "../middleware/auth.js";
import { param } from "express-validator";
import { handleValidation } from "../middleware/validate.js";
import {
  getMyNotifications,
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = Router();

const notificationIdRule = param("notificationId")
  .isMongoId()
  .withMessage("Invalid notification id");

router.get("/", auth, getMyNotifications);
router.get("/unread", auth, getUnreadNotifications);
router.patch("/read-all", auth, markAllNotificationsRead);

router.patch(
  "/:notificationId/read",
  auth,
  notificationIdRule,
  handleValidation,
  markNotificationRead
);

router.delete(
  "/:notificationId",
  auth,
  notificationIdRule,
  handleValidation,
  deleteNotification
);

export default router;