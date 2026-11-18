export type SubmissionResult = "Correct" | "Incorrect";

type MockSubmissionDetail = {
  id: string;
  submittedAt: string;
  username: string;
  problem: {
    id: string;
    title: string;
    questionType: "Predict Output" | "Find the Error";
  };
  submittedAnswer: string;
  result: SubmissionResult;
};

export const mockSubmissionDetails: readonly MockSubmissionDetail[] = [
  {
    id: "SUB-001",
    submittedAt: "2026-11-15T09:42:00Z",
    username: "alex",
    problem: {
      id: "CL001",
      title: "Sum of Two Numbers",
      questionType: "Predict Output",
    },
    submittedAnswer: "5",
    result: "Correct",
  },
  {
    id: "SUB-002",
    submittedAt: "2026-11-15T09:47:00Z",
    username: "alex",
    problem: {
      id: "CL002",
      title: "Last Item in an Array",
      questionType: "Find the Error",
    },
    submittedAnswer: "Option B",
    result: "Incorrect",
  },
];

export function getMockSubmissionDetail(submissionId: string) {
  return mockSubmissionDetails.find((submission) => submission.id === submissionId);
}
