import { Via } from "./Via";
import { route, corners, endpoints, Point } from "./route";

interface CircuitBackgroundProps {
  /** Show one or two animated "live signal" pulses travelling along traces. */
  withPulse?: boolean;
  className?: string;
}

const traceSets: Point[][] = [
  [
    [-40, 120],
    [220, 120],
    [220, 260],
    [420, 260],
    [420, 60],
    [720, 60],
  ],
  [
    [-40, 340],
    [140, 340],
    [140, 460],
    [520, 460],
    [520, 620],
    [900, 620],
    [900, 520],
    [1180, 520],
  ],
  [
    [1480, 160],
    [1220, 160],
    [1220, 40],
    [980, 40],
  ],
  [
    [1480, 400],
    [1300, 400],
    [1300, 300],
    [1020, 300],
    [1020, 380],
    [760, 380],
  ],
  [
    [1480, 700],
    [1160, 700],
    [1160, 800],
    [780, 800],
  ],
  [
    [-40, 700],
    [300, 700],
    [300, 780],
    [560, 780],
  ],
];

/** Two of the above traces get a travelling pulse — chosen for a clean run length. */
const pulseIndices = [1, 3];

export function CircuitBackground({ withPulse = false, className }: CircuitBackgroundProps) {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <g className="text-copper" strokeLinecap="round" strokeLinejoin="round">
        {traceSets.map((pts, i) => (
          <path
            key={i}
            d={route(pts)}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.22}
          />
        ))}
        {withPulse &&
          pulseIndices.map((idx) => (
            <path
              key={`pulse-${idx}`}
              d={route(traceSets[idx])}
              fill="none"
              stroke="currentColor"
              className="text-signal animate-pulse-dash"
              strokeWidth={2}
              strokeDasharray="10 230"
              opacity={0.85}
            />
          ))}
      </g>
      <g className="text-copper">
        {traceSets.flatMap((pts, i) =>
          [...corners(pts), ...endpoints(pts)].map((pt, j) => (
            <Via key={`${i}-${j}`} cx={pt[0]} cy={pt[1]} r={4} className="opacity-30" />
          ))
        )}
      </g>
    </svg>
  );
}
