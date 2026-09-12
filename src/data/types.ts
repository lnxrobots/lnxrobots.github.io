export type ResultTier = "gold" | "silver" | "bronze" | "special" | "note";

export interface Result {
  /** e.g. "1st place", "2nd place", "Exemplary Team Award" */
  label: string;
  tier: ResultTier;
}

export interface Achievement {
  id: string;
  /** Competition name, e.g. "RoboCup World Championship" */
  event: string;
  /** Which league/discipline this result was in — slug from src/data/disciplines.ts */
  discipline: string | string[];
  location: string;
  /** ISO date (start date if the event spans multiple days) */
  date: string;
  /** Which team competed — slug from src/data/teams.ts */
  team: TeamSlug | TeamSlug[];
  results: Result[];
  /** Optional external results/standings link */
  resultsUrl?: string;
  /** Optional YouTube video id to embed */
  youtubeId?: string;
  /** Optional photos from this specific event — shown on its dedicated event page */
  gallery?: GalleryImage[];
}

export interface Document {
  title: string;
  /** File path relative to /public, e.g. /content/team-1/soccer-open/docs/poster.pdf */
  href: string;
  kind: "poster" | "tdp" | "design-doc" | "schematic" | "archive" | "other";
  year: number;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export type TeamSlug = string;

export interface RobotSpec {
  label: string;
  value: string;
}

/** A person on the team — a member or a mentor. Photo is always optional. */
export interface Person {
  name: string;
  /** e.g. "Team captain", "Software", "Hardware & electronics", "Mentor" */
  role: string;
  /** Optional headshot. Path relative to /public, e.g. /content/team-1/members/jana.jpg */
  photo?: string;
  /** Optional one-line bio or fun fact */
  bio?: string;
}

/**
 * One team's entry into one competition/league, for one season or an
 * ongoing run of seasons. A team with a single roster can — and often
 * does — run several of these in parallel (e.g. RoboCupJunior Soccer Open
 * *and* RoboCup SSL), each with its own build, docs, and gallery.
 */
export interface Campaign {
  id: string;
  /** Which competition/league — slug from src/data/disciplines.ts */
  discipline: string;
  years: string;
  status: "competing" | "retired" | "in-development";
  tagline: string;
  summary: string;
  specs: RobotSpec[];
  codeRepo?: string;
  hardwareRepo?: string;
  docs: Document[];
  gallery: GalleryImage[];
}

export interface Team {
  slug: TeamSlug;
  /** Short badge shown on cards, e.g. "Team 1" */
  designation: string;
  name: string;
  /** Year the team was formed */
  since: string;
  active: boolean;
  tagline: string;
  summary: string;
  members: Person[];
  mentors: Person[];
  /** One entry per competition (and, if relevant, per season within it) — see the Campaign type above. */
  campaigns: Campaign[];
}

export interface Sponsor {
  name: string;
  url: string;
  note?: string;
  /** Optional logo image. Path relative to /public, e.g. /content/sponsors/acme.svg */
  logo?: string;
}
