const submissionTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
  timeZoneName: "short",
});

export function SubmissionTime({ submittedAt }: { submittedAt: string }) {
  return <time dateTime={submittedAt}>{submissionTimeFormat.format(new Date(submittedAt))}</time>;
}
