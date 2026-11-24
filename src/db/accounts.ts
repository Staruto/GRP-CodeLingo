import "server-only";

import type { DatabaseSync } from "node:sqlite";
import { inTransaction } from "./connection";

export function createAccount(
  db: DatabaseSync,
  { username, email, passwordHash }: { username: string; email: string; passwordHash: string },
) {
  const user = inTransaction(db, () => db.prepare(`
    INSERT INTO users (username, email, password_hash, display_name, time_zone, created_at, role)
    VALUES (?, ?, ?, ?, 'UTC', ?, 'user')
    ON CONFLICT DO NOTHING
    RETURNING id, username, display_name
  `).get(username, email, passwordHash, username, Date.now()));
  return user ? {
    id: Number(user.id),
    username: String(user.username),
    displayName: String(user.display_name),
  } : null;
}
