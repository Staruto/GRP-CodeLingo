import type { PracticeStats } from "../lib/practice";

export function practiceCalendar(now: number, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  });
  function dateAt(timestamp: number) {
    const parts = formatter.formatToParts(timestamp);
    const year = parts.find(({ type }) => type === "year")?.value;
    const month = parts.find(({ type }) => type === "month")?.value;
    const day = parts.find(({ type }) => type === "day")?.value;
    return `${year}-${month}-${day}`;
  }

  const today = dateAt(now);
  const [year, month, day] = today.split("-").map(Number);
  const monthLength = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthLabel = new Intl.DateTimeFormat("en", {
    timeZone, month: "long", year: "numeric",
  }).format(now);

  // UTC here is only a calendar coordinate, so advancing a date works across DST changes.
  const dateOfDay = (dayNumber: number) => new Date(Date.UTC(year, month - 1, dayNumber))
    .toISOString().slice(0, 10);

  return { today, monthLabel, monthLength, month, year, day, dateAt, dateOfDay };
}

export function derivePracticeStats(
  now: number,
  timeZone: string,
  firstAcceptances: readonly number[],
  acceptances: readonly number[],
  topics: PracticeStats["topics"],
): PracticeStats {
  const calendar = practiceCalendar(now, timeZone);
  const solvedByDate = new Map<string, number>();
  for (const timestamp of firstAcceptances) {
    const date = calendar.dateAt(timestamp);
    solvedByDate.set(date, (solvedByDate.get(date) ?? 0) + 1);
  }

  const activeDates = new Set(acceptances.map(calendar.dateAt));
  let streak = 0;
  let streakDay = activeDates.has(calendar.today) ? calendar.day : calendar.day - 1;
  while (activeDates.has(calendar.dateOfDay(streakDay))) {
    streak++;
    streakDay--;
  }

  const days = Array.from({ length: calendar.monthLength }, (_, index) => {
    const day = index + 1;
    const date = calendar.dateOfDay(day);
    return { day, date, solved: day > calendar.day ? null : (solvedByDate.get(date) ?? 0) };
  });

  return { days, today: calendar.today, monthLabel: calendar.monthLabel, streak, topics };
}
