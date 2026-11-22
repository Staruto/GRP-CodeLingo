import { databasePath, openDatabase } from "../src/db/connection";
import { seed } from "../src/db/seed";

const db = openDatabase(databasePath());
try {
  const imported = seed(db);
  console.log(`Imported ${imported} new problems and verified the seeded development user.`);
} finally {
  db.close();
}
