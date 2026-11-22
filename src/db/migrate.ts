import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { inTransaction } from "./connection";

export function migrate(db: DatabaseSync) {
  const directory = join(process.cwd(), "src", "db", "migrations");
  const files = readdirSync(directory).filter((file) => /^\d+_.+\.sql$/.test(file)).sort();

  inTransaction(db, () => {
    db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY) STRICT");
    const applied = db.prepare("SELECT 1 FROM schema_migrations WHERE name = ?");
    const record = db.prepare("INSERT INTO schema_migrations (name) VALUES (?)");
    for (const file of files) {
      if (applied.get(file)) continue;
      db.exec(readFileSync(join(directory, file), "utf8"));
      record.run(file);
    }
  });
}
