import { ImageResponse } from "next/og"

export const alt = "Captions Recorder for Google Meet"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f7fb",
          padding: "72px",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 22,
              background: "linear-gradient(135deg, #1A73E8, #0D9488)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            CC
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, color: "#0f766e", fontWeight: 700, letterSpacing: 2 }}>
              OFFICIAL SITE
            </div>
            <div style={{ fontSize: 56, color: "#0f172a", fontWeight: 800, lineHeight: 1.1 }}>
              Captions Recorder
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 40, color: "#0f172a", fontWeight: 700 }}>
            Record captions, people, and chat in your browser.
          </div>
          <div style={{ fontSize: 28, color: "#445266" }}>
            Preview captions, the room, and chat. Keep the mic muted. Nothing is uploaded.
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
