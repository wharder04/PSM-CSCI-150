import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User.js";

export const UNASSIGNED_USER_EMAIL = "unassigned@system.local";
export const UNASSIGNED_USER_NAME = "Unassigned";
export const UNASSIGNED_SYSTEM_KEY = "UNASSIGNED_PLACEHOLDER";

export function sameId(a, b) {
  return String(a || "") === String(b || "");
}

export function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value || ""));
}

export function isUnassignedInput(value) {
  if (value === null || value === undefined) return true;
  const text = String(value).trim().toLowerCase();
  return text === "" || text === "unassigned" || text === "unassignee" || text === UNASSIGNED_USER_EMAIL;
}

export function isSystemPlaceholderUser(user) {
  if (!user) return false;
  return Boolean(user.isSystemPlaceholder) || user.systemKey === UNASSIGNED_SYSTEM_KEY || user.email === UNASSIGNED_USER_EMAIL;
}

export async function getUnassignedUser() {
  const password = crypto.randomBytes(48).toString("hex");

  return User.findOneAndUpdate(
    { email: UNASSIGNED_USER_EMAIL },
    {
      $set: {
        name: UNASSIGNED_USER_NAME,
        email: UNASSIGNED_USER_EMAIL,
        isSystemPlaceholder: true,
        systemKey: UNASSIGNED_SYSTEM_KEY,
        bio: "System placeholder for tasks that do not have a real assignee.",
        status: "Offline",
      },
      $setOnInsert: {
        password,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).select("name email isSystemPlaceholder systemKey");
}

export async function getUnassignedMini() {
  const user = await getUnassignedUser();
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    isSystemPlaceholder: true,
    systemKey: UNASSIGNED_SYSTEM_KEY,
  };
}

export function isUnassignedMini(value) {
  if (!value) return true;
  if (typeof value === "string") return isUnassignedInput(value);
  return isSystemPlaceholderUser(value) || isUnassignedInput(value.email) || value.systemKey === UNASSIGNED_SYSTEM_KEY;
}
