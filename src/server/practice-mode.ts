export function usesLocalDatabase() {
  return process.env.NODE_ENV === "development" && process.env.CODELINGO_DATA_SOURCE === "sqlite";
}

export const mockSubmissionIds = ["SUB-001", "SUB-002"] as const;

export function isMockSubmissionId(id: string) {
  return mockSubmissionIds.some((sampleId) => sampleId === id);
}
