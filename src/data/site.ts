import type { Site } from "./types";

export const site: Site = {
  name: "LNX Robots",
  designation: "LNX",
  shortTagline: "Slovak student robotics club",
  longTagline:
    "We are a team of high schoolers in Bratislava. We spend our free time designing, programming, and breaking things until we have a robot ready for the international stage.",
  email: "lnxrobots@gmail.com",
  location: "GAMČA, Bratislava, Slovakia",
  googleVerification: "eJAEm5KWt4yQEV4tb9VYOO6jLPridtS9trfZtDNfIbA",
  social: {
    github: "https://github.com/lnxrobots",
    youtube: "https://www.youtube.com/@lnxrobots9860",
    instagram: "https://www.instagram.com/lnxrobots/",
  },
  // Next confirmed event on the team calendar — shown as a live countdown on the homepage.
  nextEvent: {
    name: "RoboCup World Championship 2027",
    location: "Nuremberg, Germany",
    start: "2027-06-15T00:00:00+02:00",
    end: "2027-06-21T00:00:00+02:00",
    href: "https://robocup.de/en/",
  },
  homeGallery: {
    title: "Gallery",
    text: "",
    images: [
      { src: "/content/events/2025-slovakia/all-3-generations-of-our-robots.jpg", alt: "All 3 generations of our robots (Team 1)" },
      { src: "/content/events/2024-europe/istrobot-2024-slovakia-foto-c-robotika-sk.jpg", alt: "Istrobot 2024 Slovakia" },
      { src: "/content/events/2024-slovakia/robots-of-lnx-robots-and-xlc-younglings.jpg", alt: "Robots of LNX Robots and XLC Younglings" },
      { src: "/content/events/2024-europe/preparing-for-the-finals-robocupjunior-european-championship-2024-hanover.jpg", alt: "Preparing for the finals. RoboCupJunior European Championship 2024, Hanover" },
      { src: "/content/events/2024-eindhoven/view-from-the-robot-s-360-degree-mirror.jpg", alt: "View from the robot's 360 degree mirror" },
      { src: "/content/events/2024-eindhoven/preparing-robots-for-the-superteams-match.jpg", alt: "Preparing robots for the SuperTeams match" },
    ],
  },
  cover: { src: "/content/cover.jpg", alt: "Robot made by LNX Robots Team 1" },
};
