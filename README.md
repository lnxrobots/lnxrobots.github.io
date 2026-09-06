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
lnx-robots-website/
├── src/
│   ├── app/                        # Next.js App Router — one folder per route
│   │   ├── page.tsx                  # Homepage
│   │   ├── layout.tsx                # Root layout (fonts, nav, footer, metadata)
│   │   ├── globals.css               # Global styles
│   │   ├── not-found.tsx             # 404 page
│   │   ├── icon.svg                  # Favicon
│   │   ├── fonts/                    # Local font files + font config
│   │   ├── about/page.tsx            # /about
│   │   ├── teams/
│   │   │   ├── page.tsx              # /teams (all teams)
│   │   │   └── [slug]/page.tsx       # /teams/team-1 (one team's page)
│   │   ├── achievements/
│   │   │   ├── page.tsx              # /achievements (timeline)
│   │   │   └── [id]/page.tsx         # /achievements/2025-slovakia (one result)
│   │   └── docs/page.tsx             # /docs (documentation library)
│   │
│   ├── components/                 # React components, grouped by area
│   │   ├── home/                     # Homepage sections (Hero, TeamsPreview, etc.)
│   │   ├── teams/                    # Team cards, member cards, spec tables, galleries
│   │   ├── achievements/             # Timeline, result badges, event galleries
│   │   ├── sponsors/                 # Sponsor tiles
│   │   ├── layout/                   # Navbar, Footer
│   │   ├── pcb/                      # Circuit-board decorative background/graphics
│   │   └── ui/                       # Shared building blocks (PageHeader, SectionLabel, etc.)
│   │
│   ├── data/                       # Site content as plain TypeScript objects
│   │   ├── site.ts                   # Club name, tagline, contact, social links, next event
│   │   ├── teams.ts                  # Teams, members, mentors, campaigns
│   │   ├── achievements.ts           # Competition results
│   │   ├── sponsors.ts               # Sponsor list
│   │   ├── disciplines.ts            # Competition/discipline definitions
│   │   └── types.ts                  # Shared TypeScript types for the data above
│   │
│   └── lib/utils.ts                # Small shared helper functions
│
├── public/content/                 # Static assets referenced by the data files
│   ├── team-1/                       # Per-team images, member photos, docs
│   ├── sponsors/                     # Sponsor logos
│   └── events/                       # Event photo galleries
│
├── CONTENT_GUIDE.md                # How to add teams, campaigns, and results (no code needed)
├── tailwind.config.ts               # Tailwind theme config
├── next.config.mjs                  # Next.js config
└── package.json                     # Dependencies and scripts
```

## Adding content

See [`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md) — everything (a new team, new
members, a new competition result, a new document, a new sponsor logo) is a
matter of editing plain TypeScript objects in `src/data/`, no component
code required. Every photo/logo field is optional and the design is built
to look intentional either way.
