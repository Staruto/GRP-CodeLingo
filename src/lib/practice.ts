export const singleSelectTypes = ["Find the Error", "Complexity Analysis"] as const;
export const problemTypes = ["Predict Output", ...singleSelectTypes] as const;
export const problemDifficulties = ["Easy", "Medium", "Hard"] as const;

export type ProblemType = (typeof problemTypes)[number];
export type SingleSelectType = (typeof singleSelectTypes)[number];
export type ProblemDifficulty = (typeof problemDifficulties)[number];
export type ProblemStatus = "Not attempted" | "Attempted" | "Solved";
export type Verdict = "AC" | "WA";
export type UserRole = "user" | "admin";

export type CurrentUser = {
  id: number;
  username: string;
  displayName: string;
  timeZone: string;
  role: UserRole;
};

export type PublicUserProfile = Pick<CurrentUser, "username" | "displayName"> & {
  joinedAt: string;
  solvedProblems: number;
  totalAttempts: number;
};

export type ProblemSummary = {
  slug: string;
  title: string;
  type: ProblemType;
  difficulty: ProblemDifficulty;
  tags: readonly string[];
  status: ProblemStatus | null;
};

export type ProblemOption = { key: string; label: string };

export type ProblemDetail = Omit<ProblemSummary, "type"> & {
  statementMarkdown: string;
  exampleCode: string;
  codeLanguage: string;
} & (
  | { type: "Predict Output" }
  | { type: SingleSelectType; options: readonly ProblemOption[] }
);

export const submissionHistoryLimit = 50;

export type SubmissionSummary = {
  id: string;
  submittedAt: string;
  username: string;
  problem: Pick<ProblemSummary, "slug" | "title">;
  verdict: Verdict;
};

export type SubmissionView = Omit<SubmissionSummary, "problem"> & {
  problem: Pick<ProblemSummary, "slug" | "title" | "type">;
  submittedAnswer: string;
};

export type PracticeDay = { day: number; date: string; solved: number | null };

export type PracticeStats = {
  days: readonly PracticeDay[];
  today: string;
  monthLabel: string;
  streak: number;
  topics: readonly {
    tag: string;
    accepted: number;
    attempts: number;
    accuracy: number | null;
  }[];
};

export function filterProblems(
  problems: readonly ProblemSummary[],
  filters: {
    query: string;
    type: ProblemType | "";
    difficulty: ProblemDifficulty | "";
    tag: string;
  },
) {
  const query = filters.query.trim().toLowerCase();
  return problems.filter((problem) =>
    (problem.title.toLowerCase().includes(query) || problem.slug.toLowerCase().includes(query)) &&
    (!filters.type || problem.type === filters.type) &&
    (!filters.difficulty || problem.difficulty === filters.difficulty) &&
    (!filters.tag || problem.tags.includes(filters.tag)),
  );
}
