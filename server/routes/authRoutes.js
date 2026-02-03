import { Router } from "express";
import { body } from "express-validator";
import { handleValidation } from "../middleware/validate.js";
import auth from "../middleware/auth.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyToken,
} from "../controllers/authController.js";

const r = Router();

const emailRule = body("usernameorEmail")
  .isEmail()
  .withMessage("Valid email required");

const pwRule = body("password")
  .isString()
  .isLength({ min: 8 })
  .withMessage("Password too short");

// r.post("/register", emailRule, pwRule, handleValidation, registerUser);
// r.post("/login", emailRule, pwRule, handleValidation, loginUser);

r.post("/login", loginUser);
r.post("/register", registerUser);
r.post("/logout", auth, logoutUser);
r.get("/me", auth, getCurrentUser);
r.post("/forgot-password", forgotPassword);
r.get("/verify-password/:resetToken", verifyToken);
r.put("/reset-password/:resetToken", resetPassword);

export default r;
