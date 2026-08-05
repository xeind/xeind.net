import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "vallow",
    title: "vallow",
    type: "Personal",
    description: "Static analysis inside Neovim",
    longDescription: [
      "Brings static analysis into a native Neovim split: unused exports, dead code, circular dependencies, duplicate exports and complexity hotspots.",
      "Lua plugin over [fallow](https://docs.fallow.tools), a Rust analysis engine. No LSP, no tree-sitter, no config to get started.",
    ],
    technologies: ["Lua", "Rust", "Neovim"],
    liveUrl: "https://github.com/xeind/vallow.nvim",
    featured: true,
    year: 2026,
  },

  {
    id: "nightingale",
    title: "Nightingale",
    type: "Personal",
    description: "Theme for Zed and Neovim",
    longDescription: [
      "Warm contrast theme for Zed and Neovim.",
      "Dark and light variants with full TreeSitter support for Neovim.",
    ],
    projectLinks: [
      {
        label: "Install for Zed",
        url: "https://zed.dev/extensions/nightingale",
      },
      {
        label: "Neovim Theme",
        url: "https://github.com/xeind/nightingale.nvim",
      },
    ],
    technologies: ["Zed", "Neovim", "Lua", "TreeSitter"],
    featured: true,
    year: 2025,
    imageUrl: "/projects/nightingale.svg",
  },

  {
    id: "atax",
    title: "ATAX",
    type: "Personal",
    description: "Image encryption and decryption tool",
    longDescription: [
      "Chaotic-map encryption scheme achieving high diffusion, randomness, and strong security.",
      "Validated with Entropy 7.9982, UACI 33.46%, NPCR 99.61%, Correlation -0.0008, and 21ms runtime.",
    ],
    technologies: ["TypeScript", "Python", "React", "Docker"],
    liveUrl: "https://atax.dev",
    featured: true,
    year: 2024,
    imageUrl: "/projects/atax.svg",
  },

  {
    id: "pioneerdev-ai",
    title: "Pioneer Dev",
    type: "Client",
    description: "Landing page redesign, 98+ Lighthouse performance",
    longDescription: [
      "Redesigned the landing page end to end: new themes, a rebuilt stack, and a move to [Astro](https://astro.build).",
      "Lighthouse performance above 98.",
    ],
    technologies: ["Astro", "TypeScript"],
    liveUrl: "https://pioneerdev.ai",
    featured: true,
    year: 2026,
    imageUrl: "/projects/pioneer.svg",
  },

  {
    id: "yield",
    title: "Yield",
    type: "Client",
    description: "",
    // No link and nothing written up yet, so there is nothing for a modal to
    // show. Rendered as a plain plate until there is.
    interactive: false,
    technologies: ["React", "TypeScript", "Prisma"],
    liveUrl: "",
    featured: true,
    year: 2026,
    imageUrl: "/projects/yield.svg",
    iconSize: "compact",
  },

  {
    id: "filipinameet",
    title: "filipinameet",
    type: "Client",
    description: "Framer to Astro, 67 to 90 Lighthouse performance",
    longDescription: [
      "Moved the marketing site off Framer and onto Astro.",
      "Lighthouse performance score went from 67 to 90.",
    ],
    technologies: ["React", "TypeScript"],
    liveUrl: "https://filipinameet.com",
    featured: true,
    year: 2026,
    imageUrl: "/projects/fmeet-seo.svg",
  },

  {
    id: "slavicmeet",
    title: "slavicmeet",
    type: "Client",
    description: "Landing page, 85 Lighthouse performance",
    longDescription: [
      "Owned the landing page end to end.",
      "Holds a Lighthouse performance score of 85.",
    ],
    technologies: ["Astro", "Tailwind", "Cloudflare"],
    liveUrl: "https://slavicmeet.app",
    featured: true,
    year: 2026,
    imageUrl: "/projects/smeet-seo.svg",
    iconSize: "compact",
  },
];
