import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { inTransaction } from "./connection";

export function migrate(db: DatabaseSync) {
  const directory = join(process.cwd(), "src", "db", "migrations");
  const files = readdirSync(directory).filter((file) => /^\d+_.+\.sql$/.test(file)).sort();

  // Dropping a parent table during a rebuild would cascade to its children.
  // SQLite only allows changing foreign key enforcement outside a transaction.
  const foreignKeysEnabled = db.prepare("PRAGMA foreign_keys").get()?.foreign_keys === 1;
  db.exec("PRAGMA foreign_keys = OFF");
  try {
    inTransaction(db, () => {
      db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY) STRICT");
      const applied = db.prepare("SELECT 1 FROM schema_migrations WHERE name = ?");
      const pending = files.filter((file) => !applied.get(file));
      const record = db.prepare("INSERT INTO schema_migrations (name) VALUES (?)");
      for (const file of pending) {
        db.exec(readFileSync(join(directory, file), "utf8"));
        record.run(file);
      }
      if (pending.length) {
        const violation = db.prepare("PRAGMA foreign_key_check").get();
        if (violation) throw new Error(`Migration left an invalid foreign key in ${violation.table}.`);
      }
    });
  } finally {
    if (foreignKeysEnabled) db.exec("PRAGMA foreign_keys = ON");
  }
}
