import { Team } from "./types";

/**
 * ────────────────────────────────────────────────────────────────────────
 * TEAMS = persistent rosters of people. A team keeps its identity across
 * seasons even as its build changes — LNX Robots currently has one team,
 * "Team 1", which has competed every year since 2023. If a second group of
 * students starts building under the LNX Robots name, add a second team
 * object (e.g. "team-2") the same way.
 *
 * Each team can run more than one CAMPAIGN — one per competition/league it
 * enters, optionally split by season. A team competing in RoboCupJunior
 * Soccer Open *and* RoboCup SSL at once just lists two campaigns.
 * ────────────────────────────────────────────────────────────────────────
 *
 * TO ADD A NEW TEAM (a second, independent roster):
 *   1. Copy the TEAM TEMPLATE block below into the `teams` array.
 *   2. Give it a unique `slug` (e.g. "team-2").
 *   3. `members`, `mentors`, and `campaigns` can all be left as empty
 *      arrays `[]` if you don't have that info yet.
 *
 * TO ADD A NEW COMPETITION TO AN EXISTING TEAM (e.g. this team also enters
 * RoboCup SSL now):
 *   1. Copy the CAMPAIGN TEMPLATE block below into that team's
 *      `campaigns` array.
 *   2. Give it a unique `id` and set `discipline` to a slug from
 *      src/data/disciplines.ts (add a new discipline there first if the
 *      competition isn't listed yet).
 *   3. `specs`, `docs`, and `gallery` can start as empty arrays `[]`.
 *
 * Photos (for members, mentors, and gallery images) are always optional —
 * drop files into /public/content/<team-slug>/... and reference them, or
 * leave the field out entirely and the site falls back gracefully.
 *
 * ── TEAM TEMPLATE (copy this) ─────────────────────────────────────────
 * {
 *   slug: "team-2",
 *   designation: "Team 2",
 *   name: "Team 2",
 *   since: "20XX",
 *   active: true,
 *   tagline: "One line describing this team.",
 *   summary: "A paragraph about who this team is and what they build.",
 *   members: [
 *     { name: "Full Name", role: "Software" },                              // photo optional
 *     { name: "Full Name", role: "Hardware & electronics", photo: "/content/team-2/members/name.jpg" },
 *   ],
 *   mentors: [
 *     { name: "Full Name", role: "Mentor" },
 *   ],
 *   campaigns: [],
 * },
 *
 * ── CAMPAIGN TEMPLATE (copy this into a team's `campaigns` array) ──────
 * {
 *   id: "team-1-robocup-ssl",
 *   discipline: "robocup-ssl",         // see src/data/disciplines.ts
 *   years: "20XX – present",
 *   status: "competing",               // "competing" | "retired" | "in-development"
 *   tagline: "One line describing this campaign.",
 *   summary: "A paragraph about this build and season.",
 *   specs: [
 *     { label: "Main processing unit", value: "..." },
 *   ],
 *   codeRepo: "https://github.com/lnxrobots/...",           // optional
 *   hardwareRepo: "https://github.com/lnxrobots/...",       // optional
 *   docs: [
 *     { title: "Poster — Event Name", href: "/content/team-1/docs/poster.pdf", kind: "poster", year: 20XX },
 *   ],
 *   gallery: [
 *     { src: "/content/team-1/images/photo.jpg", alt: "Describe the photo" },
 *   ],
 * },
 * ────────────────────────────────────────────────────────────────────────
 */
export const teams: Team[] = [
  {
    slug: "team-1",
    designation: "Team 1",
    name: "Team 1",
    since: "2023",
    active: true,
    tagline: "LNX Robots' founding roster, competing every season since 2023.",
    summary:
      "The team behind every LNX Robots entry so far: three seasons of RoboCupJunior Soccer Open, three rebuilt robots, and a run of results from a first Slovak-nationals win in 2023 to a runner-up finish and Exemplary Team Award at Worlds 2025.",
    // TODO: add the roster and mentor(s) here.
    // Example:
    // members: [
    //   { name: "Full Name", role: "Software" },
    //   { name: "Full Name", role: "Hardware & electronics", photo: "/content/team-1/members/name.jpg" },
    // ],
    // mentors: [{ name: "Full Name", role: "Mentor" }],
    members: [
      { name: "Full Name", role: "Role is here", photo: "/content/sponsors/slovnaft.svg" },
      { name: "Full Name2", role: "Role is here" },
      { name: "Full Name3", role: "Role is here" },
      { name: "Full Name4", role: "Role is here" },
    ],
    mentors: [{ name: "Mentor", role: "Mentor (duh)" }],
    campaigns: [
      {
        id: "team-1-soccer-open-2025",
        discipline: "rcj-soccer-open",
        years: "2025 – present",
        status: "competing",
        tagline: "The current build, fielded through the 2025 season.",
        summary:
          "This season's robot carries forward the vision pipeline and multiprocessing software architecture proven the year before, refined after a full season of matches — 2nd place in Junior Soccer Open and the Exemplary Team Award at Worlds 2025 in Salvador.",
        specs: [
          { label: "Season", value: "2025 – 2026" },
          { label: "Software", value: "Multiprocess vision & control pipeline" },
          { label: "Full hardware breakdown", value: "See hardware repository" },
        ],
        codeRepo: "https://github.com/lnxrobots/rcj-soccer-open-gen3",
        hardwareRepo: "https://github.com/lnxrobots/hw-rcj-soccer-open/tree/main/gen3",
        docs: [
          {
            title: "Poster — RoboCup 2025, Salvador (v2)",
            href: "https://lnxrobots.github.io/docs/2025/LNX_Robots_Poster_gen3_v2.pdf",
            kind: "poster",
            year: 2025,
          },
          {
            title: "TDP form and supporting files",
            href: "https://lnxrobots.github.io/docs/2025/LNX_Robots_TDP_gen3_v2.zip",
            kind: "archive",
            year: 2025,
          },
          {
            title: "Poster — RoboCupJunior European Championship, Bari",
            href: "https://lnxrobots.github.io/docs/2025/LNX_Robots_Poster_gen3.pdf",
            kind: "poster",
            year: 2025,
          },
        ],
        gallery: [],
      },
      {
        id: "team-1-soccer-open-2024",
        discipline: "rcj-soccer-open",
        years: "2024",
        status: "retired",
        tagline: "The breakout build — European champions, Worlds runners-up.",
        summary:
          "2024 took the team from a solid debut to the top of the podium: 1st place at the RoboCupJunior European Championship, then 2nd place in Junior Soccer Open plus the Top Poster and Presentation Award at the World Championship in Eindhoven. This build is fully documented and open-sourced, and doubles as the reference codebase for later seasons.",
        specs: [
          { label: "Season", value: "2024" },
          { label: "Notable result", value: "1st, European Championship 2024" },
          { label: "Full hardware breakdown", value: "See hardware repository" },
        ],
        codeRepo: "https://github.com/lnxrobots/rcj-soccer-open-gen2",
        hardwareRepo: "https://github.com/lnxrobots/hw-rcj-soccer-open",
        docs: [
          {
            title: "Poster — RoboCup 2024, Eindhoven (v2)",
            href: "https://lnxrobots.github.io/docs/2024/LNX_Robots_Poster_gen2_v2.pdf",
            kind: "poster",
            year: 2024,
          },
          {
            title: "Design Document 2024",
            href: "https://lnxrobots.github.io/docs/2024/LNX_Robots_Design_Document_2024.pdf",
            kind: "design-doc",
            year: 2024,
          },
          {
            title: "Poster — RoboCupJunior, Hanover",
            href: "https://lnxrobots.github.io/docs/2024/LNX_Robots_Poster_gen2.pdf",
            kind: "poster",
            year: 2024,
          },
          {
            title: "Code & hardware release v1.0.0",
            href: "https://github.com/lnxrobots/rcj-soccer-open-gen2/releases/tag/v1.0.0",
            kind: "archive",
            year: 2024,
          },
        ],
        gallery: [],
      },
      {
        id: "team-1-soccer-open-2023",
        discipline: "rcj-soccer-open",
        years: "2023",
        status: "retired",
        tagline: "The first build — a Raspberry Pi on wheels that made Worlds.",
        summary:
          "LNX Robots' first international entry: a Raspberry Pi 4 for vision and logic, a Teensy 4.1 handling line sensors and motors, and a fully multiprocess software stack squeezed onto modest hardware. It went straight to the World Championship in Bordeaux, taking 1st place in the Junior Soccer Open SuperTeam event on debut.",
        specs: [
          { label: "Main processing unit", value: "Raspberry Pi 4" },
          { label: "Secondary MCU", value: "Teensy 4.1 (line sensors, motors)" },
          { label: "Camera", value: "Arducam B0310, 120° FOV, 12MP, forward-facing" },
          { label: "IMU", value: "Adafruit BNO055" },
          { label: "Motors", value: "Pololu #3202 (1000 RPM) / #3203 (500 RPM)" },
          { label: "Motor driver", value: "VNH5019" },
          { label: "Omni wheels", value: "GTF Robots 50mm / self-made" },
          {
            label: "Line sensors",
            value: "OSRAM SFH-4656 IR LED + Kingbright AP2012P3C",
          },
          { label: "Software architecture", value: "Multiprocess (per-subsystem)" },
        ],
        codeRepo: "https://github.com/lnxrobots/rcj-soccer-open",
        docs: [
          {
            title: "Poster — RoboCup 2023, Bordeaux",
            href: "https://lnxrobots.github.io/docs/2023/LNX_Robots_poster.pdf",
            kind: "poster",
            year: 2023,
          },
          {
            title: "Team Description Paper 2023",
            href: "https://lnxrobots.github.io/docs/2023/LNX_Robots_documentation.pdf",
            kind: "tdp",
            year: 2023,
          },
          {
            title: "PCB schematic 2023",
            href: "https://lnxrobots.github.io/docs/2023/LNX_Robots_pcb-schematic.pdf",
            kind: "schematic",
            year: 2023,
          },
        ],
        gallery: [],
      },
    ],
  },
];

export function getTeam(slug: string): Team | undefined {
  return teams.find((t) => t.slug === slug);
}

/** Sort newest-first by founding year. */
export function sortedTeams(): Team[] {
  return [...teams].sort((a, b) => b.since.localeCompare(a.since));
}

/** Every discipline slug a team currently or previously competed in, de-duplicated. */
export function teamDisciplines(team: Team): string[] {
  return [...new Set(team.campaigns.map((c) => c.discipline))];
}

/** A team's campaigns, most recently updated first (by years string, descending). */
export function sortedCampaigns(team: Team) {
  return [...team.campaigns].sort((a, b) => b.years.localeCompare(a.years));
}
