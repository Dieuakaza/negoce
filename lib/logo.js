import { ImageResponse } from "next/og";

// Dessin du logo : un « N » blanc sur fond vert
function Logo({ px }) {
  return (
    <div
      style={{
        width: px,
        height: px,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #10b981, #047857)",
      }}
    >
      <svg width={px * 0.72} height={px * 0.72} viewBox="0 0 100 100">
        <path d="M26 78 V22 H38 L62 58 V22 H74 V78 H62 L38 42 V78 Z" fill="white" />
      </svg>
    </div>
  );
}

export function imageIcone(px) {
  return new ImageResponse(<Logo px={px} />, { width: px, height: px });
}
