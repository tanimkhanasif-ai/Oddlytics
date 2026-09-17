import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// The site had no favicon at all, so browsers/search results were showing a
// broken/blank placeholder instead of a logo. This recreates the same mark
// used in the app's own sidebar (a TrendingUp glyph on the brand-green
// rounded square) so the favicon actually matches the product's branding.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle, #0d1f14 0%, #050a07 100%)",
          borderRadius: 8,
          border: "2px solid #2FEB6A",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2FEB6A"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
