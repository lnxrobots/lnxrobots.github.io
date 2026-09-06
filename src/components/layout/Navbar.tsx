"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";
import { aquireBold } from "@/app/fonts/fonts";

const links = [
  { href: "/teams", label: "Teams" },
  { href: "/achievements", label: "Achievements" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-copper/15 bg-board/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
          <span className={`${aquireBold.className} text-2xl tracking-tight text-paper`}>
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 sm:flex py-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-sm text-paper-muted transition-colors hover:text-signal-bright"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center border border-copper/30 text-copper-bright sm:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {open ? (
              <path d="M3 3 L15 15 M15 3 L3 15" stroke="currentColor" strokeWidth="1.6" />
            ) : (
              <path d="M2 5 H16 M2 9 H16 M2 13 H16" stroke="currentColor" strokeWidth="1.6" />
            )}
          </svg>
        </button>
      </div>

      <nav
        className={cn(
          "grid gap-1 border-t border-copper/15 px-5 pb-4 pt-2 sm:hidden",
          open ? "block" : "hidden"
        )}
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="rounded-sm px-2 py-2 font-mono text-sm text-paper-muted hover:bg-board-raised hover:text-signal-bright"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header >
  );
}
