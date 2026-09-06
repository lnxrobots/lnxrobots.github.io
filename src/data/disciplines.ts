export interface Discipline {
  slug: string;
  /** Full display name, e.g. "RoboCupJunior Soccer — Open" */
  name: string;
  /** Short badge form, e.g. "Soccer Open" */
  shortName: string;
  /** Which organisation runs it, e.g. "RoboCupJunior", "RoboRAVE International" */
  org: string;
  url?: string;
}

/**
 * The full catalogue of competitions/leagues any LNX Robots team might enter.
 * A team is not assumed to be a soccer team — it lists whichever of these
 * (one or more) it actually competes in via its `disciplines` field in
 * src/data/teams.ts.
 *
 * TO ADD A NEW COMPETITION (e.g. a new RoboCupJunior league, or an entirely
 * different event like RoboRAVE): add one object below with a unique slug,
 * then reference that slug from a team's `disciplines` array and/or from an
 * achievement's `discipline` field in src/data/achievements.ts.
 */
export const disciplines: Discipline[] = [
  {
    slug: "rcj-soccer-open",
    name: "RoboCupJunior Soccer — Open",
    shortName: "Soccer Open",
    org: "RoboCupJunior",
    url: "https://junior.robocup.org/rcj-soccer/",
  },
  {
    slug: "rcj-soccer-infra",
    name: "RoboCupJunior Soccer — Infra",
    shortName: "Soccer Infra",
    org: "RoboCupJunior",
    url: "https://junior.robocup.org/rcj-soccer/",
  },
  {
    slug: "robocup-ssl",
    name: "RoboCup Soccer — Small Size League",
    shortName: "SSL",
    org: "RoboCup",
    url: "https://ssl.robocup.org/",
  },
  {
    slug: "roborave",
    name: "RoboRAVE International",
    shortName: "RoboRAVE",
    org: "RoboRAVE International",
    url: "https://www.roborave.org/",
  },
];

export function getDiscipline(slug: string): Discipline | undefined {
  return disciplines.find((d) => d.slug === slug);
}
