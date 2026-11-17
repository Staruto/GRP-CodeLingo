# Problem list PR notes

Suggested title: `feat(problems): add searchable mock problem catalogue`

Related issue: [#2 — Build the problems list page](https://github.com/Staruto/GRP-CodeLingo/issues/2)

## Summary

Add `/problems` so students can browse 12 example questions and narrow the list
by title or ID, question type, difficulty, and topic tag. Each entry shows its
ID, title, type, difficulty, tags, and explicitly labelled mock completion status.

The route is a Server Component with page metadata. A focused Client Component
provides the responsive catalogue and local filtering, using the existing page
shell, design tokens, and `DifficultyBadge`.

## Behaviour

- Search trims surrounding whitespace and matches titles or IDs without case sensitivity.
- Question type, difficulty, and tag filters combine with search using AND conditions.
- Results update immediately, with an accessible result count.
- Empty results offer a reset; both reset controls clear every filter and return focus to search.
- Native labelled controls, visible keyboard focus, and compact responsive rows support keyboard and mobile use.
- Titles link to `/problems/[slug]`, preserving IDs such as `/problems/CL001`.

## Review notes

The implementation adds local mock data and page-specific components. Shared
components and configuration are unchanged; there are no new dependencies,
backend services, authentication, or persistent completion records.

Problem detail routes belong to [Issue #3](https://github.com/Staruto/GRP-CodeLingo/issues/3)
and currently return 404. This change supplies the catalogue links without adding
placeholder detail pages.

## Verification

- `npm run lint`: passed.
- Pure-function assertions for mock data and filtering: passed.
- `npm run build`: passed; `/problems` is statically prerendered.
- Browser: ID/title search, combined type/difficulty/tag filters, empty results,
  both reset controls, and focus returning to search passed.
- Keyboard: Tab navigation, visible control focus, arrow-key selection, and
  Enter on the empty-state reset passed.
- Layout: 1440px desktop, 768px tablet, 390px mobile, and 320px narrow viewport
  checked with no horizontal page overflow.
- Home -> Browse problems navigation passed; no browser console errors observed.

Verified on Windows with Node.js 24.22.3 for the production build. The initial
restricted-network font download and a stale `.next` worker cache failed;
network access and a clean build cache resolved both without source changes.

## Screenshots

- [Desktop catalogue](screenshots/problems-desktop.jpg)
- [Mobile search and filters](screenshots/problems-mobile.jpg)
- [Mobile problem rows](screenshots/problems-mobile-list.jpg)
- [Tablet catalogue](screenshots/problems-tablet.jpg)
- [Empty results](screenshots/problems-empty.jpg)
