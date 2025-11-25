import { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "core-systems",
    title: "Core Systems",
    type: "Infrastructure",
    description: "High-performance rust bindings.",
    longDescription:
      "Built a high-performance system using Rust and WebAssembly for critical infrastructure operations. Achieved 10x performance improvement over previous implementation.",
    technologies: ["Rust", "TypeScript", "WebAssembly"],
    featured: true,
    year: 2024,
  },

  {
    id: "neural-viz",
    title: "Neural Viz",
    type: "Research",
    description: "Data visualization for ML models.",
    longDescription:
      "Interactive visualization tool for machine learning models. Enables researchers to understand and debug neural networks through real-time visual feedback.",
    technologies: ["Python", "React", "D3.js", "TensorFlow"],
    featured: true,
    year: 2023,
  },
  {
    id: "xeind-art",
    title: "Xeind Art",
    type: "Creative",
    description: "Generative art collection.",
    longDescription:
      "Created a generative art system exploring mathematical patterns and creative algorithms. Each piece is unique and generated in real-time.",
    technologies: ["TypeScript", "Canvas API", "WebGL"],
    featured: false,
    year: 2023,
  },
  {
    id: "aneural-viz",
    title: "Neural Viz",
    type: "Research",
    description: "Data visualization for ML models.",
    longDescription:
      "Interactive visualization tool for machine learning models. Enables researchers to understand and debug neural networks through real-time visual feedback.",
    technologies: ["Python", "React", "D3.js", "TensorFlow"],
    featured: true,
    year: 2023,
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
