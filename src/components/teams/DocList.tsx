import { Document } from "@/data/types";

const kindLabel: Record<Document["kind"], string> = {
  poster: "POSTER",
  tdp: "TDP",
  "design-doc": "DESIGN DOC",
  schematic: "SCHEMATIC",
  archive: "ARCHIVE",
  other: "FILE",
};

export function DocList({ docs }: { docs: Document[] }) {
  if (docs.length === 0) {
    return <p className="font-mono text-sm text-paper-faint">Nothing published yet.</p>;
  }

  return (
    <ul className="divide-y divide-copper/15 border border-copper/15">
      {docs.map((doc) => (
        <li key={doc.href}>
          <a
            href={doc.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-board-raised"
          >
            <span className="font-body text-sm text-paper group-hover:text-signal-bright">
              {doc.title}
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-[10px] text-copper/70">{kindLabel[doc.kind]}</span>
              <span className="font-mono text-xs text-paper-faint">{doc.year}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
