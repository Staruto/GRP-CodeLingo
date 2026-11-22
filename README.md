# CodeLingo

CodeLingo helps students practise programming concepts. The default app uses a
labelled example profile and mock data. Local developers can opt in to SQLite
to grade and review real attempts as the seeded user Alex.

Before adding a page, read the [shared design foundation](docs/design-foundation.md)
for layout, typography, colours, component examples, and team coordination guidance.
See [homepage PR notes](docs/homepage-pr-notes.md) for the initial implementation.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Local SQLite practice

Use Node.js 22.13 or later. Add `CODELINGO_DATA_SOURCE=sqlite` to `.env.local`,
then run:

```bash
npm run db:migrate
npm run db:seed
npm run dev -- --hostname 127.0.0.1
```

The database defaults to `data/codelingo.sqlite`. Set `CODELINGO_DB_PATH` in
`.env.local` to use a different file. Migrations run once per database. The seed
adds Alex and any new problem slugs, and preserves existing problems and
submissions. The production build uses mocks and requires no SQLite file.

Each problem directory under `content/problems` has a public `problem.md` and
`example.c`, plus a grading key in `answer.json`. Anyone with repository access
can read the keys. The seed checks that each problem has a matching key and that
correct option keys reference a listed choice. Review content and its answer
together before publishing a slug.

Run `npm run test:db` to check the schema, seeding, grading, and stats in an
isolated in-memory database.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
to load Lato (400 and 700). An initial production build requires network access to
Google Fonts; the resulting font files are served locally by Next.js.

Before opening a PR, run `npm run lint` and `npm run build`, and check the page at
desktop, tablet, and mobile widths.
