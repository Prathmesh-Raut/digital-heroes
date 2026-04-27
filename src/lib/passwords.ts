import { compareSync, hashSync } from "bcryptjs";

export function hashPassword(password: string) {
  return hashSync(password, 10);
}

export function verifyPassword(password: string, passwordHash: string) {
  return compareSync(password, passwordHash);
}
