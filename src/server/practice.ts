import "server-only";
import { cache } from "react";
import { databasePath, openDatabase } from "@/db/connection";
import { devProfile } from "@/db/dev-profile";
import { findProblem, findSubmission, findUser, listProblems, readPracticeStats } from "@/db/practice";
import type { CurrentUser } from "@/lib/practice";
import { derivePracticeStats } from "./practice-stats";
import {
  getMockPracticeStats, getMockProblem, getMockProblems, getMockSubmission, mockProblemSlugs, mockSubmissionIds,
} from "./mock-practice";

export function usesLocalDatabase() {
  return process.env.NODE_ENV === "development" && process.env.CODELINGO_DATA_SOURCE === "sqlite";
}

export function withLocalDatabase<T>(run: (db: ReturnType<typeof openDatabase>) => T) {
  const db = openDatabase(databasePath());
  try {
    return run(db);
  } finally {
    db.close();
  }
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!usesLocalDatabase()) return devProfile;
  return withLocalDatabase((db) => findUser(db, devProfile.username));
});

export async function getProblems() {
  if (!usesLocalDatabase()) return getMockProblems();
  const user = await getCurrentUser();
  return withLocalDatabase((db) => listProblems(db, user?.id ?? null));
}

export const getProblem = cache(async (slug: string) => {
  if (!usesLocalDatabase()) return getMockProblem(slug);
  const user = await getCurrentUser();
  return withLocalDatabase((db) => findProblem(db, slug, user?.id ?? null));
});

export const getSubmission = cache(async (id: string) => {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!usesLocalDatabase()) return getMockSubmission(id);
  return withLocalDatabase((db) => findSubmission(db, id, user.id));
});

export async function getPracticeStats() {
  const user = await getCurrentUser();
  const now = Date.now();
  if (!usesLocalDatabase()) return getMockPracticeStats(now, user?.timeZone ?? "UTC");
  if (!user) return derivePracticeStats(now, "UTC", [], [], []);
  return withLocalDatabase((db) => readPracticeStats(db, user, now));
}

export function getSampleProblemSlugs() {
  return usesLocalDatabase() ? [] : mockProblemSlugs;
}

export async function getSampleSubmissions() {
  if (usesLocalDatabase()) return [];
  const views = await Promise.all(mockSubmissionIds.map(getSubmission));
  return views.filter((view) => view !== null).map(({ id, verdict }) => ({ id, verdict }));
}

export function getSampleSubmissionIds() {
  return usesLocalDatabase() ? [] : mockSubmissionIds;
}
