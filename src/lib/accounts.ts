import type { CurrentUser } from "./practice";

export type RegistrationInput = {
  username: string;
  email: string;
  password: string;
};

export type RegistrationResult =
  | { ok: true; account: Pick<CurrentUser, "id" | "username" | "displayName"> }
  | { ok: false; error: "invalid-input" | "account-conflict" | "unsupported" | "unavailable" };

function canonicalUsername(value: unknown) {
  if (typeof value !== "string" || value.length > 64) return null;
  const username = value.trim();
  return /^[a-zA-Z0-9_-]{3,32}$/.test(username) ? username.toLowerCase() : null;
}

function validPassword(value: unknown): value is string {
  return typeof value === "string" && value.length <= 256 &&
    value.isWellFormed() && !value.includes("\0") && [...value].length >= 15;
}

function canonicalEmail(value: unknown) {
  if (typeof value !== "string" || value.length > 320) return null;
  const email = value.trim().toLowerCase();
  const [local, domain, extra] = email.split("@");
  if (email.length > 254 || !local || local.length > 64 || !domain || extra !== undefined) return null;

  const labels = domain.split(".");
  const validLocal = local.split(".").every((part) => /^[a-z0-9!#$%&'*+/=?^_\x60{|}~-]+$/.test(part));
  const validDomain = labels.length >= 2 &&
    labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
  return validLocal && validDomain ? email : null;
}

export function parseRegistrationInput(input: unknown): RegistrationInput | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
  const { username: rawUsername, email: rawEmail, password } = input as Partial<RegistrationInput>;
  const username = canonicalUsername(rawUsername);
  const email = canonicalEmail(rawEmail);
  return username && email && validPassword(password) ? { username, email, password } : null;
}
