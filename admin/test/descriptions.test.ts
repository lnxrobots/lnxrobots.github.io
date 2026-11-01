import { test } from "node:test";
import assert from "node:assert/strict";
import { describeFromFilename as d, seedDescriptions, syncAlts, mediaValues } from "../src/ui/descriptions.ts";

test("file names become readable descriptions", () => {
  assert.equal(d("Team-1-at-RoboCup_2025_final.jpg"), "Team 1 at RoboCup 2025 final");
  assert.equal(d("robot-assembly.png"), "Robot assembly");
  assert.equal(d("maxon-logo.svg"), "Maxon logo");
  assert.equal(d("Stretnutie tímu v Bratislave.JPG"), "Stretnutie tímu v Bratislave");
  assert.equal(d("/some/dir/pit-crew (2).webp"), "Pit crew 2");
});

test("camera and screenshot names say nothing, so they give an empty description", () => {
  for (const n of ["IMG_20250712_134501.jpg", "DSC01234.JPG", "PXL_20250712_101010123.jpg", "image.png", "photo (1).jpg", "Screenshot 2025-07-12 at 10.00.00.png", "1234.jpg", "20250712.jpg"]) assert.equal(d(n), "", n);
});

test("junk is dropped but real words around it are kept", () => {
  assert.equal(d("IMG_1234_final_match.jpg"), "Final match");
  assert.equal(d("20250712-pit-stop-1024x768.jpg"), "Pit stop");
});

const data = () => ({
  mediaDescriptions: {} as Record<string, string>,
  teams: [{ campaigns: [{ gallery: [{ src: "/c/a.jpg", alt: "Robot on the field" }, { src: "/c/b.jpg", alt: "" }] }] }],
  achievements: [{ gallery: [{ src: "/c/a.jpg", alt: "Something else" }, { src: "/c/b.jpg", alt: "The team" }] }],
});

test("existing gallery descriptions seed the library (first wins), then everything is synced", () => {
  const x = data();
  seedDescriptions(x);
  assert.equal(x.mediaDescriptions["/c/a.jpg"], "Robot on the field");
  assert.equal(x.mediaDescriptions["/c/b.jpg"], "The team");
  syncAlts(x);
  assert.equal(x.achievements[0].gallery[0].alt, "Robot on the field");
  assert.equal(x.teams[0].campaigns[0].gallery[1].alt, "The team"); // was empty, now described
});

test("editing a description changes every place the image is used", () => {
  const x = data();
  seedDescriptions(x);
  x.mediaDescriptions["/c/a.jpg"] = "Goalkeeper robot, close-up";
  syncAlts(x);
  assert.equal(x.teams[0].campaigns[0].gallery[0].alt, "Goalkeeper robot, close-up");
  assert.equal(x.achievements[0].gallery[0].alt, "Goalkeeper robot, close-up");
});

test("clearing a description clears it everywhere and keeps it out of the file", () => {
  const x = data();
  seedDescriptions(x);
  x.mediaDescriptions["/c/a.jpg"] = "";
  syncAlts(x);
  assert.equal(x.achievements[0].gallery[0].alt, "");
  assert.deepEqual(Object.keys(mediaValues(x)), ["/c/b.jpg"]);
});

test("the file is written sorted and trimmed", () => {
  const x = { mediaDescriptions: { "/z.jpg": " Zed ", "/a.jpg": "Ay", "/e.jpg": "  " }, teams: [], achievements: [] };
  assert.deepEqual(Object.entries(mediaValues(x)), [["/a.jpg", "Ay"], ["/z.jpg", "Zed"]]);
});

test("cover images and homepage photos share descriptions with galleries", () => {
  const x: any = {
    mediaDescriptions: {},
    site: { cover: { src: "/c/hero.jpg", alt: "Nyvora the robot" }, homeGallery: { images: [{ src: "/c/a.jpg", alt: "" }] } },
    teams: [{ cover: { src: "/c/a.jpg", alt: "Robot on the field" }, campaigns: [{ gallery: [{ src: "/c/hero.jpg", alt: "" }] }] }],
    achievements: [{ cover: { src: "/c/a.jpg", alt: "" } }],
  };
  seedDescriptions(x);
  syncAlts(x);
  assert.equal(x.site.homeGallery.images[0].alt, "Robot on the field"); // same photo, same description
  assert.equal(x.achievements[0].cover.alt, "Robot on the field");
  assert.equal(x.teams[0].campaigns[0].gallery[0].alt, "Nyvora the robot"); // hero photo reused in a gallery
});
