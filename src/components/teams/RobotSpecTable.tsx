import { RobotSpec } from "@/data/types";

export function RobotSpecTable({ specs }: { specs: RobotSpec[] }) {
  if (specs.length === 0) {
    return (
      <p className="font-mono text-sm text-paper-faint">No spec sheet published yet.</p>
    );
  }

  return (
    <dl className="divide-y divide-copper/15 border border-copper/15">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[180px,1fr] sm:gap-4"
        >
          <dt className="font-mono text-xs text-copper/70">{spec.label}</dt>
          <dd className="font-body text-sm text-paper">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
