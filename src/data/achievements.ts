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
      { src: "/content/events/2025-slovakia/jifyx-the-robot-vs-zg24robotics-robocup-junior-2025-slovakia-photo-spse-zochova.jpg", alt: "Jifyx the robot vs ZG24Robotics. RoboCup Junior 2025 Slovakia. Photo: SPŠE Zochova" },
      { src: "/content/events/2025-slovakia/assembling-the-new-robot.JPG", alt: "Assembling the new robot" },
      { src: "/content/events/2025-slovakia/nyvora-the-robot-robocup-junior-2025-slovakia-photo-spse-zochova.jpg", alt: "Nyvora the robot. RoboCup Junior 2025 Slovakia. Photo: SPŠE Zochova" },
      { src: "/content/events/2025-slovakia/testing-the-new-robot-s-kicker.jpg", alt: "Testing the new robot's kicker" },
      { src: "/content/events/2025-slovakia/all-3-generations-of-our-robots.jpg", alt: "All 3 generations of our robots" },
      { src: "/content/events/2025-slovakia/all-3-generations-of-our-robots-1.jpg", alt: "All 3 generations of our robots" },
      { src: "/content/events/2025-slovakia/lnx-robots.jpg", alt: "LNX Robots" },
      { src: "/content/events/2025-slovakia/awards-ceremony.JPG", alt: "Awards ceremony" },
      { src: "/content/events/2025-slovakia/demonstration-in-slovak-morning-show-telerano.jpg", alt: "Demonstration in Slovak morning show Teleráno" },
    ],
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
    gallery: [
      { src: "/content/events/2024-eindhoven/lnx-robots.jpg", alt: "LNX Robots" },
      { src: "/content/events/2024-eindhoven/robots-with-a-trophy.jpg", alt: "Robots with a trophy" },
      { src: "/content/events/2024-eindhoven/view-from-the-robot-s-360-degree-mirror.jpg", alt: "View from the robot's 360 degree mirror" },
      { src: "/content/events/2024-eindhoven/preparing-robots-for-the-superteams-match.jpg", alt: "Preparing robots for the SuperTeams match" },
      { src: "/content/events/2024-eindhoven/preparing-for-the-match-with-tigers-mannheim.jpg", alt: "Preparing for the match with TIGERs Mannheim" },
      { src: "/content/events/2024-eindhoven/robocup-junior-with-tigers-mannheim.jpg", alt: "RoboCup Junior with TIGERs Mannheim" },
      { src: "/content/events/2024-eindhoven/all-robocup-2024-participants-robocup-2024-eindhoven.jpg", alt: "All RoboCup 2024 participants. RoboCup 2024 Eindhoven" },
      { src: "/content/events/2024-eindhoven/awards-ceremony.jpg", alt: "Awards ceremony" },
    ],
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
    gallery: [
      { src: "/content/events/2024-europe/lnx-robots-robocupjunior-european-championship-2024-hanover.jpg", alt: "LNX Robots. RoboCupJunior European Championship 2024, Hanover" },
      { src: "/content/events/2024-europe/preparing-for-the-finals-robocupjunior-european-championship-2024-hanover.jpg", alt: "Preparing for the finals. RoboCupJunior European Championship 2024, Hanover" },
      { src: "/content/events/2024-europe/preparing-for-the-finals-robocupjunior-european-championship-2024-hanover-1.jpg", alt: "Preparing for the finals. RoboCupJunior European Championship 2024, Hanover" },
      { src: "/content/events/2024-europe/preparing-robots-for-the-superteams-match.jpg", alt: "Preparing robots for the SuperTeams match" },
      { src: "/content/events/2024-europe/preparing-robots-for-the-superteams-match-1.jpg", alt: "Preparing robots for the SuperTeams match" },
      { src: "/content/events/2024-europe/preparing-robots-for-the-match.jpg", alt: "Preparing robots for the match" },
      { src: "/content/events/2024-europe/awards-ceremony-robocupjunior-european-championship-2024-hanover.jpg", alt: "Awards ceremony. RoboCupJunior European Championship 2024, Hanover" },
    ],
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
    gallery: [
      { src: "/content/events/2024-slovakia/resetlik-the-robot-robocup-junior-2024-slovakia-photo-spse-zochova.jpg", alt: "Resetlik the robot. RoboCup Junior 2024 Slovakia. Photo: SPŠE Zochova" },
      { src: "/content/events/2024-slovakia/robots-of-lnx-robots-and-xlc-younglings.jpg", alt: "Robots of LNX Robots and XLC Younglings" },
      { src: "/content/events/2024-slovakia/preparing-robots-for-the-match-robocup-junior-2024-slovakia-photo-spse-zochova.jpg", alt: "Preparing robots for the match. RoboCup Junior 2024 Slovakia. Photo: SPŠE Zochova" },
      { src: "/content/events/2024-slovakia/working-on-robots.JPG", alt: "Working on robots" },
      { src: "/content/events/2024-slovakia/awards-ceremony.jpg", alt: "Awards ceremony" },
    ],
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
    gallery: [
      { src: "/content/events/2023-bordeaux/working-on-robots.JPG", alt: "Working on robots" },
      { src: "/content/events/2023-bordeaux/calibrating-robots.JPG", alt: "Calibrating robots" },
      { src: "/content/events/2023-bordeaux/lnx-robots-and-i-bots-2.JPG", alt: "LNX Robots and i-bots 2" },
      { src: "/content/events/2023-bordeaux/lnx-robots-and-mapletech-nebula.JPG", alt: "LNX Robots and Mapletech Nebula" },
      { src: "/content/events/2023-bordeaux/awards-ceremony.jpg", alt: "Awards ceremony" },
      { src: "/content/events/2023-bordeaux/robots-at-the-ocean.jpg", alt: "Robots at the ocean" },
    ],
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
