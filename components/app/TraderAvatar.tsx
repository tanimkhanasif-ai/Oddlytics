const AVATAR_FILES = [
  "/avatars/avatar-1.avif",
  "/avatars/avatar-2.avif",
  "/avatars/avatar-3.webp",
  "/avatars/avatar-4.avif",
  "/avatars/avatar-5.jpg",
  "/avatars/avatar-6.webp",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * A trader's avatar photo, deterministically picked from a fixed pool by
 * `seed` (their wallet address) — the same trader always gets the same
 * photo, but which one is otherwise arbitrary. Replaces the old
 * initials-in-a-colored-circle placeholder.
 */
export default function TraderAvatar({ seed, className }: { seed: string; className?: string }) {
  const src = AVATAR_FILES[hashString(seed) % AVATAR_FILES.length];
  return <img src={src} alt="" className={className} loading="lazy" />;
}
