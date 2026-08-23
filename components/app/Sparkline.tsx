export function Sparkline({
  points,
  up = true,
  width = 110,
  height = 34,
}: {
  points: number[];
  up?: boolean;
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return <svg width={width} height={height} aria-hidden="true" />;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / span) * (height - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke={up ? "var(--up)" : "var(--down)"}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 5px ${up ? "var(--up)" : "var(--down)"})` }}
      />
    </svg>
  );
}
