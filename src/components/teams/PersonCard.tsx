import Image from "next/image";
import { Person } from "@/data/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function PersonCard({ person }: { person: Person }) {
  return (
    <div className="flex items-center gap-3">
      <div className="pad-chamfer-sm relative h-14 w-14 shrink-0 overflow-hidden border border-copper/25 bg-board-raised">
        {person.photo ? (
          <Image src={person.photo} alt={person.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-sm text-copper/70">
            {initials(person.name) || "?"}
          </div>
        )}
      </div>
      <div>
        <p className="font-body text-sm text-paper">{person.name}</p>
        <p className="font-mono text-xs text-copper/70">{person.role}</p>
        {person.bio && (
          <p className="mt-0.5 max-w-xs font-body text-xs leading-snug text-paper-faint">
            {person.bio}
          </p>
        )}
      </div>
    </div>
  );
}
