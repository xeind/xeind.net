import { ImageResponse } from "next/og";
import { personalInfo } from "@/lib/data";

export const runtime = "edge";
export const alt = "Xein Deniel - Creative Developer Portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        {/* Background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background: "#f5f5f5",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#000000",
              letterSpacing: "-0.05em",
            }}
          >
            {personalInfo.name}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 32,
              color: "#333333",
              maxWidth: "800px",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {personalInfo.tagline}
          </div>

          {/* Domain */}
          <div
            style={{
              fontSize: 24,
              color: "#666666",
              fontFamily: "monospace",
              marginTop: "16px",
            }}
          >
            xeind.net
          </div>
        </div>

        {/* Border accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "#333333",
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
