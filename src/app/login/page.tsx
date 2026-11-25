import type { Metadata } from "next";
import Link from "next/link";
import { AccountForm } from "@/components/accounts/account-form";
import { AccountPage } from "@/components/accounts/account-page";
import { submitLogin } from "@/server/account-form-actions";
import { usesLocalDatabase } from "@/server/practice";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <AccountPage title="Login" description="Verify your username and password. A login session will not be started.">
      <AccountForm mode="login" action={usesLocalDatabase() ? submitLogin : undefined} />
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/register" className="text-link">Create an account</Link>
        <Link href="/forgot-password" className="text-link">Forgot your password?</Link>
      </div>
    </AccountPage>
  );
}
