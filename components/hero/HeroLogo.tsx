"use client";

import { useEffect, useState } from "react";
import XeinLogo from "../XeinLogoClient";

interface HeroLogoProps {
  size?: number;
  className?: string;
}

type StableLogoComponent = React.ComponentType<HeroLogoProps>;

export default function HeroLogo({ size = 64, className = "" }: HeroLogoProps) {
  const [StableLogo, setStableLogo] = useState<StableLogoComponent | null>(
    null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    let cancelled = false;

    void import("./StableLogo").then((module) => {
      if (!cancelled) {
        setStableLogo(() => module.default);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (StableLogo) {
    return <StableLogo size={size} className={className} />;
  }

  return (
    <div
      className={`m-0 inline-flex items-center justify-center p-0 align-middle leading-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <XeinLogo size={size} />
    </div>
  );
}
