# CodeLingo

CodeLingo helps students practise programming concepts. The homepage currently
uses a labelled example profile and local mock data; it has no backend or
authentication. The Problems links reserve routes for future page issues.

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

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
to load Lato (400 and 700). An initial production build requires network access to
Google Fonts; the resulting font files are served locally by Next.js.

Before opening a PR, run `npm run lint` and `npm run build`, and check the page at
desktop, tablet, and mobile widths.
