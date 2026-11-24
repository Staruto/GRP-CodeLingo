import "server-only";

import { argon2id, hash } from "argon2";

export function hashPassword(password: string) {
  // OWASP Argon2id minimum: 19 MiB, two passes, one lane. The library generates the salt.
  return hash(password, { type: argon2id, memoryCost: 19 * 1024, timeCost: 2, parallelism: 1 });
}
