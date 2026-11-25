import "server-only";
import { cache } from "react";
import { databasePath, openDatabase } from "@/db/connection";
import { devProfile } from "@/db/dev-profile";
import {
  findProblem, findPublicUserProfile, findSubmission, findUser, listProblems,
  listPublicSubmissions, listUserSubmissions, readPracticeStats,
} from "@/db/practice";
import type { CurrentUser, PublicUserProfile } from "@/lib/practice";
import { derivePracticeStats } from "./practice-stats";
import { mockSubmissionIds, usesLocalDatabase } from "./practice-mode";
import {
  getMockPracticeStats, getMockProblem, getMockProblems, getMockSubmission, getMockSubmissions, mockProblemSlugs,
} from "./mock-practice";

export { usesLocalDatabase };

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

export const getUserProfile = cache(async (username: string): Promise<PublicUserProfile | null> => {
  if (usesLocalDatabase()) return withLocalDatabase((db) => findPublicUserProfile(db, username));
  if (username !== devProfile.username) return null;

  const submissions = getMockSubmissions().filter((submission) => submission.username === username);
  const solvedProblems = new Set(
    submissions.filter((submission) => submission.verdict === "AC").map((submission) => submission.problem.slug),
  ).size;
  return {
    username,
    displayName: devProfile.displayName,
    joinedAt: "2026-11-01T00:00:00.000Z",
    solvedProblems,
    totalAttempts: submissions.length,
  };
});

export function getSampleProfileUsernames() {
  return usesLocalDatabase() ? [] : [devProfile.username];
}

export const getProblem = cache(async (slug: string) => {
  if (!usesLocalDatabase()) return getMockProblem(slug);
  const user = await getCurrentUser();
  return withLocalDatabase((db) => findProblem(db, slug, user?.id ?? null));
});

export async function getPublicSubmissions() {
  if (!usesLocalDatabase()) return getMockSubmissions();
  return withLocalDatabase(listPublicSubmissions);
}

export async function getPersonalSubmissions() {
  const user = await getCurrentUser();
  if (!user) return [];
  if (!usesLocalDatabase()) return getMockSubmissions().filter((submission) => submission.username === user.username);
  return withLocalDatabase((db) => listUserSubmissions(db, user.id));
}

export const getSubmission = cache(async (id: string) => {
  if (!usesLocalDatabase()) return getMockSubmission(id);
  return withLocalDatabase((db) => findSubmission(db, id));
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
