"use client";

import { useSyncExternalStore } from "react";
import { createMockPracticeMonth } from "@/lib/mock-practice";

// A stable string snapshot avoids hydration mismatches and refreshes after midnight.
function getLocalDay() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function subscribeToLocalDay(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  window.addEventListener("focus", onChange);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", onChange);
  };
}

const getServerDay = () => "";

export function PracticeChart() {
  const localDay = useSyncExternalStore(subscribeToLocalDay, getLocalDay, getServerDay);

  if (!localDay) {
    return (
      <div className="mt-5 flex min-h-80 items-center justify-center border-y border-border text-sm text-muted">
        <p role="status">
          The example chart loads using your local calendar month.
          <noscript> Enable JavaScript to view the chart.</noscript>
        </p>
      </div>
    );
  }

  const [year, month, day] = localDay.split("-").map(Number);
  const today = new Date(year, month - 1, day);
  const days = createMockPracticeMonth(today);
  const monthLabel = today.toLocaleDateString("en", { month: "long", year: "numeric" });
  const total = days.reduce((sum, entry) => sum + (entry.solved ?? 0), 0);
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
        <p className="text-sm text-muted">{total} solved · mock total</p>
      </div>
      <div
        role="region"
        aria-label="Daily mock practice chart; scroll horizontally on small screens"
        tabIndex={0}
        className="overflow-x-auto rounded-md border border-border"
      >
        <svg
          viewBox={`0 0 ${chartWidth} 240`}
          role="img"
          aria-labelledby="practice-chart-title practice-chart-description"
          className="block w-full min-w-[960px] font-sans"
        >
          <title id="practice-chart-title">Mock problems solved per day in {monthLabel}</title>
          <desc id="practice-chart-description">
            Example counts from zero to six. Future days have no data. The expandable daily data table below contains every value.
          </desc>
          {[0, 2, 4, 6].map((count) => {
            const y = baseline - (count / 6) * plotHeight;
            return (
              <g key={count}>
                <line x1={plotLeft} x2={chartWidth - plotRight} y1={y} y2={y} stroke="var(--border)" />
                <text x={plotLeft - 12} y={y + 4} textAnchor="end" fill="var(--muted)" fontSize="12">{count}</text>
              </g>
            );
          })}
          {days.map((entry, index) => {
            const x = plotLeft + index * columnWidth + columnWidth / 2;
            const height = ((entry.solved ?? 0) / 6) * plotHeight;
            const isToday = entry.day === day;

            return (
              <g key={entry.date}>
                <title>
                  {entry.date}: {entry.solved === null ? "No data (future day)" : `${entry.solved} problems solved (mock)`}
                </title>
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
        Mock data only, not your actual activity. Each bar represents problems
        solved in a day; a blue dot on the baseline means zero, a dashed mark
        means a future day, and a dot below a day label marks today. Dates use
        your local calendar.
      </figcaption>
      <details className="mt-3 text-sm">
        <summary className="w-fit cursor-pointer py-2 font-bold text-accent hover:underline">View daily data</summary>
        <div className="mt-2 max-h-72 overflow-auto rounded-md border border-border" tabIndex={0} role="region" aria-label="Daily mock practice data">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Daily problems solved in {monthLabel} — mock data</caption>
            <thead className="sticky top-0 bg-background">
              <tr>
                <th scope="col" className="px-4 py-2 font-bold">Date</th>
                <th scope="col" className="px-4 py-2 font-bold">Problems solved (mock)</th>
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
