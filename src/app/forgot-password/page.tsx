import type { Metadata } from "next";
import Link from "next/link";
import { AccountField, AccountPage } from "@/components/accounts/account-page";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AccountPage
      title="Forgot password"
      description="Password recovery is a preview. Reset tokens and email delivery are not available yet."
    >
      <fieldset disabled className="space-y-4">
        <AccountField id="recovery-email" label="University email" type="email" autoComplete="email" />
        <button type="button" className="button-link border-border bg-background text-muted">Send reset email</button>
      </fieldset>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/login" className="text-link">Back to login</Link>
        <Link href="/reset-password" className="text-link">Preview reset page</Link>
      </div>
    </AccountPage>
  );
}
