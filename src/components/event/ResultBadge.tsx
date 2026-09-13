import { Result } from "@/data/types";
import { tierColor } from "@/lib/utils";

export function ResultBadge({ result }: { result: Result }) {
  return (
    <span
      className={`inline-block border px-2.5 py-1 font-mono text-xs ${tierColor(result.tier)}`}
    >
      {result.label}
    </span>
  );
}
