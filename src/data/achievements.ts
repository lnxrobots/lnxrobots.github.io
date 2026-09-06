import { Achievement } from "./types";

/**
 * Competition results, newest first. Not limited to soccer — set
 * `discipline` to any slug from src/data/disciplines.ts (add a new one
 * there first if needed) to log a result from RoboRAVE or anything else.
 *
 * Each result gets its own dedicated page at /achievements/<id> (built
 * automatically from `id`) so the /achievements timeline can stay compact
 * while the full write-up — video, standings link, and an optional photo
 * gallery — lives one click away.
 *
 * TO ADD A NEW COMPETITION RESULT: append one object to this array —
 * the homepage "latest result" strip and the /achievements timeline
 * both pull straight from here, ordering is handled for you.
 *
 * {
 *   id: "20XX-city",
 *   event: "Competition name",
 *   discipline: "rcj-soccer-open",   // see src/data/disciplines.ts
 *   location: "City, Country",
 *   date: "20XX-MM-DD",
 *   team: "team-1",                   // see src/data/teams.ts
 *   results: [{ label: "1st place, ...", tier: "gold" }],
 *   resultsUrl: "https://...",        // optional
 *   youtubeId: "...",                 // optional
 *   gallery: [                        // optional — omit entirely if you have no photos yet
 *     { src: "/content/events/20XX-city/photo.jpg", alt: "Describe the photo" },
 *   ],
 * },
 */
export const achievements: Achievement[] = [
  {
    id: "2025-salvador",
    event: "RoboCup World Championship",
    location: "Salvador, Brazil",
    date: "2025-07-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [
      { label: "2nd place, Junior Soccer Open", tier: "silver" },
      { label: "Exemplary Team Award", tier: "special" },
    ],
    youtubeId: "Y5WyA96kV70",
  },
  {
    id: "2025-bari",
    event: "RoboCupJunior European Championship",
    location: "Bari, Italy",
    date: "2025-05-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [{ label: "3rd place, Soccer Open", tier: "bronze" }],
    resultsUrl: "https://catigoal.com/RCJE2025/standings?league=OPEN&league_stage=0",
  },
  {
    id: "2025-croatia",
    event: "RoboCup Junior Croatia",
    location: "Zagreb, Croatia",
    date: "2025-04-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [{ label: "2nd place, Soccer Open", tier: "silver" }],
    resultsUrl: "http://robocup.zviz.net/robocup-junior-zagreb-2025/results",
  },
  {
    id: "2025-slovakia",
    event: "RoboCup Junior Slovakia",
    location: "Slovakia",
    date: "2025-03-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [{ label: "1st place, Soccer Open", tier: "gold" }],
    resultsUrl: "https://robocup.skse.sk/results/13/",
    youtubeId: "20twMOfppc8",
    gallery: [
      { src: "/content/events/2025-slovakia/img-32.jpg", alt: "Jifyx the robot vs ZG24Robotics" },
      { src: "/content/events/2025-slovakia/P1026340.JPG", alt: "Assembling the new robot" },
      { src: "/content/events/2025-slovakia/fmb_mm-61.jpg", alt: "Nyvora the robot" },
      { src: "/content/events/2025-slovakia/fmb_mm-56.jpg", alt: "Testing the new robot's kicker" },
      { src: "/content/events/2025-slovakia/IMG_4535.jpg", alt: "All 3 generations of our robots" },
      { src: "/content/events/2025-slovakia/IMG_4538.jpg", alt: "All 3 generations of our robots" },
      { src: "/content/events/2025-slovakia/IMG_4528.jpg", alt: "LNX Robots" },
      { src: "/content/events/2025-slovakia/P1036429.JPG", alt: "Awards ceremony" },
      { src: "/content/events/2025-slovakia/IMG_4585.jpg", alt: "Demonstration in Slovak morning show Teleráno" }
    ]
  },
  {
    id: "2024-eindhoven",
    event: "RoboCup World Championship",
    location: "Eindhoven, Netherlands",
    date: "2024-07-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [
      { label: "2nd place, Junior Soccer Open", tier: "silver" },
      { label: "2nd place, Junior Soccer Open SuperTeam", tier: "silver" },
      { label: "Top Poster and Presentation Award", tier: "special" },
    ],
    youtubeId: "YnFQOK-M96Y",
  },
  {
    id: "2024-europe",
    event: "RoboCupJunior European Championship",
    location: "Europe",
    date: "2024-06-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [{ label: "1st place, Soccer Open", tier: "gold" }],
    resultsUrl:
      "https://2024.robocupjunior.eu/wp-content/uploads/2024/06/Open-International-Standings-Day-4.pdf",
    youtubeId: "ycy4akEXcko",
  },
  {
    id: "2024-croatia",
    event: "RoboCup Junior Croatia",
    location: "Zagreb, Croatia",
    date: "2024-04-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [{ label: "1st place, Soccer Open", tier: "gold" }],
    resultsUrl: "http://robocup.zviz.net/robocup-junior-zagreb-2024/results",
  },
  {
    id: "2024-slovakia",
    event: "RoboCup Junior Slovakia",
    location: "Slovakia",
    date: "2024-03-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [
      { label: "2nd place, Soccer Open", tier: "silver" },
      { label: "1st among Slovak teams", tier: "note" },
    ],
    resultsUrl: "https://robocup.skse.sk/results/3/",
    youtubeId: "muNbSWIVRXY",
  },
  {
    id: "2023-bordeaux",
    event: "RoboCup World Championship",
    location: "Bordeaux, France",
    date: "2023-07-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [
      { label: "15th place, Junior Soccer Open (Game)", tier: "note" },
      { label: "1st place, Junior Soccer Open SuperTeam", tier: "gold" },
    ],
    youtubeId: "3-lUAyqajDM",
  },
  {
    id: "2023-varazdin",
    event: "European RoboCup Junior",
    location: "Varaždin, Croatia",
    date: "2023-05-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [{ label: "5th place, Soccer Open", tier: "note" }],
    resultsUrl: "http://robocup.zviz.net/european-robocup-junior-2023/results",
  },
  {
    id: "2023-slovakia",
    event: "RoboCup Junior Slovakia",
    location: "Slovakia",
    date: "2023-03-01",
    discipline: "rcj-soccer-open",
    team: "team-1",
    results: [{ label: "1st place, Soccer Open", tier: "gold" }],
    resultsUrl: "https://wiki.robotika.sk/robowiki/images/2/28/RCJ2023_Soccer_open_results.pdf",
    youtubeId: "EfiDgmioZJE",
  },
];

export function getAchievement(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}
