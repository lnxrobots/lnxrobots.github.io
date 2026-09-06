# Adding new content

Everything on the site — teams, members, mentors, competition campaigns,
results, documents, photos, sponsors — is plain data in `src/data/`. You
don't need to touch any component or page file for routine updates.

Every photo field on the site (member photos, mentor photos, gallery
images, sponsor logos) is **optional**. Leave it out and the site shows a
sensible fallback (initials tile, or just no image) instead of a broken
layout — fill photos in whenever they're ready, in any order.

## The shape of the data

- A **team** is a persistent roster of people (e.g. "Team 1"). It keeps
  its identity across seasons even as its build changes.
- Each team runs one or more **campaigns** — one per competition/league it
  enters, optionally split by season. A team competing in RoboCupJunior
  Soccer Open *and* RoboCup SSL at the same time just has two campaigns.
- **Achievements** are individual competition results, each tagged with
  which team competed and which discipline it was in.

## Add a new competition to an existing team

This is the most common update — e.g. "Team 1 is now also entering RoboCup
SSL." Open `src/data/teams.ts`, find the team, and add one object to its
`campaigns` array (there's a CAMPAIGN TEMPLATE comment near the top of the
file to copy from):

```ts
{
  id: "team-1-robocup-ssl",
  discipline: "robocup-ssl",         // slug from src/data/disciplines.ts
  years: "2027 – present",
  status: "competing",               // "competing" | "retired" | "in-development"
  tagline: "One line describing this campaign.",
  summary: "A paragraph about this build and season.",
  specs: [],
  docs: [],
  gallery: [],
},
```

If the competition isn't in `src/data/disciplines.ts` yet, add it there
first:

```ts
{
  slug: "robocup-ssl",
  name: "RoboCup Soccer — Small Size League",
  shortName: "SSL",
  org: "RoboCup",
  url: "https://ssl.robocup.org/",
},
```

The new campaign shows up automatically on the team's page, with its own
build, docs, and gallery — the roster (members/mentors) is shared across
all of a team's campaigns, since it's the same people.

## Add a brand new team

Only needed if an independent second roster starts building under the LNX
Robots name — not for a new season of an existing team (that's a new
campaign, above). Copy the TEAM TEMPLATE comment block in
`src/data/teams.ts` into the `teams` array:

```ts
{
  slug: "team-2",
  designation: "Team 2",
  name: "Team 2",
  since: "2027",
  active: true,
  tagline: "One line describing this team.",
  summary: "A paragraph about who this team is and what they build.",
  members: [],
  mentors: [],
  campaigns: [],
},
```

## Add team members and mentors

Inside a team's object in `src/data/teams.ts`:

```ts
members: [
  { name: "Full Name", role: "Software" },
  { name: "Full Name", role: "Hardware & electronics", photo: "/content/team-1/members/name.jpg" },
],
mentors: [
  { name: "Full Name", role: "Mentor" },
],
```

`photo` is optional — a person with no photo shows a plain initials tile
instead. To add one, drop the image into
`public/content/<team-slug>/members/` and point `photo` at that path.
`bio` is also optional, for a one-line note under someone's name.

## Add a new competition result

Open `src/data/achievements.ts` and add one object to the **top** of the
`achievements` array (it's displayed newest-first):

```ts
{
  id: "2027-nuremberg",                // unique, e.g. "year-city"
  event: "RoboCup World Championship",
  discipline: "rcj-soccer-open",       // slug from src/data/disciplines.ts
  location: "Nuremberg, Germany",
  date: "2027-06-15",                  // ISO date, used for sorting/display
  team: "team-1",                      // slug from src/data/teams.ts
  results: [
    { label: "1st place, Junior Soccer Open", tier: "gold" },
  ],
  resultsUrl: "https://example.com/standings", // optional
  youtubeId: "dQw4w9WgXcQ",                     // optional, just the video id
},
```

`tier` controls the badge color: `"gold" | "silver" | "bronze" | "special" | "note"`.

This single edit updates the homepage "most recent result" strip, the
`/achievements` timeline, and the relevant team's page automatically.

## Add a new document (poster, TDP, schematic, design doc)

1. Drop the file into `public/content/<team-slug>/docs/`, e.g.
   `public/content/team-1/docs/poster-2027.pdf`.
2. In `src/data/teams.ts`, find the relevant campaign and add an entry to
   its `docs` array:

```ts
{
  title: "Poster — RoboCup 2027, Nuremberg",
  href: "/content/team-1/docs/poster-2027.pdf",
  kind: "poster",          // "poster" | "tdp" | "design-doc" | "schematic" | "archive" | "other"
  year: 2027,
},
```

It'll show up on both that campaign's section and the `/docs` library,
grouped automatically by year.

## Add competition or team photos

1. Drop images into `public/content/<team-slug>/images/`.
2. Add them to the relevant campaign's `gallery` array in
   `src/data/teams.ts`:

```ts
{ src: "/content/team-1/images/nuremberg-team.jpg", alt: "The team at RoboCup 2027 in Nuremberg" },
```

Always write a real `alt` description — it's what screen readers announce
and is the image description when expanded. No photos yet is fine too — the
gallery shows a plain "no photos filed yet" placeholder instead of an
empty grid.

## Add a sponsor, with or without a logo

Edit `src/data/sponsors.ts`:

```ts
{ name: "Acme Corp", url: "https://acme.example" },                              // text only
{ name: "Acme Corp", url: "https://acme.example", logo: "/content/sponsors/acme.svg" }, // with logo
```

Drop logo files into `public/content/sponsors/`. SVG or PNG with a
transparent background works best on the dark site background. `logo` is
optional — sponsors without one still render cleanly as text.

## Update the countdown / next event

`src/data/site.ts` has a `nextEvent` object with `name`, `location`,
`start`, `end`, and `href`. Update it once the next confirmed fixture is
known; the homepage countdown reads straight from it.
