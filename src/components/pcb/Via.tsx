interface ViaProps {
  cx: number;
  cy: number;
  r?: number;
  glow?: boolean;
  className?: string;
}

/** A single plated through-hole via: an outer copper ring around a drilled center. */
export function Via({ cx, cy, r = 5, glow = false, className }: ViaProps) {
  return (
    <g className={className}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={glow ? undefined : 0.9}
        className={glow ? "animate-via-glow" : undefined}
      />
      <circle cx={cx} cy={cy} r={r * 0.32} fill="currentColor" opacity={0.9} />
    </g>
  );
}
