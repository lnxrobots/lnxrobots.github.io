/**
 * Texts that appear on the website's pages (headlines, section labels, short paragraphs).
 * Edit them in the content editor's "Texts" tab, or right here.
 * (Names, taglines and the like live in site.ts / teams.ts; this file is for the page copy itself.)
 */
export interface Copy {
  home: {
    /** Big headline at the top of the homepage */
    heroTitle: string;
    /** Small label above the "most recent result" strip */
    latestLabel: string;
    /** Section about the teams (label, heading, paragraph) */
    teamsLabel: string;
    teamsTitle: string;
    teamsText: string;
    /** Small label above the homepage photos (their heading and text are in site.ts → homeGallery) */
    galleryLabel: string;
    /** Sponsors strip (label, paragraph) */
    sponsorsLabel: string;
    sponsorsText: string;
  };
}

export const copy: Copy = {
  home: {
    heroTitle: "Turning spare parts into world-class robots.",
    latestLabel: "most recent result",
    teamsLabel: "the teams",
    teamsTitle: "People come and go",
    teamsText:
      "We have one mentor who's been with the club the whole time. The teams themselves change more — every season some people graduate out and new ones join in.",
    galleryLabel: "some photos",
    sponsorsLabel: "who keeps the boards powered",
    sponsorsText: "LNX Robots runs on parts, travel budgets, and resources provided by the organisations below.",
  },
};
