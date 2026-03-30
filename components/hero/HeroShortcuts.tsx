"use client";

import { useEffect } from "react";
import { personalInfo } from "@/lib/data";
import { useClickSound } from "@/lib/hooks";

export default function HeroShortcuts() {
  const { clickLow } = useClickSound();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "v") {
        clickLow();
        window.open(personalInfo.cvUrl, "_blank");
      } else if (key === "c") {
        clickLow();
        window.open(
          personalInfo.calComUrl || "https://cal.com/xeind",
          "_blank"
        );
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [clickLow]);

  return null;
}
