"use server";

import "server-only";

import { createAccount } from "@/db/accounts";
import { devProfile } from "@/db/dev-profile";
import { parseRegistrationInput, type RegistrationResult } from "@/lib/accounts";
import { hashPassword } from "./passwords";
import { usesLocalDatabase, withLocalDatabase } from "./practice";

export async function registerAccount(input: unknown): Promise<RegistrationResult> {
  if (!usesLocalDatabase()) return { ok: false, error: "unsupported" };

  const credentials = parseRegistrationInput(input);
  if (!credentials) return { ok: false, error: "invalid-input" };
  const { username, email, password } = credentials;
  if (username === devProfile.username) return { ok: false, error: "account-conflict" };

  try {
    const passwordHash = await hashPassword(password);
    const account = withLocalDatabase((db) => createAccount(db, { username, email, passwordHash }));
    return account ? { ok: true, account } : { ok: false, error: "account-conflict" };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
