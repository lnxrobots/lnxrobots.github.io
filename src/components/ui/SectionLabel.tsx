export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-sm text-signal/80 mb-3">
      <span className="text-copper/60">// </span>
      {children}
    </p>
  );
}
