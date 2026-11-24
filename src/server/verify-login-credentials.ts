"use server";

import "server-only";

import { findAccountCredentials } from "@/db/accounts";
import { parseLoginInput, type LoginResult } from "@/lib/accounts";
import { verifyPassword } from "./passwords";
import { usesLocalDatabase, withLocalDatabase } from "./practice";

export async function verifyLoginCredentials(input: unknown): Promise<LoginResult> {
  if (!usesLocalDatabase()) return { ok: false, error: "unsupported" };

  const credentials = parseLoginInput(input);
  if (!credentials) return { ok: false, error: "invalid-input" };

  try {
    const user = withLocalDatabase((db) => findAccountCredentials(db, credentials.username));
    const matches = await verifyPassword(credentials.password, user?.passwordHash ?? null);
    return user && matches
      ? { ok: true, account: user.account }
      : { ok: false, error: "invalid-credentials" };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
