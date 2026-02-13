import { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "nightingale-zed",
    title: "Nightingale for Zed",
    type: "Theme",
    description: "Warm contrast theme for Zed editor.",
    longDescription:
      "Nightingale and Lightingale themes for the Zed editor, featuring comfortable warm contrast designed for long coding sessions. Over 5,000 downloads.",
    technologies: ["Zed", "JSON"],
    liveUrl: "https://zed.dev/extensions/nightingale",
    githubUrl: "https://github.com/xeind/nightingale-zed",
    featured: true,
    year: 2025,
  },
  {
    id: "nightingale-nvim",
    title: "nightingale.nvim",
    type: "Theme",
    description: "Neovim color scheme.",
    longDescription:
      "A Neovim color scheme ported from the Nightingale VS Code theme. Features dark and light variants, full TreeSitter support, 26+ LSP semantic token types, 27+ plugin integrations, and 540+ highlight groups. Optimized for minimal startup overhead.",
    technologies: ["Lua", "Neovim", "TreeSitter"],
    githubUrl: "https://github.com/xeind/nightingale.nvim",
    featured: true,
    year: 2025,
  },
  {
    id: "atax",
    title: "ATAX",
    type: "Tool",
    description: "Image encryption and decryption tool.",
    longDescription:
      "Built as an undergraduate thesis project. Engineered a chaotic-map encryption scheme achieving high diffusion, randomness, and strong security. Validated with Entropy 7.9982, UACI 33.46%, NPCR 99.61%, Correlation -0.0008, and 21ms runtime. Deployed via Docker on a self-hosted server.",
    technologies: ["TypeScript", "Python", "React", "Docker"],
    liveUrl: "https://atax.dev",
    featured: true,
    year: 2024,
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
