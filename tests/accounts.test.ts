import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { verify } from "argon2";
import { openDatabase } from "../src/db/connection";
import { migrate } from "../src/db/migrate";
import { findUser } from "../src/db/practice";
import { seed } from "../src/db/seed";
import { getCurrentUser } from "../src/server/practice";
import { registerAccount } from "../src/server/register-account";
import { verifyLoginCredentials } from "../src/server/verify-login-credentials";

function accountDatabase(t: TestContext) {
  const directory = mkdtempSync(join(tmpdir(), "codelingo-accounts-"));
  const path = join(directory, "accounts.sqlite");
  const environment = {
    NODE_ENV: "development",
    CODELINGO_DATA_SOURCE: "sqlite",
    CODELINGO_DB_PATH: path,
  };
  const previous = Object.fromEntries(Object.keys(environment).map((name) => [name, process.env[name]]));
  const db = openDatabase(path, true);
  Object.assign(process.env, environment);
  t.after(() => {
    db.close();
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    rmSync(directory, { recursive: true, force: true });
  });

  migrate(db);
  seed(db);
  return db;
}

test("account migration preserves legacy users, roles and practice history", (t) => {
  const db = openDatabase(":memory:");
  t.after(() => db.close());
  for (const file of ["001_practice.sql", "002_user_roles.sql"]) {
    db.exec(readFileSync(join("src", "db", "migrations", file), "utf8"));
  }
  db.exec(`
    CREATE TABLE schema_migrations (name TEXT PRIMARY KEY) STRICT;
    INSERT INTO schema_migrations VALUES ('001_practice.sql'), ('002_user_roles.sql');
    INSERT INTO users (id, username, display_name, time_zone, created_at, role)
    VALUES (1, 'alex', 'Alex', 'Asia/Shanghai', 100, 'user'),
           (2, 'LegacyAdmin', 'Legacy Admin', 'UTC', 101, 'admin');
    INSERT INTO problems (id, slug, title, question_type, difficulty, statement_markdown, example_code, code_language)
    VALUES (1, 'CL001', 'Legacy Problem', 'Predict Output', 'Easy', 'Predict the output.', '', 'c');
    INSERT INTO submissions (id, user_id, problem_id, verdict, submitted_at, submitted_text)
    VALUES ('legacy-attempt', 1, 1, 'AC', 200, '19');
  `);

  const users = db.prepare("SELECT id, username, display_name, time_zone, created_at, role FROM users ORDER BY id");
  const submissions = db.prepare("SELECT * FROM submissions");
  const legacyUsers = users.all();
  const legacySubmissions = submissions.all();
  migrate(db);
  migrate(db);

  assert.deepEqual(users.all(), legacyUsers);
  assert.deepEqual(submissions.all(), legacySubmissions);
  const credentials = db.prepare("SELECT email, password_hash FROM users").all();
  assert.ok(credentials.every(({ email, password_hash }) => email === null && password_hash === null));
  assert.deepEqual(db.prepare("PRAGMA foreign_key_check").all(), []);
});

const registration = {
  username: "  New_User  ",
  email: "  Student@Example.COM  ",
  password: "  test password with spaces  ",
};

test("registers a user with a normalized email and a salted Argon2id hash", async (t) => {
  const db = accountDatabase(t);
  const result = await registerAccount({ ...registration, role: "admin" });
  assert.ok(result.ok);
  const { id } = result.account;
  assert.deepEqual(result.account, { id, username: "new_user", displayName: "new_user" });
  assert.deepEqual(findUser(db, "new_user"), { ...result.account, role: "user", timeZone: "UTC" });

  const select = db.prepare("SELECT email, password_hash FROM users WHERE id = ?");
  const row = select.get(id);
  assert.equal(row?.email, "student@example.com");
  assert.equal(typeof row?.password_hash, "string");
  const hash = String(row?.password_hash);
  assert.notEqual(hash, registration.password);
  assert.match(hash, /^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
  assert.equal(await verify(hash, registration.password), true);
  assert.equal(await verify(hash, registration.password.trim()), false);

  const second = await registerAccount({ ...registration, username: "another", email: "another@example.com" });
  assert.ok(second.ok);
  const secondHash = String(select.get(second.account.id)?.password_hash);
  assert.notEqual(secondHash.split("$")[4], hash.split("$")[4]);
  assert.equal(await verify(secondHash, registration.password), true);
});

test("rejects duplicate usernames and emails case-insensitively, including concurrent requests", async (t) => {
  const db = accountDatabase(t);
  const conflict = { ok: false, error: "account-conflict" };
  assert.deepEqual(await registerAccount({ ...registration, username: "ALEX" }), conflict);
  const results = await Promise.all([
    registerAccount(registration),
    registerAccount({ ...registration, username: "NEW_USER", email: "different@example.com" }),
  ]);
  assert.equal(results.filter(({ ok }) => ok).length, 1);
  assert.deepEqual(results.find(({ ok }) => !ok), conflict);
  const winner = results[0].ok ? registration.email : "different@example.com";
  assert.deepEqual(await registerAccount({ ...registration, username: "different", email: winner.toUpperCase() }), conflict);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM users").get()?.count, 2);

  const insert = db.prepare(`
    INSERT INTO users (username, email, display_name, time_zone, created_at) VALUES (?, ?, '', 'UTC', 0)
  `);
  assert.throws(() => insert.run("NEW_USER", "third@example.com"), /UNIQUE constraint failed/);
  assert.throws(() => insert.run("different", winner.trim().toUpperCase()), /UNIQUE constraint failed/);
});

test("invalid registration inputs and mock mode do not create accounts", async (t) => {
  const db = accountDatabase(t);
  for (const input of [
    null, [], {}, { ...registration, username: 1 }, { ...registration, username: "ab" },
    { ...registration, username: "x".repeat(65) }, { ...registration, email: null },
    { ...registration, email: "user@example" }, { ...registration, email: "user@.example.com" },
    { ...registration, email: "x".repeat(321) },
    { ...registration, password: "" }, { ...registration, password: "x".repeat(257) },
    { ...registration, password: registration.password + "\0" },
  ]) {
    assert.deepEqual(await registerAccount(input), { ok: false, error: "invalid-input" });
  }
  delete process.env.CODELINGO_DATA_SOURCE;
  assert.deepEqual(await registerAccount(registration), { ok: false, error: "unsupported" });
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM users").get()?.count, 1);
});

test("verifies a registered password and returns only safe fields with the stored role", async (t) => {
  const db = accountDatabase(t);
  const result = await registerAccount(registration);
  assert.ok(result.ok);
  const profile = await getCurrentUser();
  assert.equal(profile?.username, "alex");
  const credentials = { username: "  NEW_USER  ", password: registration.password };
  assert.deepEqual(await verifyLoginCredentials(credentials), {
    ok: true, account: { ...result.account, role: "user" },
  });

  db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(result.account.id);
  assert.deepEqual(await verifyLoginCredentials(credentials), {
    ok: true, account: { ...result.account, role: "admin" },
  });
  assert.deepEqual(await getCurrentUser(), profile);
});

test("returns the same error for an incorrect password, unknown username, and legacy account", async (t) => {
  accountDatabase(t);
  assert.equal((await registerAccount(registration)).ok, true);
  const error = { ok: false, error: "invalid-credentials" };
  assert.deepEqual(await verifyLoginCredentials({ username: "new_user", password: registration.password.trim() }), error);
  assert.deepEqual(await verifyLoginCredentials({ username: "missing", password: registration.password }), error);
  assert.deepEqual(await verifyLoginCredentials({ username: "Alex", password: registration.password }), error);
});

test("rejects malformed credentials and does not report success in mock mode", async (t) => {
  accountDatabase(t);
  const { password } = registration;
  for (const input of [
    undefined, "new_user", [], {}, { username: "new_user" }, { username: null, password },
    { username: "user@example.com", password }, { username: "x".repeat(65), password },
    { username: "new_user", password: 123 }, { username: "new_user", password: "x".repeat(257) },
    { username: "new_user", password: password + "\0" },
  ]) {
    assert.deepEqual(await verifyLoginCredentials(input), { ok: false, error: "invalid-input" });
  }

  assert.equal((await registerAccount(registration)).ok, true);
  delete process.env.CODELINGO_DATA_SOURCE;
  assert.deepEqual(await verifyLoginCredentials(registration), { ok: false, error: "unsupported" });
});
