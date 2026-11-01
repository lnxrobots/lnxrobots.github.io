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

## Deploy to github pages

```bash
npm run deploy
```

## Adding/changing content

See [`admin/README.md`](./admin/README.md)
