# Practice backend

Follow the [README setup](../README.md#getting-started) to run CodeLingo locally.

## What runs in each mode

| Feature | Default mock app | Local SQLite practice |
| --- | --- | --- |
| Catalogue | 12 example entries. CL001 and CL002 have detail pages. | CL001 and CL002 are seeded with complete content. |
| Grading | The answer form is a preview. Sample results are at `/submissions/SUB-001` and `/submissions/SUB-002`. | Submit an answer as Alex and open the saved result at `/submissions/<uuid>`. |
| Home chart | Labelled example counts. | The number of problems Alex first solved each day. |

SQLite runs only in development with `CODELINGO_DATA_SOURCE=sqlite`. The app
resolves a single seeded identity, Alex. It has no sign-in, profile page, or
submission-history page yet. The local setup uses the loopback address in the README.

## Reproduce a practice session

1. Start with a fresh database. For a separate run, set
   `CODELINGO_DB_PATH=data/walkthrough.sqlite` in `.env.local`. Run
   `npm run db:migrate` and `npm run db:seed`, then start or restart the dev server.
2. Open `/problems/CL001`. Submit `20`. The result page shows **Incorrect**,
   and the catalogue shows **Attempted** for CL001. Submit `19` on the same
   problem. The result shows **Correct**, and the catalogue shows **Solved**.
3. Submit `19` again. Open the homepage and expand **View daily data**. Today
   still shows one first solve even though CL001 has two accepted submissions.
4. Open `/problems/CL002`. Choose `count - 1` and submit. The result shows
   the selected expression and **Correct**. The homepage now shows two first
   solves if both exercises were solved on the same practice date.
5. Run `npm run db:seed` again. The script reports zero new problems. A saved
   submission URL still opens after restarting the server.

The default database path is `data/codelingo.sqlite`, relative to the repository
root. The `data/` directory is Git-ignored. A new path gives you a clean
database without removing a teammate's existing test data.

## How data flows

- Pages use typed problem, submission, and stats objects from `src/server/`.
  `getCurrentUser()` resolves Alex. The submission detail query limits results
  to the current user, and an unknown or another user's submission returns 404
  in SQLite mode.
- The [initial migration](../src/db/migrations/001_practice.sql) defines users,
  problems, tags, problem options, answer keys, verdicts, and submissions.
  Problem URLs use stable slugs. SQLite uses integer user and problem keys
  internally, and submissions use UUIDs.
- A Server Action validates and grades each attempt, then appends it with
  verdict `AC` or `WA`. Predict Output comparisons normalize line endings and
  ignore trailing spaces, trailing tabs, and final blank lines. Leading spaces,
  internal spacing, and case still matter. Find the Error compares the stable
  option key. SQLite rejects edits and deletes of saved attempts.
- SQLite stores timestamps in UTC. Alex's timezone is `Asia/Shanghai`. The
  monthly chart counts each problem on the date of its first `AC`. Any day with
  an `AC` can extend a streak. Topic accuracy divides accepted attempts by all
  graded attempts for that topic. Streak and topic accuracy are calculated by
  the backend and have no dedicated UI yet.

## Add a problem

1. Add a directory under `content/problems/` with the next unused slug, such
   as `CL003`. Use [CL001](../content/problems/CL001/problem.md) for Predict
   Output or [CL002](../content/problems/CL002/problem.md) for Find the Error.
2. Add `problem.md` with YAML front matter for title, type, difficulty, and tags,
   plus a Markdown statement. For Find the Error, include ordered options with
   stable keys. Put the C code in `example.c`. Statements render on the server
   with sanitization and syntax highlighting.
3. Add `answer.json` with `expectedOutput` for Predict Output or
   `correctOptionKey` for Find the Error. Review the statement, code, options,
   and key together. Anyone with repository access can read the committed keys.
4. Run `npm run db:seed` and check the new problem in SQLite mode. The seed
   inserts new slugs and preserves existing problem records and submissions.
   If you change a draft after seeding it, use a fresh local database to verify
   the revised files.

`npm run test:db` exercises migration, reseeding, grading, ownership, and stats
against an in-memory SQLite database. CI also runs lint, the production mock
build, and TypeScript checks.
