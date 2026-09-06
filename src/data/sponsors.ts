import { Sponsor } from "./types";

/**
 * TO ADD A SPONSOR LOGO: drop the image file into /public/content/sponsors/
 * (SVG or PNG with a transparent background works best on the dark
 * background) and set `logo` to its path, e.g.:
 *   { name: "Acme Corp", url: "https://acme.example", logo: "/content/sponsors/acme.svg" }
 * `logo` is optional — leave it out and the sponsor still renders fine as
 * a plain text entry.
 */
export const sponsors: Sponsor[] = [
  { name: "GAMČA", url: "https://www.gamca.sk/", logo: "/content/sponsors/gamca.svg" },
  { name: "Nadácia Eset", url: "https://www.nadaciaeset.sk/", logo: "/content/sponsors/eset.svg" },
  { name: "NIVAM", url: "https://www.nivam.sk/", logo: "/content/sponsors/nivam.svg" },
  { name: "Slovnaft", url: "https://slovnaft.sk/en/", logo: "/content/sponsors/slovnaft.svg" },
  { name: "Central European Foundation", url: "https://cef.sk/", logo: "/content/sponsors/cef.svg" },
  { name: "Nadácia Tatra banky", url: "https://www.nadaciatatrabanky.sk/", logo: "/content/sponsors/tatrabanka.svg" },
  {
    name: "maxon Young Engineers Program",
    url: "https://www.maxongroup.com/en/cooperations/young-engineers-program",
    logo: "/content/sponsors/maxon.svg"
  },
  { name: "Siemens", url: "https://www.siemens.com/", logo: "/content/sponsors/siemens.svg" },
  { name: "dNation", url: "https://dnation.cloud/", logo: "/content/sponsors/dnation.svg" },
  { name: "Microstep", url: "https://www.microstep.eu/", logo: "/content/sponsors/microstep.png" },
];

export const fundingNote =
  "This project has received support through the Talents of New Europe (TNE) Programme.";
