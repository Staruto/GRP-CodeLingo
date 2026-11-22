import { databasePath, openDatabase } from "../src/db/connection";
import { migrate } from "../src/db/migrate";

const db = openDatabase(databasePath(), true);
try {
  migrate(db);
  console.log("Database migrations applied.");
} finally {
  db.close();
}
