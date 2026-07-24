import fmeetDark from "@/assets/projects/fmeet-seo-dark.svg";
import fmeetLight from "@/assets/projects/fmeet-seo-light.svg";
import fmeetNightingale from "@/assets/projects/fmeet-seo-nightingale.svg";
import smeetDark from "@/assets/projects/smeet-seo-dark.svg";
import smeetLight from "@/assets/projects/smeet-seo-light.svg";
import smeetNightingale from "@/assets/projects/smeet-seo-nightingale.svg";
import nightingaleDark from "@/assets/projects/nightingale-dark.svg";
import nightingaleLight from "@/assets/projects/nightingale-light.svg";
import nightingaleNightingale from "@/assets/projects/nightingale-nightingale.svg";

/**
 * Themed project-logo URLs, resolved through the asset pipeline so the
 * files get content-hashed /_astro/ paths (immutable 1-year cache) instead
 * of fixed /projects/ URLs capped at 7 days. Keys match
 * EXTERNAL_LOGOS[].file in ProjectLogo.tsx.
 */
export const PROJECT_LOGO_URLS = {
  "fmeet-seo": {
    light: fmeetLight.src,
    dark: fmeetDark.src,
    nightingale: fmeetNightingale.src,
  },
  "smeet-seo": {
    light: smeetLight.src,
    dark: smeetDark.src,
    nightingale: smeetNightingale.src,
  },
  nightingale: {
    light: nightingaleLight.src,
    dark: nightingaleDark.src,
    nightingale: nightingaleNightingale.src,
  },
} as const;

export type ProjectLogoFile = keyof typeof PROJECT_LOGO_URLS;
