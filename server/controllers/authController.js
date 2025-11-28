  import jwt from "jsonwebtoken";
  import User from "../models/User.js";
  import { email, success } from "zod";

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