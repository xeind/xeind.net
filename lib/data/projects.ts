import { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "nightingale-zed",
    title: "Nightingale for Zed",
    type: "Theme",
    description: "Warm contrast theme for Zed editor",
    longDescription: [
      "Nightingale and Lightingale themes for the Zed editor",
      "Comfortable warm contrast designed for long coding sessions",
    ],
    technologies: ["Zed", "JSON"],
    liveUrl: "https://zed.dev/extensions/nightingale",
    githubUrl: "https://github.com/xeind/nightingale-zed",
    featured: true,
    year: 2025,
    imageUrl: "/projects/nightingale-zed.svg",
  },
  {
    id: "nightingale-nvim",
    title: "nightingale.nvim",
    type: "Theme",
    description: "Neovim color scheme",
    longDescription: ["Dark and light variants with full TreeSitter support"],
    technologies: ["Lua", "Neovim", "TreeSitter"],
    githubUrl: "https://github.com/xeind/nightingale.nvim",
    featured: true,
    year: 2025,
    imageUrl: "/projects/nightingale-nvim.svg",
  },
  {
    id: "atax",
    title: "ATAX",
    type: "Tool",
    description: "Image encryption and decryption tool",
    longDescription: [
      "Chaotic-map encryption scheme achieving high diffusion, randomness, and strong security",
      "Validated with Entropy 7.9982, UACI 33.46%, NPCR 99.61%, Correlation -0.0008, and 21ms runtime",
    ],
    technologies: ["TypeScript", "Python", "React", "Docker"],
    liveUrl: "https://atax.dev",
    featured: true,
    year: 2024,
    imageUrl: "/projects/atax.svg",
  },

  {
    id: "slavicmeet",
    title: "slavicmeet",
    type: "Work",
    description: "Dating site",
    technologies: ["React", "TypeScript"],
    liveUrl: "https://slavicmeet.app",
    featured: true,
    year: 2026,
    imageUrl: "/projects/smeet-seo.svg",
    iconSize: "compact",
  },
  {
    id: "filipinameet",
    title: "filipinameet",
    type: "Work",
    description: "Dating site",
    technologies: ["React", "TypeScript"],
    liveUrl: "https://filipinameet.com",
    featured: true,
    year: 2026,
    imageUrl: "/projects/fmeet-seo.svg",
  },
  {
    id: "pioneerdev-ai",
    title: "Pioneer Dev",
    type: "Work",
    description: "Our company making AI solutions",
    technologies: ["React", "TypeScript", "Motion"],
    liveUrl: "https://pioneerdev.ai",
    featured: true,
    year: 2026,
    imageUrl: "/projects/pioneer.svg",
  },
];

// Helper functions
export const getFeaturedProjects = () => {
  return projects.filter((p) => p.featured);
};

export const getProjectsByType = (type: string) => {
  return projects.filter((p) => p.type === type);
};

export const getProjectById = (id: string) => {
  return projects.find((p) => p.id === id);
};

export const getProjectsByYear = (year: number) => {
  return projects.filter((p) => p.year === year);
};
