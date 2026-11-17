# CodeLingo design foundation

The homepage is the reference implementation for new frontend pages. This is a
light-theme, static prototype: the example profile, practice counts, problem, and
announcements do not represent real student data.

## Shared page shell

The root layout supplies the header, skip link, main landmark, and white content
container. Pages should return their own content, **not another header, `main`, or
outer container**. The shell is at most **1120px** wide, centered on a very light
grey background. Horizontal padding is 16px below 640px, 24px from 640px, and 32px
from 1024px. The header uses the same alignment. Page padding is 32px vertically,
increasing to 40px from 640px.

The header shows CodeLingo, Home, Problems, and an explicitly labelled example
profile. Navigation moves below the brand/profile on mobile, with no hidden menu.
The avatar and profile name link together to `/profile`. Submissions and Login/Register
are deliberately deferred under the revised homepage requirements.

| Destination | Route | Status |
| --- | --- | --- |
| Home | `/` | Implemented |
| Problem list | `/problems` | Future page; currently returns 404 |
| Example problem | `/problems/CL001` | Implemented as a practice prototype |
| User profile | `/profile` | Future page; currently returns 404 |
| Future problem details | `/problems/[id]` | Preserve the problem ID in the URL |

The Problems navigation item remains active for nested problem routes. Use
`next/link` for internal navigation. Do not add placeholder pages or authentication
to make these links resolve as part of this issue.

## Typography, colour, and spacing

Lato is loaded through `next/font/google`, with regular (400) and bold (700)
weights and a system sans-serif fallback. It is self-hosted by Next.js at runtime;
the initial production build needs access to Google Fonts. Use `font-normal` and
`font-bold`, rather than requesting unprovided font weights. Use `font-mono` for
short IDs or code, not body copy.

| Purpose | Tailwind token / class | Value |
| --- | --- | --- |
| Surrounding page background | `bg-background` | `#f8fafc` |
| Content and header surface | `bg-surface` | `#ffffff` |
| Primary text | `text-foreground` | `#0f172a` |
| Supporting text | `text-muted` | `#475569` |
| Dividers | `border-border` | `#e2e8f0` |
| Links and primary action | `text-accent`, `bg-accent` | `#1d4ed8` |
| Action hover | `text-accent-hover`, `bg-accent-hover` | `#1e40af` |
| Quiet action hover | `bg-accent-soft` | `#eff6ff` |
| Page heading | `page-heading` | 28px, bold, tight line height |
| Section heading | `section-heading` | 20px, bold |
| Body | Inherited | 16px, line height 1.6 |
| Supporting copy | `text-sm` | 14px |

Use one `h1` per page and `h2` for major sections. Use `h3` for content nested
inside a section. The homepage uses 40px between major sections (`space-y-10`),
12–20px between related elements, and 16px list-row padding. Work from Tailwind's
4px spacing scale. Keep explanations to a readable width (`max-w-2xl` or
`max-w-3xl`) even when the surrounding section is wider.

Prefer compact lists, tables, and subtle dividers to decorative cards. Use small
6px corners (`rounded-md`) for controls and bounded data regions. Avoid gradients,
drop shadows, large hero sections, and competing accent colours. Difficulty labels
are the small semantic exception: green for Easy, amber for Medium, red for Hard,
always with a visible text label.

## Reuse in a page

```tsx
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { DifficultyBadge } from "@/components/difficulty-badge";

export default function ExamplePage() {
  return (
    <div className="space-y-10">
      <section aria-labelledby="page-heading">
        <h1 id="page-heading" className="page-heading">Page title</h1>
        <p className="mt-3 max-w-2xl text-muted">A short introduction.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/problems">Browse problems</ButtonLink>
          <ButtonLink href="/" variant="secondary">Back to home</ButtonLink>
        </div>
      </section>
      <section aria-labelledby="example-heading">
        <h2 id="example-heading" className="section-heading">Example section</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-y border-border py-4">
          <Link className="text-link" href="/problems/CL001">Sum of Two Numbers</Link>
          <DifficultyBadge difficulty="Easy" />
        </div>
      </section>
    </div>
  );
}
```

- `ButtonLink` accepts Next.js Link props and `variant="primary" | "secondary"`.
  Its default is primary. Use it for navigation, not form submissions or local actions.
- For a future native `<button>`, reuse `button-link button-link-primary` or
  `button-link button-link-secondary` and provide the correct button type and
  behavior. No general-purpose button API or disabled styling is introduced yet.
- `DifficultyBadge` accepts `difficulty="Easy" | "Medium" | "Hard"`.
- `Container` accepts normal div props and an optional `className`. It is intended
  for shared layout regions; pages normally already inherit their container.
- Plain content links use `text-link`. Interactive elements receive a shared blue
  keyboard-focus outline. Do not remove that outline.

Keep page content as Server Components. The active navigation and browser-local
practice chart are small Client Component boundaries. Do not mark an entire page
as a Client Component merely to use them.

## Mock practice chart

The SVG chart shows one column per day of the viewer's current local calendar
month. Counts are deterministic examples between zero and six, not random values
that change on every render. Future dates use `null` (no data), not a solved count
of zero. A blue baseline dot represents an actual mock zero; a dashed baseline
mark indicates a future date. Today has a dot below its day label.

The server renders a stable loading explanation. After hydration, the chart reads
the browser's local date; it checks for a new day each minute and on window focus.
There is no API, storage, or user-specific input. Without JavaScript, an explanation
remains visible instead of a misleading server-time chart.

The chart has a 960px minimum width to keep all daily labels legible. Only its
region scrolls horizontally on smaller screens. The expandable **View daily data**
table supplies every date and count for nonvisual use. Keep mock-data labels when
reusing this example; do not describe it as live activity or submission feedback.

## Collaboration and review

Merge this foundation before dependent page branches update their base. Coordinate
changes to the root layout, global styles, navigation, shared components, package
files, or configuration with the team leader before working on them. Prefer
existing tokens and components in page branches; propose new shared patterns when
there is a concrete reuse case.

For each UI PR, run `npm run lint` and `npm run build`, check desktop, tablet, and
mobile layouts, inspect keyboard focus, and provide desktop/mobile screenshots.
Check narrow screens for page overflow; wide charts and tables should scroll in
their own labelled, keyboard-accessible region. Verify contrast and state labels,
including mock versus real data. See [homepage PR notes](homepage-pr-notes.md)
for this implementation's verification record.
