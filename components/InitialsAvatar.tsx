const PALETTE = [
  "bg-brand/20 text-brand-bright border-brand/40",
  "bg-blue-500/20 text-blue-300 border-blue-400/40",
  "bg-purple-500/20 text-purple-300 border-purple-400/40",
  "bg-amber-500/20 text-amber-300 border-amber-400/40",
  "bg-pink-500/20 text-pink-300 border-pink-400/40",
  "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
];

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface InitialsAvatarProps {
  name: string;
  size?: number;
  online?: boolean;
  className?: string;
}

export default function InitialsAvatar({ name, size = 36, online, className = "" }: InitialsAvatarProps) {
  return (
    <div className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      <div
        className={`flex h-full w-full items-center justify-center rounded-full border font-semibold ${colorFor(name)}`}
        style={{ fontSize: Math.max(10, size * 0.38) }}
      >
        {initialsFor(name)}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-black bg-brand"
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      )}
    </div>
  );
}
