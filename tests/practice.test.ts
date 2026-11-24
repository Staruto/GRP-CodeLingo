import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test, type TestContext } from "node:test";
import { openDatabase } from "../src/db/connection";
import { readPublicProblem } from "../src/db/content";
import { devProfile } from "../src/db/dev-profile";
import { migrate } from "../src/db/migrate";
import {
  findProblem, findSubmission, findUser, listProblems, readPracticeStats, recordSubmission,
} from "../src/db/practice";
import { seed } from "../src/db/seed";
import { filterProblems } from "../src/lib/practice";

function practiceDatabase(t: TestContext) {
  const db = openDatabase(":memory:");
  t.after(() => db.close());
  migrate(db);
  assert.ok(seed(db) >= 2);
  const alex = findUser(db, "alex");
  assert.ok(alex);
  return { db, alex };
}

test("the role migration upgrades an existing user without changing their submissions", (t) => {
  const db = openDatabase(":memory:");
  t.after(() => db.close());
  db.exec(readFileSync("src/db/migrations/001_practice.sql", "utf8"));
  db.exec(`
    CREATE TABLE schema_migrations (name TEXT PRIMARY KEY) STRICT;
    INSERT INTO schema_migrations (name) VALUES ('001_practice.sql');
    INSERT INTO users (id, username, display_name, time_zone, created_at)
    VALUES (7, 'legacy', 'Legacy User', 'UTC', 100);
    INSERT INTO problems (id, slug, title, question_type, difficulty, statement_markdown, example_code, code_language)
    VALUES (9, 'legacy-problem', 'Legacy Problem', 'Predict Output', 'Easy', 'Predict the output.', '', 'c');
    INSERT INTO submissions (id, user_id, problem_id, verdict, submitted_at, submitted_text)
    VALUES ('legacy-attempt', 7, 9, 'AC', 200, '19');
  `);
  const originalSubmission = db.prepare("SELECT * FROM submissions WHERE id = 'legacy-attempt'").get();
  assert.ok(originalSubmission);

  migrate(db);
  migrate(db);

  assert.deepEqual(findUser(db, "legacy"), {
    id: 7, username: "legacy", displayName: "Legacy User", timeZone: "UTC", role: "user",
  });
  assert.equal(db.prepare("SELECT created_at FROM users WHERE id = 7").get()?.created_at, 100);
  assert.deepEqual(db.prepare("SELECT * FROM submissions WHERE id = 'legacy-attempt'").get(), originalSubmission);
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
});

test("user lookups return both roles and reseeding preserves them", (t) => {
  const { db, alex } = practiceDatabase(t);
  const insertWithRole = db.prepare(`
    INSERT INTO users (username, display_name, time_zone, created_at, role) VALUES (?, ?, 'UTC', 0, ?)
  `);
  insertWithRole.run("test-admin", "Test Admin", "admin");
  db.prepare(`
    INSERT INTO users (username, display_name, time_zone, created_at) VALUES ('test-user', 'Test User', 'UTC', 0)
  `).run();

  assert.equal(devProfile.role, "user");
  assert.equal(alex.role, "user");
  const admin = findUser(db, "test-admin");
  const user = findUser(db, "test-user");
  assert.equal(admin?.role, "admin");
  assert.equal(user?.role, "user");
  assert.equal(findUser(db, "missing"), null);
  assert.throws(() => insertWithRole.run("invalid", "Invalid Role", "moderator"), /CHECK constraint failed/);
  assert.throws(() => insertWithRole.run("null-role", "Missing Role", null), /NOT NULL constraint failed/);

  assert.equal(seed(db), 0);
  assert.deepEqual(findUser(db, "alex"), alex);
  assert.deepEqual(findUser(db, "test-admin"), admin);
  assert.deepEqual(findUser(db, "test-user"), user);
});

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

function databaseBeforeComplexityMigration(t: TestContext) {
  const db = openDatabase(":memory:");
  t.after(() => db.close());
  db.exec("CREATE TABLE schema_migrations (name TEXT PRIMARY KEY) STRICT");
  for (const file of ["001_practice.sql", "002_user_roles.sql", "003_account_credentials.sql"]) {
    db.exec(readFileSync(`src/db/migrations/${file}`, "utf8"));
    db.prepare("INSERT INTO schema_migrations VALUES (?)").run(file);
  }
  db.exec(`
    INSERT INTO users (id, username, display_name, time_zone, role, created_at)
      VALUES (7, 'legacy', 'Legacy Admin', 'UTC', 'admin', 100);
    INSERT INTO problems VALUES (15, 'old', 'Old question', 'Find the Error', 'Easy', 'Fix it.', 'i++;', 'c');
    INSERT INTO tags VALUES (3, 'Loops');
    INSERT INTO problem_tags VALUES (15, 3);
    INSERT INTO problem_options VALUES (15, 'keep', 'i++', 1), (15, 'change', 'i--', 2);
    INSERT INTO problem_answers VALUES (15, NULL, 'change');
    INSERT INTO submissions VALUES
      ('first', 7, 15, 'WA', 110, NULL, 'keep'), ('second', 7, 15, 'AC', 120, NULL, 'change');
  `);
  return db;
}

test("the complexity migration preserves existing problem content, option keys and attempts", (t) => {
  const db = databaseBeforeComplexityMigration(t);
  const tables = ["users", "problems", "tags", "problem_tags", "problem_options", "problem_answers", "submissions"];
  const snapshot = () => tables.map((table) => db.prepare(`SELECT * FROM ${table} ORDER BY 1, 2`).all());
  const before = snapshot();

  migrate(db);
  migrate(db);
  assert.deepEqual(snapshot(), before);
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
  assert.equal(db.prepare("PRAGMA foreign_keys").get()?.foreign_keys, 1);
  assert.throws(() => db.exec("UPDATE problems SET question_type = 'Unknown' WHERE id = 15"), /CHECK/);
  seed(db);
  assert.equal(findProblem(db, "CL013", 7)?.type, "Complexity Analysis");
  assert.equal(seed(db), 0);
});

test("a failed complexity migration rolls back the schema and restores foreign key enforcement", (t) => {
  const db = databaseBeforeComplexityMigration(t);
  db.exec(`
    PRAGMA foreign_keys = OFF;
    INSERT INTO problem_tags VALUES (15, 999);
    PRAGMA foreign_keys = ON;
  `);
  const schema = () => db.prepare("SELECT name, sql FROM sqlite_schema ORDER BY name").all();
  const before = schema();
  assert.throws(() => migrate(db), /foreign key/i);
  assert.deepEqual(schema(), before);
  assert.equal(db.prepare("SELECT 1 FROM schema_migrations WHERE name = '004_complexity_analysis.sql'").get(), undefined);
  assert.equal(db.prepare("SELECT tag_id FROM problem_tags WHERE tag_id = 999").get()?.tag_id, 999);
  assert.equal(findSubmission(db, "second", 7)?.verdict, "AC");
  assert.equal(db.prepare("PRAGMA foreign_keys").get()?.foreign_keys, 1);
});

test("Predict Output and Find the Error preserve inputs and scope submission lookup to the owner", (t) => {
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

  db.prepare("INSERT INTO users (id, username, display_name, time_zone, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(2, "sam", "Sam", "UTC", 0);
  assert.equal(findSubmission(db, correct, 2), null);
  assert.equal(findSubmission(db, "missing", alex.id), null);
  assert.deepEqual(statuses(2), initialStatuses);
  assert.deepEqual(statuses(null), [null, null]);

  const problem = findProblem(db, "CL002", alex.id);
  assert.equal(problem?.type, "Find the Error");
  assert.deepEqual(problem.options.map(({ key }) => key), ["a", "b", "c", "d"]);
  assert.doesNotMatch(JSON.stringify(problem), /correctOptionKey|correct_option_key|expectedOutput|expected_output/);
});

test("complexity questions expose ordered choices and grade the submitted stable key", (t) => {
  const { db, alex } = practiceDatabase(t);
  const slug = "CL013";
  const type = "Complexity Analysis";
  const catalogue = listProblems(db, null);
  const matches = filterProblems(catalogue, { type, query: "", difficulty: "", tag: "" });
  assert.ok(matches.some((problem) => problem.slug === slug));
  assert.ok(matches.every((problem) => problem.type === type));

  const content = readPublicProblem(slug);
  assert.equal(content.type, type);
  assert.equal(content.codeLanguage, "c");
  assert.ok(content.statementMarkdown && content.exampleCode);
  assert.deepEqual(content.options.map((option) => option.key), ["a", "b", "c", "d"]);
  const detail = findProblem(db, slug, null);
  assert.deepEqual(detail, content);
  assert.doesNotMatch(JSON.stringify([catalogue, content, detail]), /correctOptionKey|correct_option_key|expectedOutput|expected_output/);

  const wrong = recordSubmission(db, alex.id, slug, { type, optionKey: "a" });
  assert.ok(wrong);
  assert.equal(findProblem(db, slug, alex.id)?.status, "Attempted");
  const correct = recordSubmission(db, alex.id, slug, { type, optionKey: "b" });
  assert.ok(correct);
  assert.equal(findProblem(db, slug, alex.id)?.status, "Solved");
  const selectedKey = db.prepare("SELECT selected_option_key FROM submissions WHERE id = ?");
  for (const [id, key, label, verdict] of [[wrong, "a", "O(1)", "WA"], [correct, "b", "O(log n)", "AC"]]) {
    const submission = findSubmission(db, id, alex.id);
    assert.equal(submission?.submittedAnswer, label);
    assert.equal(submission?.verdict, verdict);
    assert.equal(selectedKey.get(id)?.selected_option_key, key);
  }

  for (const optionKey of ["", "unknown", "O(log n)"]) {
    assert.equal(recordSubmission(db, alex.id, slug, { type, optionKey }), null);
  }
  assert.equal(recordSubmission(db, alex.id, "unknown", { type, optionKey: "b" }), null);
  assert.equal(recordSubmission(db, alex.id, "CL002", { type, optionKey: "b" }), null);
  assert.equal(recordSubmission(db, alex.id, slug, { type: "Find the Error", optionKey: "b" }), null);
  assert.equal(recordSubmission(db, alex.id, slug, { type: "Predict Output", text: "b" }), null);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM submissions").get()?.count, 2);
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
