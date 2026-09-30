import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { assert, text } from "../shared/core.js";
const scrypt = promisify(scryptCallback);
export const token = () => randomBytes(32).toString("hex");
export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
export function email(value) {
  const result = text(value, "E-mail", 254).toLowerCase();
  assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result), "E-mail inválido.");
  return result;
}
export async function hashPassword(value) {
  text(value, "Senha", 128, 12);
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(value, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(value, stored) {
  if (typeof value !== "string" || value.length > 128) return false;
  const [salt, hex] = stored.split(":");
  const key = await scrypt(value, salt, 64);
  return timingSafeEqual(key, Buffer.from(hex, "hex"));
}
export function publicUser(user) {
  const { id, email, name, role, ra, course, active } = user;
  return { id, email, name, role, ra, course, active: Boolean(active) };
}
