import "server-only";
import { readPublicProblem } from "@/db/content";
import { devProfile } from "@/db/dev-profile";
import type { PracticeStats, ProblemDetail, ProblemStatus, ProblemSummary, SubmissionView } from "@/lib/practice";
import { practiceCalendar } from "./practice-stats";

const sampleStatuses = new Map<string, ProblemStatus>([
  ["CL001", "Solved"],
  ["CL002", "Attempted"],
  ["CL013", "Not attempted"],
]);
export const mockProblemSlugs = [...sampleStatuses.keys()];
export const mockSubmissionIds = ["SUB-001", "SUB-002"] as const;

export function getMockProblem(slug: string): ProblemDetail | null {
  const status = sampleStatuses.get(slug);
  return status ? { ...readPublicProblem(slug), status } : null;
}

const cataloguePreviews: readonly ProblemSummary[] = [
  {
    slug: "CL003",
    title: "Counting with a Loop",
    type: "Predict Output",
    difficulty: "Easy",
    tags: ["Loops", "Arithmetic"],
    status: "Solved",
  },
  {
    slug: "CL004",
    title: "A Condition That Never Matches",
    type: "Find the Error",
    difficulty: "Easy",
    tags: ["Conditionals", "Variables"],
    status: "Not attempted",
  },
  {
    slug: "CL005",
    title: "Building a Message",
    type: "Predict Output",
    difficulty: "Medium",
    tags: ["Strings", "Loops"],
    status: "Not attempted",
  },
  {
    slug: "CL006",
    title: "Where Did the Variable Go?",
    type: "Find the Error",
    difficulty: "Medium",
    tags: ["Variables", "Scope", "Functions"],
    status: "Solved",
  },
  {
    slug: "CL007",
    title: "Following Nested Loops",
    type: "Predict Output",
    difficulty: "Medium",
    tags: ["Loops", "Arrays"],
    status: "Solved",
  },
  {
    slug: "CL008",
    title: "Numbers Hidden in Strings",
    type: "Find the Error",
    difficulty: "Medium",
    tags: ["Strings", "Type Conversion"],
    status: "Not attempted",
  },
  {
    slug: "CL009",
    title: "Tracing Recursive Calls",
    type: "Predict Output",
    difficulty: "Hard",
    tags: ["Recursion", "Functions"],
    status: "Not attempted",
  },
  {
    slug: "CL010",
    title: "The Missing Base Case",
    type: "Find the Error",
    difficulty: "Hard",
    tags: ["Recursion", "Conditionals"],
    status: "Solved",
  },
  {
    slug: "CL011",
    title: "Following Shared References",
    type: "Predict Output",
    difficulty: "Hard",
    tags: ["Arrays", "References"],
    status: "Not attempted",
  },
  {
    slug: "CL012",
    title: "A Search That Skips the Answer",
    type: "Find the Error",
    difficulty: "Hard",
    tags: ["Searching", "Arrays", "Indexing"],
    status: "Not attempted",
  },
];

export function getMockProblems(): readonly ProblemSummary[] {
  const completed = mockProblemSlugs.map((slug) => {
    const { title, type, difficulty, tags, status } = getMockProblem(slug)!;
    return { slug, title, type, difficulty, tags, status };
  });
  return [...completed, ...cataloguePreviews].sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getMockSubmission(id: string): SubmissionView | null {
  if (id !== "SUB-001" && id !== "SUB-002") return null;
  const first = id === "SUB-001";
  const { slug, title, type } = getMockProblem(first ? "CL001" : "CL002")!;
  return {
    id,
    submittedAt: first ? "2026-11-15T09:42:00Z" : "2026-11-15T09:47:00Z",
    username: devProfile.username,
    timeZone: devProfile.timeZone,
    problem: { slug, title, type },
    submittedAnswer: first ? "19" : "count + 1",
    verdict: first ? "AC" : "WA",
  };
}

export function getMockPracticeStats(now: number, timeZone: string): PracticeStats {
  const { monthLength, day: todayDay, month, year, today, monthLabel, dateOfDay } = practiceCalendar(now, timeZone);
  const days = Array.from({ length: monthLength }, (_, index) => {
    const day = index + 1;
    const solved = day > todayDay ? null : ((day * 11 + (month - 1) * 3 + year) % 9) % 7;
    return { day, date: dateOfDay(day), solved };
  });
  return { days, today, monthLabel, streak: 0, topics: [] };
}
