import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

export function databasePath() {
  return resolve(/* turbopackIgnore: true */ process.env.CODELINGO_DB_PATH || "data/codelingo.sqlite");
}

export function openDatabase(path: string, create = false) {
  if (path !== ":memory:") {
    if (create) mkdirSync(dirname(path), { recursive: true });
    else if (!existsSync(path)) throw new Error("SQLite database missing. Run npm run db:migrate and npm run db:seed.");
  }

  const db = new DatabaseSync(path);
  try {
    db.exec("PRAGMA foreign_keys = ON; PRAGMA recursive_triggers = ON; PRAGMA busy_timeout = 5000;");
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

export function inTransaction<T>(db: DatabaseSync, run: () => T) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = run();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
