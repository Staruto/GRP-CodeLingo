import type { Metadata } from "next";
import Link from "next/link";
import { AccountField, AccountPage } from "@/components/accounts/account-page";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <AccountPage
      title="Reset password"
      description="This page is a preview. Reset tokens are not checked and passwords cannot be changed here yet."
    >
      <fieldset disabled className="space-y-4">
        <AccountField id="new-password" label="New password" type="password" autoComplete="new-password" />
        <AccountField id="confirm-password" label="Confirm password" type="password" autoComplete="new-password" />
        <button type="button" className="button-link border-border bg-background text-muted">Reset password</button>
      </fieldset>
      <Link href="/forgot-password" className="text-link text-sm">Back to password recovery</Link>
    </AccountPage>
  );
}
