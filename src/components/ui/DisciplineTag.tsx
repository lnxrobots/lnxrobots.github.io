import { getDiscipline } from "@/data/disciplines";

export function DisciplineTag({ slug }: { slug: string | string[] }) {
  return (
    <>
      {(Array.isArray(slug) ? slug : [slug]).map((s, i) => {
        const d = getDiscipline(s);
        return (
          <span
            className="border border-copper/30 px-2 py-0.5 font-mono text-[10px] tracking-wide text-copper-bright/90"
            key={i}
          >
            {d ? d.shortName : s}
          </span>
        );
      })}
    </>
  );
}
