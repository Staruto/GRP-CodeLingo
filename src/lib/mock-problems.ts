export type ProblemDifficulty = "Easy" | "Medium" | "Hard";
export type ProblemType = "Predict Output" | "Find the Error";
export type ProblemStatus = "Not attempted" | "Solved";

export type MockProblem = {
  id: string;
  slug: string;
  title: string;
  type: ProblemType;
  difficulty: ProblemDifficulty;
  tags: readonly string[];
  status: ProblemStatus;
};

export const problemTypes = [
  "Predict Output",
  "Find the Error",
] as const satisfies readonly ProblemType[];

export const problemDifficulties = [
  "Easy",
  "Medium",
  "Hard",
] as const satisfies readonly ProblemDifficulty[];

export const mockProblems: readonly MockProblem[] = [
  {
    id: "CL001",
    slug: "CL001",
    title: "Sum of Two Numbers",
    type: "Predict Output",
    difficulty: "Easy",
    tags: ["Input/Output", "Arithmetic"],
    status: "Not attempted",
  },
  {
    id: "CL002",
    slug: "CL002",
    title: "The Last Array Element",
    type: "Find the Error",
    difficulty: "Easy",
    tags: ["Arrays", "Indexing"],
    status: "Solved",
  },
  {
    id: "CL003",
    slug: "CL003",
    title: "Counting with a Loop",
    type: "Predict Output",
    difficulty: "Easy",
    tags: ["Loops", "Arithmetic"],
    status: "Solved",
  },
  {
    id: "CL004",
    slug: "CL004",
    title: "A Condition That Never Matches",
    type: "Find the Error",
    difficulty: "Easy",
    tags: ["Conditionals", "Variables"],
    status: "Not attempted",
  },
  {
    id: "CL005",
    slug: "CL005",
    title: "Building a Message",
    type: "Predict Output",
    difficulty: "Medium",
    tags: ["Strings", "Loops"],
    status: "Not attempted",
  },
  {
    id: "CL006",
    slug: "CL006",
    title: "Where Did the Variable Go?",
    type: "Find the Error",
    difficulty: "Medium",
    tags: ["Variables", "Scope", "Functions"],
    status: "Solved",
  },
  {
    id: "CL007",
    slug: "CL007",
    title: "Following Nested Loops",
    type: "Predict Output",
    difficulty: "Medium",
    tags: ["Loops", "Arrays"],
    status: "Solved",
  },
  {
    id: "CL008",
    slug: "CL008",
    title: "Numbers Hidden in Strings",
    type: "Find the Error",
    difficulty: "Medium",
    tags: ["Strings", "Type Conversion"],
    status: "Not attempted",
  },
  {
    id: "CL009",
    slug: "CL009",
    title: "Tracing Recursive Calls",
    type: "Predict Output",
    difficulty: "Hard",
    tags: ["Recursion", "Functions"],
    status: "Not attempted",
  },
  {
    id: "CL010",
    slug: "CL010",
    title: "The Missing Base Case",
    type: "Find the Error",
    difficulty: "Hard",
    tags: ["Recursion", "Conditionals"],
    status: "Solved",
  },
  {
    id: "CL011",
    slug: "CL011",
    title: "Following Shared References",
    type: "Predict Output",
    difficulty: "Hard",
    tags: ["Arrays", "References"],
    status: "Not attempted",
  },
  {
    id: "CL012",
    slug: "CL012",
    title: "A Search That Skips the Answer",
    type: "Find the Error",
    difficulty: "Hard",
    tags: ["Searching", "Arrays", "Indexing"],
    status: "Not attempted",
  },
];

export function filterProblems(
  problems: readonly MockProblem[],
  filters: {
    query: string;
    type: ProblemType | "";
    difficulty: ProblemDifficulty | "";
    tag: string;
  },
): MockProblem[] {
  const query = filters.query.trim().toLowerCase();

  return problems.filter((problem) => {
    const matchesQuery =
      problem.title.toLowerCase().includes(query) ||
      problem.id.toLowerCase().includes(query);

    return (
      matchesQuery &&
      (!filters.type || problem.type === filters.type) &&
      (!filters.difficulty || problem.difficulty === filters.difficulty) &&
      (!filters.tag || problem.tags.includes(filters.tag))
    );
  });
}
