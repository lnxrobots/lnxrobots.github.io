"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

function getRemaining(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  const clamped = Math.max(diff, 0);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((clamped / (1000 * 60)) % 60);
  const seconds = Math.floor((clamped / 1000) % 60);
  return { days, hours, minutes, seconds, done: diff <= 0 };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownReadout() {
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining> | null>(null);

  useEffect(() => {
    setRemaining(getRemaining(site.nextEvent.start));
    const id = setInterval(() => setRemaining(getRemaining(site.nextEvent.start)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <a
      href={site.nextEvent.href}
      target="_blank"
      rel="noreferrer"
      className="pad-chamfer group block border border-signal/25 bg-board-raised/90 px-5 py-4 transition-colors hover:border-signal/50"
    >
      <div className="flex items-center gap-2 font-mono text-[11px] text-signal/80">
        <span className="h-1.5 w-1.5 rounded-full bg-signal animate-via-glow" />
        <span>NEXT EVENT // T-MINUS</span>
      </div>

      <p className="mt-2 font-display text-base text-paper">{site.nextEvent.name}</p>
      <p className="font-mono text-xs text-paper-muted">{site.nextEvent.location}</p>

      <div className="mt-4 flex gap-4 font-mono tabular-nums">
        {remaining ? (
          <>
            <Unit value={remaining.days} label="d" />
            <Unit value={remaining.hours} label="h" />
            <Unit value={remaining.minutes} label="m" />
            <Unit value={remaining.seconds} label="s" />
          </>
        ) : (
          <span className="text-2xl text-signal-bright">--:--:--:--</span>
        )}
        <span className="ml-1 mt-0.5 h-5 w-2 bg-signal/70 animate-blink" aria-hidden="true" />
      </div>
    </a>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <span className="text-2xl text-signal-bright">
      {pad(value)}
      <span className="ml-0.5 text-xs text-paper-faint">{label}</span>
    </span>
  );
}
