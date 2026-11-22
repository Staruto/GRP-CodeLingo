# CodeLingo

CodeLingo helps students practise programming concepts. The default app uses a
labelled example profile and mock data. Local developers can opt in to SQLite
to grade and review real attempts as the seeded user Alex.

Before adding a page, read the [shared design foundation](docs/design-foundation.md)
for layout, typography, colours, component examples, and team coordination guidance.
For a walkthrough of grading, the schema, and how to add problems, see the
[practice backend guide](docs/practice-backend.md).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting started

Use Node.js 22.13 or later. From the repository root, install the locked
dependencies and start the default mock app.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Local SQLite practice

Stop the mock dev server if it is running. Add the following to `.env.local` in
the repository root.

```dotenv
CODELINGO_DATA_SOURCE=sqlite
```

Then initialize the local database and start the app.

```bash
npm run db:migrate
npm run db:seed
npm run dev -- --hostname 127.0.0.1
```

Open [http://127.0.0.1:3000/problems](http://127.0.0.1:3000/problems).
The catalogue starts with CL001 and CL002. To return to the mock app, remove
`CODELINGO_DATA_SOURCE` from `.env.local` and your shell environment, then restart
the dev server. Production builds and `npm start` use mocks.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
to load Lato (400 and 700). An initial production build requires network access to
Google Fonts; the resulting font files are served locally by Next.js.

Before opening a PR, run `npm run lint`, `npm run test:db`, `npm run build`,
and `npx tsc --noEmit`. For UI changes, also check desktop, tablet, and mobile widths.
