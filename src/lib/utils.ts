export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    ...opts,
  });
}

export function formatDateRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: sameMonth ? undefined : "long",
  });
  const endStr = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export function tierColor(tier: string) {
  switch (tier) {
    case "gold":
      return "text-result-gold border-result-gold/40";
    case "silver":
      return "text-result-silver border-result-silver/40";
    case "bronze":
      return "text-result-bronze border-result-bronze/40";
    case "special":
      return "text-signal-bright border-signal/40";
    default:
      return "text-paper-muted border-paper-muted/30";
  }
}
