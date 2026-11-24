import "server-only";

import { randomUUID } from "node:crypto";
import { argon2id, hash, verify } from "argon2";

export function hashPassword(password: string) {
  // OWASP Argon2id minimum: 19 MiB, two passes, one lane. The library generates the salt.
  return hash(password, { type: argon2id, memoryCost: 19 * 1024, timeCost: 2, parallelism: 1 });
}

let fallbackHash: Promise<string> | undefined;

export async function verifyPassword(password: string, passwordHash: string | null) {
  // Use the same Argon2id work factor when no account hash is available.
  fallbackHash ??= hashPassword(randomUUID()).catch((error: unknown) => {
    fallbackHash = undefined;
    throw error;
  });
  const dummy = await fallbackHash;
  const storedHash = passwordHash?.startsWith("$argon2id$") ? passwordHash : null;
  const matches = await verify(storedHash ?? dummy, password);
  return storedHash !== null && matches;
}
