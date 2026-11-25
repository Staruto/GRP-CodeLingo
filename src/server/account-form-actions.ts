"use server";

import { registerAccount } from "@/server/register-account";
import { verifyLoginCredentials } from "@/server/verify-login-credentials";

export type AccountFormState =
  | { status: "idle" }
  | { status: "error" | "success"; message: string };

export async function submitRegistration(
  _previous: AccountFormState,
  form: FormData,
): Promise<AccountFormState> {
  const password = form.get("password");
  if (typeof password !== "string" || password !== form.get("confirmPassword")) {
    return { status: "error", message: "The passwords must match." };
  }

  const result = await registerAccount({
    username: form.get("username"),
    email: form.get("email"),
    password,
  });

  if (result.ok) {
    return {
      status: "success",
      message: `Account created for @${result.account.username}. Email ownership checks and persistent login are not available yet.`,
    };
  }

  switch (result.error) {
    case "account-conflict":
      return { status: "error", message: "That username or email is already in use." };
    case "invalid-input":
      return {
        status: "error",
        message: "Check the username and email format. Use a password of at least 15 characters.",
      };
    case "unsupported":
      return { status: "error", message: "Account creation is available in local SQLite mode." };
    case "unavailable":
      return { status: "error", message: "Account creation is temporarily unavailable. Try again later." };
  }
}

export async function submitLogin(
  _previous: AccountFormState,
  form: FormData,
): Promise<AccountFormState> {
  const result = await verifyLoginCredentials({
    username: form.get("username"),
    password: form.get("password"),
  });

  if (result.ok) {
    return {
      status: "success",
      message: "Credentials verified. Persistent login is not available yet, so no session was started.",
    };
  }
  if (result.error === "unsupported") {
    return { status: "error", message: "Credential verification is available in local SQLite mode." };
  }
  if (result.error === "unavailable") {
    return { status: "error", message: "Credential verification is temporarily unavailable. Try again later." };
  }
  return { status: "error", message: "The username or password is incorrect." };
}
