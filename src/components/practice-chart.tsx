import type { PracticeStats } from "@/lib/practice";

export function PracticeChart({ stats, isMock }: { stats: PracticeStats; isMock: boolean }) {
  const { days, today, monthLabel } = stats;
  const total = days.reduce((sum, entry) => sum + (entry.solved ?? 0), 0);
  const peak = Math.max(...days.map((entry) => entry.solved ?? 0));
  const tickSize = Math.max(isMock ? 2 : 1, Math.ceil(peak / 3));
  const maximum = tickSize * 3;
  const chartWidth = 960;
  const plotLeft = 40;
  const plotRight = 16;
  const plotTop = 20;
  const plotHeight = 168;
  const baseline = plotTop + plotHeight;
  const columnWidth = (chartWidth - plotLeft - plotRight) / days.length;

  return (
    <figure className="mt-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-bold">{monthLabel}</h3>
        <p className="text-sm text-muted">{total} solved{isMock && " · mock total"}</p>
      </div>
      <div
        role="region"
        aria-label="Daily practice chart. Scroll horizontally on small screens."
        tabIndex={0}
        className="overflow-x-auto rounded-md border border-border"
      >
        <svg
          viewBox={`0 0 ${chartWidth} 240`}
          role="img"
          aria-labelledby="practice-chart-title practice-chart-description"
          className="block w-full min-w-[960px] font-sans"
        >
          <title id="practice-chart-title">{`${isMock ? "Mock problems" : "Problems"} solved per day in ${monthLabel}`}</title>
          <desc id="practice-chart-description">
            Future days have no data. The expandable daily data table below contains every value.
          </desc>
          {[0, tickSize, tickSize * 2, maximum].map((count) => {
            const y = baseline - (count / maximum) * plotHeight;
            return (
              <g key={count}>
                <line x1={plotLeft} x2={chartWidth - plotRight} y1={y} y2={y} stroke="var(--border)" />
                <text x={plotLeft - 12} y={y + 4} textAnchor="end" fill="var(--muted)" fontSize="12">{count}</text>
              </g>
            );
          })}
          {days.map((entry, index) => {
            const x = plotLeft + index * columnWidth + columnWidth / 2;
            const height = ((entry.solved ?? 0) / maximum) * plotHeight;
            const isToday = entry.date === today;
            const description = entry.solved === null ? "No data (future day)" : `${entry.solved} problems solved`;

            return (
              <g key={entry.date}>
                <title>{`${entry.date}: ${description}`}</title>
                {entry.solved === null ? (
                  <line x1={x - columnWidth * 0.25} x2={x + columnWidth * 0.25} y1={baseline - 2} y2={baseline - 2} stroke="var(--muted)" strokeDasharray="2 2" />
                ) : entry.solved === 0 ? (
                  <circle cx={x} cy={baseline - 2} r="2" fill="var(--accent)" />
                ) : (
                  <rect x={x - columnWidth * 0.25} y={baseline - height} width={columnWidth * 0.5} height={height} rx="2" fill="var(--accent)" />
                )}
                <text x={x} y={baseline + 22} textAnchor="middle" fill={isToday ? "var(--accent)" : "var(--muted)"} fontSize="12" fontWeight={isToday ? "700" : "400"}>
                  {entry.day}
                </text>
                {isToday && <circle cx={x} cy={baseline + 31} r="2" fill="var(--accent)" />}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 text-sm leading-6 text-muted">
        {isMock ? "Example daily solve counts. " : "Each problem counts on the day you first solved it. "}
        A blue dot on the baseline means zero, a dashed mark means a future day,
        and a dot below a day label marks today.
      </figcaption>
      <details className="mt-3 text-sm">
        <summary className="w-fit cursor-pointer py-2 font-bold text-accent hover:underline">View daily data</summary>
        <div className="mt-2 max-h-72 overflow-auto rounded-md border border-border" tabIndex={0} role="region" aria-label="Daily practice data">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Daily problems solved in {monthLabel}{isMock && " (mock data)"}</caption>
            <thead className="sticky top-0 bg-background">
              <tr>
                <th scope="col" className="px-4 py-2 font-bold">Date</th>
                <th scope="col" className="px-4 py-2 font-bold">Problems solved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {days.map((entry) => (
                <tr key={entry.date}>
                  <th scope="row" className="px-4 py-2 font-normal">{entry.date}</th>
                  <td className="px-4 py-2">{entry.solved ?? "No data (future day)"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
