"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { recordSubmission } from "@/db/practice";
import { getCurrentUser, usesLocalDatabase, withLocalDatabase } from "./practice";

export async function submitAnswer(slug: string, _previousError: string | null, form: FormData) {
  if (!usesLocalDatabase()) return "Grading is available in local practice mode.";
  const user = await getCurrentUser();
  if (!user) return "A practice user is required to submit an answer.";

  const texts = form.getAll("submittedText");
  const keys = form.getAll("selectedOptionKey");
  const text = texts[0];
  const key = keys[0];
  let id: string | null;
  if (texts.length === 1 && typeof text === "string" && keys.length === 0) {
    id = withLocalDatabase((db) => recordSubmission(db, user.id, slug, { type: "Predict Output", text }));
  } else if (keys.length === 1 && typeof key === "string" && texts.length === 0) {
    id = withLocalDatabase((db) => recordSubmission(db, user.id, slug, { type: "Find the Error", optionKey: key }));
  } else {
    return "Enter an answer or select one of the available options.";
  }

  if (!id) return "This answer could not be graded. Reload the question and try again.";
  revalidatePath("/");
  revalidatePath("/problems");
  revalidatePath(`/problems/${slug}`);
  redirect(`/submissions/${id}`);
}
