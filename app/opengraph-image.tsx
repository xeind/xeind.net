import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Xein Deniel";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Grid pattern as SVG data URI - light gray lines on dark bg
const gridPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23555555' stroke-width='1'/%3E%3C/svg%3E")`;

// XD Logo SVG with #EEE fill
const xdLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7083.94 7553">
  <g fill="#EEEEEE">
    <polygon points="2195.38,3776.32 3297.59,2674.1 3297.4,0 1881.17,817.66 1881.17,1700.09 2533.38,1323.54 2533.38,2357.55 1114.63,3776.31 1114.62,3776.31 0,4890.93 0,5648.88 1394.13,6453.77 1394.13,5571.34 764.22,5207.47 2195.38,3776.32"/>
  </g>
  <g fill="#EEEEEE">
    <polygon points="2195.37,3776.32 2195.38,3776.32 764.21,2345.15 1394.12,1981.29 1394.12,1098.86 0,1903.75 0,2661.7 1114.62,3776.32 1114.61,3776.32 2533.38,5195.08 2533.38,6229.09 1881.16,5852.54 1881.16,6734.97 3297.39,7552.63 3297.59,4878.53 2195.37,3776.32"/>
  </g>
  <g fill="#EEEEEE">
    <polygon points="7083.94,1904.96 5689.01,1099.6 5689.01,1982.03 6319.7,2346.16 6319.7,3776.32 6319.7,5206.48 5689.01,5570.6 5689.01,6453.04 7083.94,5647.67 7083.91,3776.32 7083.94,1904.96"/>
    <polygon points="4549,1323.84 5201.96,1700.83 5201.96,818.4 3784.45,0 3784.45,2876.03 2883.98,3776.5 3784.45,4676.97 3784.45,7553 5201.96,6734.6 5201.96,5852.17 4549,6229.16 4549,4360.76 3964.74,3776.5 4549,3192.24 4549,1323.84"/>
  </g>
</svg>`;

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#353535",
        position: "relative",
      }}
    >
      {/* Grid Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: gridPattern,
          backgroundSize: "40px 40px",
          opacity: 0.6,
        }}
      />

      {/* Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(53,53,53,0.3) 0%, #353535 70%)",
        }}
      />

      {/* Logo Container with Dashed Border */}
      <div
        style={{
          width: 500,
          height: 500,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.2)",
          border: "3px dashed #888888",
        }}
      >
        {/* Inner Grid */}
        <div
          style={{
            position: "absolute",
            inset: 40,
            backgroundImage: gridPattern,
            backgroundSize: "40px 40px",
            opacity: 0.3,
          }}
        />

        {/* XD Logo */}
        <div
          style={{
            width: 350,
            height: 350,
            position: "relative",
            zIndex: 10,
          }}
          dangerouslySetInnerHTML={{ __html: xdLogoSvg }}
        />
      </div>
    </div>,
    {
      ...size,
    }
  );
}
