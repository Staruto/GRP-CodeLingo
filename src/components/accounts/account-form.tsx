"use client";

import { useActionState } from "react";
import { AccountField } from "@/components/accounts/account-page";
import type { AccountFormState } from "@/server/account-form-actions";

type AccountAction = (previous: AccountFormState, form: FormData) => Promise<AccountFormState>;

type AccountFormProps = {
  mode: "login" | "register";
  action?: AccountAction;
};

const initialState: AccountFormState = { status: "idle" };
const unavailableAction = async (): Promise<AccountFormState> => ({
  status: "error",
  message: "This action is available in local SQLite mode.",
});

export function AccountForm({ mode, action }: AccountFormProps) {
  const [state, formAction, pending] = useActionState(action ?? unavailableAction, initialState);
  const isRegistration = mode === "register";
  const submitLabel = isRegistration ? "Create account" : "Verify credentials";
  const passwordAutocomplete = isRegistration ? "new-password" : "current-password";

  const fields = (
    <>
      <AccountField
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={isRegistration ? 32 : 64}
        pattern={isRegistration ? "[a-zA-Z0-9_\\-]{3,32}" : undefined}
        hint={isRegistration ? "Use 3–32 letters, numbers, underscores or hyphens." : undefined}
        required
      />
      {isRegistration && (
        <AccountField
          id="email"
          label="University email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      )}
      <AccountField
        id="password"
        label="Password"
        name="password"
        type="password"
        autoComplete={passwordAutocomplete}
        minLength={isRegistration ? 15 : undefined}
        maxLength={256}
        hint={isRegistration ? "Use at least 15 characters." : undefined}
        required
      />
      {isRegistration && (
        <AccountField
          id="confirm-password"
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          maxLength={256}
          required
        />
      )}
    </>
  );

  if (!action) {
    return (
      <div className="space-y-4">
        <p id="account-preview-note" className="rounded-md border border-border bg-background p-3 text-sm text-muted">
          This is a preview. Account creation and credential verification are available in local SQLite mode.
        </p>
        <fieldset disabled aria-describedby="account-preview-note" className="space-y-4">
          {fields}
          <button type="button" className="button-link border-border bg-background text-muted">{submitLabel}</button>
        </fieldset>
      </div>
    );
  }

  return (
    <form action={formAction} aria-busy={pending} className="space-y-4">
      {fields}
      {state.status === "error" && <p role="alert" className="text-sm text-rose-800">{state.message}</p>}
      {state.status === "success" && <p role="status" className="text-sm text-emerald-800">{state.message}</p>}
      <button type="submit" disabled={pending} className="button-link button-link-primary disabled:opacity-60">
        {pending ? (isRegistration ? "Creating account…" : "Checking credentials…") : submitLabel}
      </button>
    </form>
  );
}
