import type { ComponentProps, ReactNode } from "react";
import type { DifficultyBadge } from "@/components/difficulty-badge";

type Problem = {
  id: string;
  title: string;
  difficulty: ComponentProps<typeof DifficultyBadge>["difficulty"];
  tags: readonly string[];
  status: "Not attempted" | "Solved";
  statement: ReactNode;
  code: string;
} & (
  | { type: "Predict Output" }
  | { type: "Find the Error"; options: readonly string[] }
);

export const problems: readonly Problem[] = [
  {
    id: "CL001",
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    tags: ["Input/Output", "Arithmetic"],
    status: "Not attempted",
    type: "Predict Output",
    statement: (
      <>
        <p>
          This JavaScript program converts two strings to numbers with{" "}
          <code>Number()</code> and then adds them.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Work out what value is passed to <code>console.log()</code>.</li>
          <li>Enter only the text printed to the console.</li>
        </ul>
      </>
    ),
    code: `const first = Number("7");
const second = Number("12");
const sum = first + second;

console.log(sum);`,
  },
  {
    id: "CL002",
    title: "Last Item in an Array",
    difficulty: "Easy",
    tags: ["Arrays", "Indexing"],
    status: "Not attempted",
    type: "Find the Error",
    statement: (
      <>
        <p>
          This JavaScript program should print the last item in <code>colors</code>,
          but it reads past the end of the array.
        </p>
        <p>
          Choose the expression that should replace <code>colors.length</code> in
          the assignment to <code>lastIndex</code>. The fix should also work if
          more colors are added.
        </p>
      </>
    ),
    code: `const colors = ["red", "green", "blue"];
const lastIndex = colors.length;
const lastColor = colors[lastIndex];

console.log(lastColor);`,
    options: ["colors.length + 1", "colors.length - 1", "colors.length", "0"],
  },
];
