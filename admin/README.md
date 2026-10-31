# LNX Robots content editor

A visual editor for the website. The real site is shown on the right; **click any text or photo on it and
the matching field opens on the left**. Edit text, upload photos and documents, add YouTube videos, manage
teams, results and sponsors — without touching code.

It is a **separate Next.js + TypeScript app** in this `admin/` folder, and only ever runs on your computer.
It **never touches git**: it changes files in the website project and you review and commit them yourself.

| Edits | Where it writes |
| --- | --- |
| Text, teams, results, sponsors, settings, image descriptions | `src/data/*.ts` |
| Uploaded photos, logos, PDFs | `public/content/…` |

## Run it

```bash
npm run admin:setup     # once: installs the editor's own dependencies
npm run dev             # terminal 1: the website, http://localhost:3000
npm run admin           # terminal 2: the editor,  http://localhost:4000
```

Open http://localhost:4000. (If the website isn't running the preview says so and connects by itself once it is.)

## Using it

- **Edit mode** (default): hover the page — editable things get a copper outline and a label. Click one and
  the field opens on the left, scrolled into view and highlighted. Clicking a card's empty area opens that
  whole record.
- **Browse mode** (or Ctrl/⌘-click): follow links normally. When you open a page in the preview, the editor
  switches to that page's content, and vice-versa (untick *Follow editor* to stop that).
- **Save** (Ctrl/⌘ + S) writes your changes; the preview refreshes. Tick **Live preview** to save automatically
  a moment after you stop typing — only when everything is valid.
- Use the **page picker**, and **Desktop / Tablet / Phone** to check how it looks at other sizes.
- The tabs on the left list everything (also for things that aren't visible on the current page, like adding a
  new team or result).
- **Review** shows `git status` and the diff. Then commit and push yourself:

```bash
git add -A
git commit -m "Update website content"
git push
```

## What it takes care of

- **Small, readable diffs.** Only the values you changed are rewritten. Comments, formatting and everything
  else in `src/data/*.ts` stay byte-for-byte identical, and each rewritten file is verified to read back
  identically before it's saved. A save with no edits changes nothing.
- **One description per image.** An image's description (alt text) is stored once, in the media library
  (`src/data/media.ts`, file path → description). Every gallery showing that image uses it — edit it in a gallery
  or in the **Media** tab and it changes everywhere. New uploads start with a description made from the file name
  (`Team-1-at-RoboCup_2025.jpg` → "Team 1 at RoboCup 2025"); camera names like `IMG_1234.jpg` say nothing, so
  those stay empty and get a warning. *Media → "Fill empty descriptions from file names"* does the same for
  images you already have. Descriptions already in your galleries are picked up automatically (if one image has
  two different descriptions, the first one found wins). The site itself is unchanged: it still reads each
  gallery item's `alt`, which the editor keeps in sync.
- **Large photos are shrunk** in the browser to max 2000 px wide before upload (switch off on the Start screen).
- **Videos are YouTube links.** Paste any YouTube link (watch, youtu.be, shorts, with a timestamp). The site has
  no player for video *files*.
- **Safety nets.** Ids/slugs are locked once saved; a team or competition that's still in use can't be deleted;
  saving is blocked on missing required fields; the editor refuses to overwrite a data file that changed on
  disk since you opened it.
- **Backups.** Before saving, the old data files are copied to `admin/.backups/` (git-ignored; one folder per
  editing session), and deleted uploads are kept in `admin/.backups/deleted-files/`.
- Results are kept **newest first** automatically (the homepage shows the first as "latest result").
- In result labels, `{{team:team-1}}` inserts that team's current name (how `getTeam("team-1")?.name` appears here).

## How click-to-edit works (and its limits)

The preview can't tell the editor "this is team 2's tagline" — it only reports the element's text, image
address or link. The editor indexes every value in the data and matches on those, preferring the page you're
on and the element's position when the same words appear more than once. If the same text lives in two fields
(e.g. a team's badge and name), the others are offered as "also appears in".

- Text that isn't in `src/data` (for example much of the **About** page, which is written in the page's code)
  can't be edited here — clicking it just says so.
- The page shows *saved* data, so an unsaved edit appears in the preview after Save (or with Live preview).
- Dates and numbers shown formatted (e.g. "15 June 2027") are edited through the field panel, not by clicking.

## Security

The server listens on `127.0.0.1` only, rejects requests whose `Host` isn't localhost, requires a custom
header on every write (so other websites can't trigger one), and confines uploads and file serving to
`public/content`. Allowed uploads: images, PDF, ZIP, Office documents, text — max 100 MB (GitHub's limit).
The bridge accepts commands only from the page that embeds the site.

## Development

```
admin/
  src/lib/tsdata.ts     reads & surgically patches the TypeScript data files (pure, tested)
  src/lib/server.ts     saving, uploads, media, git — used by the API routes
  src/app/api/*         thin route handlers
  src/ui/schema.ts      ONE place describing every form field, validation and key order
  src/ui/inspect.ts     page element → data field matching (pure, tested)
  src/ui/protocol.ts    the editor's side of the conversation with the site's bridge
  src/ui/Preview.tsx    the embedded site + toolbar;  App.tsx the shell;  widgets.tsx / views.tsx the forms
```

`npm test` (Node 22.6+) checks the patcher and the matcher, including that your real data files round-trip
unchanged. `npm run typecheck` type-checks the app.
