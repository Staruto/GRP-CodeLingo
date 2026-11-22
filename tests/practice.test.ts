import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { openDatabase } from "../src/db/connection";
import { migrate } from "../src/db/migrate";
import {
  findProblem, findSubmission, findUser, listProblems, readPracticeStats, recordSubmission,
} from "../src/db/practice";
import { seed } from "../src/db/seed";

function practiceDatabase(t: TestContext) {
  const db = openDatabase(":memory:");
  t.after(() => db.close());
  migrate(db);
  assert.ok(seed(db) >= 2);
  const alex = findUser(db, "alex");
  assert.ok(alex);
  return { db, alex };
}

test("migrations and reseeding preserve problem IDs, users, and submission history", (t) => {
  const { db, alex } = practiceDatabase(t);
  const readProblems = () => db.prepare("SELECT id, slug FROM problems ORDER BY slug").all();
  const problems = readProblems();
  assert.deepEqual(problems.slice(0, 2).map(({ slug }) => slug), ["CL001", "CL002"]);
  const id = recordSubmission(db, alex.id, "CL001", { type: "Predict Output", text: "19" });
  assert.ok(id);

  migrate(db);
  assert.equal(seed(db), 0);
  assert.deepEqual(readProblems(), problems);
  assert.deepEqual(findUser(db, "alex"), alex);
  assert.equal(findSubmission(db, id, alex.id)?.verdict, "AC");
});

test("both question types are graded, inputs are preserved, and submission lookup is owner-scoped", (t) => {
  const { db, alex } = practiceDatabase(t);
  const statuses = (userId: number | null) => listProblems(db, userId)
    .filter(({ slug }) => slug === "CL001" || slug === "CL002")
    .map(({ status }) => status);
  const initialStatuses = statuses(alex.id);
  assert.deepEqual(initialStatuses, ["Not attempted", "Not attempted"]);

  const rawText = "19 \t\r\n \t\r\n";
  const correct = recordSubmission(db, alex.id, "CL001", { type: "Predict Output", text: rawText });
  assert.ok(correct);
  assert.match(correct, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(findSubmission(db, correct, alex.id)?.submittedAnswer, rawText);
  assert.equal(findSubmission(db, correct, alex.id)?.verdict, "AC");

  const wrongText = recordSubmission(db, alex.id, "CL001", { type: "Predict Output", text: " 19" });
  const wrongChoice = recordSubmission(db, alex.id, "CL002", { type: "Find the Error", optionKey: "a" });
  assert.ok(wrongText && wrongChoice);
  assert.equal(findSubmission(db, wrongText, alex.id)?.verdict, "WA");
  assert.equal(findSubmission(db, wrongChoice, alex.id)?.verdict, "WA");
  assert.deepEqual(statuses(alex.id), ["Solved", "Attempted"]);

  const correctChoice = recordSubmission(db, alex.id, "CL002", { type: "Find the Error", optionKey: "b" });
  assert.ok(correctChoice);
  assert.equal(findSubmission(db, correctChoice, alex.id)?.verdict, "AC");
  assert.equal(findSubmission(db, correctChoice, alex.id)?.submittedAnswer, "count - 1");
  assert.deepEqual(statuses(alex.id), ["Solved", "Solved"]);

  assert.equal(recordSubmission(db, alex.id, "CL002", { type: "Find the Error", optionKey: "unknown" }), null);
  assert.equal(recordSubmission(db, alex.id, "CL002", { type: "Predict Output", text: "b" }), null);
  assert.equal(recordSubmission(db, alex.id, "missing", { type: "Predict Output", text: "19" }), null);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM submissions").get()?.count, 4);

  db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?)").run(2, "sam", "Sam", "UTC", 0);
  assert.equal(findSubmission(db, correct, 2), null);
  assert.equal(findSubmission(db, "missing", alex.id), null);
  assert.deepEqual(statuses(2), initialStatuses);
  assert.deepEqual(statuses(null), [null, null]);

  const problem = findProblem(db, "CL002", alex.id);
  assert.equal(problem?.type, "Find the Error");
  assert.deepEqual(problem.options.map(({ key }) => key), ["a", "b", "c", "d"]);
  assert.doesNotMatch(JSON.stringify(problem), /correctOptionKey|correct_option_key|expectedOutput|expected_output/);
});

test("SQLite rejects modifications, replacement, invalid verdicts, and cross-problem choices", (t) => {
  const { db, alex } = practiceDatabase(t);
  const id = recordSubmission(db, alex.id, "CL001", { type: "Predict Output", text: "19" });
  assert.ok(id);
  const problemId = Number(db.prepare("SELECT id FROM problems WHERE slug = 'CL001'").get()?.id);

  assert.throws(() => db.prepare("UPDATE submissions SET verdict = 'WA' WHERE id = ?").run(id), /immutable/);
  assert.throws(() => db.prepare("DELETE FROM submissions WHERE id = ?").run(id), /immutable/);
  assert.throws(() => db.prepare("DELETE FROM users WHERE id = ?").run(alex.id), /FOREIGN KEY/);
  assert.throws(() => db.prepare("DELETE FROM problems WHERE id = ?").run(problemId), /FOREIGN KEY/);
  assert.throws(() => db.prepare("INSERT OR REPLACE INTO submissions SELECT * FROM submissions WHERE id = ?").run(id), /immutable/);
  assert.throws(() => db.prepare(
    "INSERT INTO submissions VALUES ('cross-problem', ?, ?, 'WA', 0, NULL, 'b')",
  ).run(alex.id, problemId), /FOREIGN KEY/);
  assert.throws(() => db.prepare(
    "UPDATE problem_answers SET expected_output = NULL, correct_option_key = 'b' WHERE problem_id = ?",
  ).run(problemId), /FOREIGN KEY/);
  assert.throws(() => db.prepare(
    "INSERT INTO submissions VALUES ('unknown-verdict', ?, ?, 'unknown', 0, '19', NULL)",
  ).run(alex.id, problemId), /FOREIGN KEY/);
  assert.equal(findSubmission(db, id, alex.id)?.verdict, "AC");
});

test("stats use local first solves, accepted streak days, and all graded attempts per tag", (t) => {
  const { db, alex } = practiceDatabase(t);
  const now = Date.parse("2026-12-02T16:30:00Z");
  const empty = readPracticeStats(db, alex, now);
  assert.equal(empty.today, "2026-12-03");
  assert.equal(empty.streak, 0);
  assert.ok(empty.topics.every(({ accuracy }) => accuracy === null));
  assert.deepEqual(empty.days.slice(0, 4).map(({ solved }) => solved), [0, 0, 0, null]);

  // Shanghai midnight separates the first two acceptances into different months.
  recordSubmission(db, alex.id, "CL001", { type: "Predict Output", text: "19" }, Date.parse("2026-11-30T15:59:00Z"));
  recordSubmission(db, alex.id, "CL002", { type: "Find the Error", optionKey: "b" }, Date.parse("2026-11-30T16:01:00Z"));
  recordSubmission(db, alex.id, "CL001", { type: "Predict Output", text: "19" }, Date.parse("2026-12-01T16:01:00Z"));
  recordSubmission(db, alex.id, "CL001", { type: "Predict Output", text: "20" }, Date.parse("2026-12-02T16:01:00Z"));

  const stats = readPracticeStats(db, alex, now);
  assert.equal(stats.streak, 3);
  assert.deepEqual(stats.days.slice(0, 4).map(({ solved }) => solved), [1, 0, 0, null]);
  for (const tag of ["Arithmetic", "Input/Output"]) {
    assert.deepEqual(stats.topics.find((topic) => topic.tag === tag), { tag, accepted: 2, attempts: 3, accuracy: 2 / 3 });
  }
  assert.equal(readPracticeStats(db, alex, Date.parse("2026-12-03T16:30:00Z")).streak, 0);
});
