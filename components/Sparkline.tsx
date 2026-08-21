interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

/** Minimal inline SVG line chart — no charting library needed for a handful of points. */
export default function Sparkline({ points, width = 96, height = 32, positive = true }: SparklineProps) {
  if (points.length < 2) {
    return <svg width={width} height={height} />;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={d} stroke={positive ? "#22c55e" : "#ef4444"} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
