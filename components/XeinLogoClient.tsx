"use client";

import { memo } from "react";
import XeinLogoServer from "./XeinLogoServer";

interface XeinLogoProps {
  className?: string;
  size?: number;
}

const XeinLogo = memo(XeinLogoServer);
XeinLogo.displayName = "XeinLogo";

export default XeinLogo;
