import Link from "next/link";
import { site } from "@/data/site";
import { aquireBold } from "@/app/fonts/fonts";

export function Footer() {
  return (
    <footer className="border-t border-copper/15 bg-board">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`${aquireBold.className} font-display text-base text-paper`}>{site.name}</span>
            </div>
            <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-paper-muted">
              {site.longTagline}
            </p>
          </div>

          <div>
            <p className="font-mono text-xs text-copper/70 mb-3">// elsewhere</p>
            <ul className="space-y-2 font-body text-sm text-paper-muted">
              <li>
                <a href={site.social.github} className="hover:text-signal-bright">
                  GitHub
                </a>
              </li>
              <li>
                <a href={site.social.youtube} className="hover:text-signal-bright">
                  YouTube
                </a>
              </li>
              <li>
                <a href={site.social.instagram} className="hover:text-signal-bright">
                  Instagram
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-signal-bright">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs text-copper/70 mb-3">// site</p>
            <ul className="space-y-2 font-body text-sm text-paper-muted">
              <li>
                <Link href="/teams" className="hover:text-signal-bright">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="hover:text-signal-bright">
                  Achievements
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-signal-bright">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-signal-bright">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-signal-bright">
                  About &amp; sponsors
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-copper/10 pt-6 font-mono text-xs text-paper-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            {site.name} — {site.location}
          </p>
          <p>Built with Next.js</p>
        </div>
      </div>
    </footer>
  );
}
