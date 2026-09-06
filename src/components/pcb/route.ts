export type Point = [number, number];

/**
 * Builds an SVG path `d` string from orthogonal waypoints, cutting a 45°
 * chamfer at every interior corner — the way copper traces are routed on a
 * real PCB instead of sharp right angles.
 */
export function route(points: Point[], chamfer = 14): string {
  if (points.length < 2) return "";
  const segments: string[] = [];
  const first = points[0];
  segments.push(`M ${first[0]} ${first[1]}`);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    if (!next) {
      segments.push(`L ${curr[0]} ${curr[1]}`);
      continue;
    }

    const dx1 = Math.sign(curr[0] - prev[0]);
    const dy1 = Math.sign(curr[1] - prev[1]);
    const dx2 = Math.sign(next[0] - curr[0]);
    const dy2 = Math.sign(next[1] - curr[1]);

    const cutIn: Point = [curr[0] - dx1 * chamfer, curr[1] - dy1 * chamfer];
    const cutOut: Point = [curr[0] + dx2 * chamfer, curr[1] + dy2 * chamfer];

    segments.push(`L ${cutIn[0]} ${cutIn[1]}`);
    segments.push(`L ${cutOut[0]} ${cutOut[1]}`);
  }

  return segments.join(" ");
}

/** Returns just the corner points of a route (for placing vias at bends). */
export function corners(points: Point[]): Point[] {
  return points.slice(1, -1);
}

export function endpoints(points: Point[]): Point[] {
  return [points[0], points[points.length - 1]];
}
