# LNX Robots content editor

**Edit the website by clicking on it.**
Your real site on the right, the editor on the left. Click a headline, a photo or a team card and the
field to change opens right away.

```
┌─ Editor ──────────────────┬─ Your website ───────────────────────────┐
│  Team 1 › Tagline         │                                          │
│  ┌─────────────────────┐  │     Turning spare parts into             │
│  │ We build robots…    │  │     world-class robots.      ◄── click   │
│  └─────────────────────┘  │                                          │
│  Cover image  [ ⤢ ]       │     ┌ Team 1 ┐  ┌ Team 2 ┐               │
└───────────────────────────┴──────────────────────────────────────────┘
```

## Start

```bash
npm run admin:setup   # once
npm run dev           # terminal 1: the website
npm run admin         # terminal 2: the editor, at http://localhost:4000
```

## How it works

1. **Click** any text, photo or card on the page.
2. **Change it** on the left. Drop in photos, paste YouTube links, reorder things.
3. **Save** with Ctrl/⌘ + S and the preview updates. Or tick **Live preview** to save as you type.
4. **Review** shows exactly what changed. Then commit and push with git as usual.

The editor only changes files on your computer. It never commits or publishes anything.

## What you can edit

| Tab | What's in it |
| --- | --- |
| **Texts** | Headlines, section labels and paragraphs |
| **Site** | Name, contact, next event, homepage cover and photos |
| **Teams** | Members, mentors, competition entries, documents, photos |
| **Results** | Placements, videos, photos, cover image |
| **Sponsors** | Names, links, logos |
| **Competitions** | The leagues the club enters |
| **Media** | Every uploaded file: descriptions, bulk delete |
| **Review** | Changed files and the git diff |

## Good to know

- **Browse mode** (or Ctrl/⌘-click) follows links instead of selecting. The editor follows you around the site.
- **Photos:** pick several at once, click any photo to see it larger. Each photo's description is written once
  and reused everywhere. New uploads get one from the file name, and big photos are shrunk to 2000 px.
- **Videos** are YouTube links. Paste any YouTube URL.
- **Safe by design:** old files are backed up in `admin/.backups`, and it won't overwrite a file you changed
  elsewhere. Your formatting and comments stay put, so git diffs show only what you edited.
- Text written inside a page's code (most of *About*, for example) can't be edited until it's moved into
  `src/data/copy.ts`.

<details>
<summary>For developers</summary>

&nbsp;

A small Next.js + TypeScript app, separate from the site (the site is a static export and can't host API routes).
It listens on `127.0.0.1` only, and the site talks to it through a dev-only bridge
(`src/components/dev/EditBridge.tsx`, not included in production builds).

```
admin/src/lib/tsdata.ts   reads and surgically patches src/data/*.ts
admin/src/lib/server.ts   saving, uploads, media, git
admin/src/ui/schema.ts    every form field, in one place
admin/src/ui/inspect.ts   page element → data field matching
admin/src/ui/*.tsx        the React UI
```

- `npm test` (in `admin/`, Node 22.6+) runs the tests; `npm run typecheck` type-checks.
- **Make more text editable:** add a field to `src/data/copy.ts`, add a line for it in `F.copy`
  (`admin/src/ui/schema.ts`), then use `{copy.home.yourField}` in the component.

</details>
