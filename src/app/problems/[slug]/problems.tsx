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
          This C program adds two integers and prints their sum.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Work out the value of <code>sum</code> when <code>printf()</code> runs.</li>
          <li>Enter only the text printed to the console.</li>
        </ul>
      </>
    ),
    code: `#include <stdio.h>

int main(void) {
    int first = 7;
    int second = 12;
    int sum = first + second;

    printf("%d\\n", sum);
    return 0;
}`,
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
          This C program should print the last item in <code>colors</code>,
          but its index points past the end of the array. Reading outside the
          array causes undefined behavior.
        </p>
        <p>
          Choose the expression that should replace <code>count</code> in the
          assignment to <code>lastIndex</code>. The fix should also work if
          more colors are added.
        </p>
      </>
    ),
    code: `#include <stdio.h>

int main(void) {
    const char *colors[] = {"red", "green", "blue"};
    int count = sizeof(colors) / sizeof(colors[0]);
    int lastIndex = count;

    printf("%s\\n", colors[lastIndex]);
    return 0;
}`,
    options: ["count + 1", "count - 1", "count", "0"],
  },
];
