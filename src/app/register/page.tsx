import type { Metadata } from "next";
import Link from "next/link";
import { AccountForm } from "@/components/accounts/account-form";
import { AccountPage } from "@/components/accounts/account-page";
import { submitRegistration } from "@/server/account-form-actions";
import { usesLocalDatabase } from "@/server/practice";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <AccountPage
      title="Create an account"
      description="Use your university email. Email ownership and university domains are not verified in this prototype."
    >
      <AccountForm mode="register" action={usesLocalDatabase() ? submitRegistration : undefined} />
      <Link href="/login" className="text-link text-sm">Back to login</Link>
    </AccountPage>
  );
}
