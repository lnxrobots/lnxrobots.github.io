import { getDiscipline } from "@/data/disciplines";

export function DisciplineTag({ slug }: { slug: string }) {
  const d = getDiscipline(slug);
  return (
    <span className="border border-copper/30 px-2 py-0.5 font-mono text-[10px] tracking-wide text-copper-bright/90">
      {d ? d.shortName : slug}
    </span>
  );
}
