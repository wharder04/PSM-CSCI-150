import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function auth(req, res, next) {
  try {
    const cookieName = "token";
    const token = req.cookies?.[cookieName];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select(
      "_id name email passwordChangedAt"
    );
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    if (user.passwordChangedAt) {
      const changedAt = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (changedAt > decoded.iat)
        return res.status(401).json({ error: "Token invalidated" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
