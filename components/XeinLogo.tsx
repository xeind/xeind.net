import { memo } from "react";

interface XeinLogoProps {
  className?: string;
  size?: number;
}

function XeinLogoComponent({ className = "", size = 48 }: XeinLogoProps) {
  return (
    <svg
      viewBox="0 0 7084 7553"
      width={size}
      height={size}
      className={className}
      aria-label="Xein Logo"
      role="img"
      focusable="false"
    >
      {/* Top-left quadrant - Accent color full opacity */}
      <g>
        <polygon
          className="fill-accent-hover"
          points="2195 3776 2195 3776 764 2345 1394 1981 1394 1099 0 1904 0 2662 1115 3776 1115 3776 2533 5195 2533 6229 1881 5853 1881 6735 3297 7553 3298 4879 2195 3776"
        />
        <polygon
          className="fill-accent"
          points="2195 3776 3298 2674 3297 0 1881 818 1881 1700 2533 1324 2533 2358 1115 3776 1115 3776 0 4891 0 5649 1394 6454 1394 5571 764 5207 2195 3776 2195 3776"
        />
      </g>
      {/* Bottom-left quadrant - Accent color 70% opacity */}
      {/* Right side - split into two parts */}
      <g>
        {/* Top-right quadrant - Accent color 85% opacity */}
        <polygon
          className="fill-accent"
          points="7084 1905 5689 1100 5689 1982 6320 2346 6320 3776 6320 5206 5689 5571 5689 6453 7084 5648 7084 3776 7084 1905"
        />
        {/* Bottom-right quadrant - Accent color 55% opacity */}
        <polygon
          className="fill-accent"
          points="4549 1324 5202 1701 5202 818 3784 0 3784 2876 2884 3777 3784 4677 3784 7553 5202 6735 5202 5852 4549 6229 4549 4361 3965 3777 4549 3192 4549 1324"
        />
      </g>
    </svg>
  );
}

const XeinLogo = memo(XeinLogoComponent);
XeinLogo.displayName = "XeinLogo";

export default XeinLogo;
