# LNX Robots — website

Source for the LNX Robots website, built in Next.js (App Router) with
TypeScript and Tailwind CSS.

The site is organised around **teams**: a persistent roster of students
that keeps its identity across seasons (e.g. "Team 1", competing every
year since 2023). Each team can run one or more **campaigns** — one per
competition/league it enters, optionally split by season — so a team can
be doing RoboCupJunior Soccer Open and RoboCup SSL at the same time without
duplicating its roster. Add a competition that isn't in the catalogue yet
(RoboRAVE, SSL, anything) in `src/data/disciplines.ts`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Building for production

```bash
npm run build
```

`next.config.mjs` is set to `output: 'export'`, so `npm run build` produces
a static site in `/out` that can be pushed straight to the
`lnxrobots.github.io` repository github pages.

## Project structure

```
src/
  app/                 routes (App Router)
    page.tsx           homepage
    teams/              team index + /teams/[slug]
    achievements/        full results timeline
    docs/                documentation library (auto-grouped by year)
    about/               club info, contact, sponsors
  components/
    pcb/                trace/via primitives and the circuit background
    ui/                  Pad, SectionLabel, PageHeader, DisciplineTag
    layout/              Navbar, Footer
    home/                homepage-only sections
    teams/                team-specific components (roster cards, campaign spec table, docs, gallery)
    achievements/         timeline + result badge
    sponsors/             sponsor tile (logo optional)
  data/                   ALL editable content lives here — see CONTENT_GUIDE.md
  lib/                    small formatting/utility helpers
public/
  content/
    team-2023/ team-2024/ team-2025/ ...
      docs/               PDFs, zips
      images/             competition/team photos
      members/            member and mentor headshots
    sponsors/             sponsor logo files
```

## Adding content

See [`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md) — everything (a new team, new
members, a new competition result, a new document, a new sponsor logo) is a
matter of editing plain TypeScript objects in `src/data/`, no component
code required. Every photo/logo field is optional and the design is built
to look intentional either way.
