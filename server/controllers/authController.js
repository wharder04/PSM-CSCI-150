import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendEmail } from "../utils/mailer.js";

const COOKIE_NAME = "token";
const COOKIE_SECURE =
  String(process.env.COOKIE_SECURE).toLowerCase() === "true";
const EXPIRES_SHORT = process.env.JWT_EXPIRES_SHORT || "2h";
const EXPIRES_LONG = process.env.JWT_EXPIRES_LONG || "30d";

function sign(sub, remember = true) {
  return jwt.sign({ sub }, process.env.JWT_SECRET, {
    expiresIn: remember ? EXPIRES_LONG : EXPIRES_SHORT,
  });
}

function setAuthCookie(res, token, remember = true) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000,
  });
}

export const registerUser = async (req, res, next) => {
  try {
    const { fname, lname, email, password, remember = true } = req.body;
    const name = fname + " " + lname;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ ok: false, error: "Email already in use" });

    const user = await User.create({ name, email, password });
    const token = sign(user._id, remember);
    setAuthCookie(res, token, remember);

    res
      .status(201)
      .json({ success: true, user: { _id: user._id, name, email } });
  } catch (e) {
    next(e);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password, remember = true } = req.body;
    const user = await User.findOne({ email: email }).select("+password");
    if (!user)
      return res.json({ success: false, message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = sign(user._id, remember);
    setAuthCookie(res, token, remember);

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (e) {
    next(e);
  }
};

export const logoutUser = async (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true, message: "Logged out" });
};

export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (e) {
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    console.log(user);

    if (user === null) {
      return res.json({ success: false, error: "Email not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (error) {
      console.log(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return res.status(500).json({ success: false, error: "Email could not be sent" });
    }
  } catch (error) {
    next(error);
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }

    res.status(200).json({ success: true, message: "Token is valid" });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid Token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: "Password Reset Success",
    });
  } catch (error) {
    next(error);
  }
};
