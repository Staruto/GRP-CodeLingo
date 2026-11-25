import { type NextRequest, NextResponse } from "next/server";
import { isMockSubmissionId, usesLocalDatabase } from "@/server/practice-mode";

export const config = { matcher: "/submissions/:submissionId" };

export function proxy(request: NextRequest) {
  if (usesLocalDatabase()) return NextResponse.next();
  try {
    const id = decodeURIComponent(request.nextUrl.pathname.split("/")[2]);
    if (id === "me" || isMockSubmissionId(id)) return NextResponse.next();
  } catch {
    // Malformed percent-encoding cannot identify a sample submission.
  }

  // Return a 404 before the cached detail page starts streaming its shell.
  return NextResponse.rewrite(new URL("/submissions/status/404", request.url));
}
