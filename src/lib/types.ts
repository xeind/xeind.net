import type { ImageMetadata } from "astro";

// Personal Information
export interface PersonalInfo {
  name: string;
  location: string;
  tagline: string;
  bio: string;
  email: string;
  cvUrl: string;
  calComUrl: string;
  githubUrl: string;
  linkedinUrl: string;
}

// Projects
export interface Project {
  id: string;
  title: string;
  type: string;
  description: string;
  longDescription?: string[];
  projectLinks?: Array<{
    label: string;
    url: string;
  }>;
  technologies: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  year?: number;
  iconSize?: "compact" | "normal" | "large";
}

// Awards & Certifications
export interface Award {
  id: string;
  title: string;
  issuer: string;
  type: string;
  description: string;
  stats?: Array<{
    key: string;
    value: string;
  }>;
  year?: number;
  url?: string;
  // Local logo: `import logo from "./logos/foo.png"` in awards.ts, then pass
  // the import here — Astro resolves it through astro:assets (optimized
  // format, real width/height). A plain string is also accepted for a
  // remote/hosted logo, which stays unoptimized.
  imageUrl?: string | ImageMetadata;
  iconSize?: "compact" | "normal" | "large";
}

// Experience
export interface Experience {
  id: string;
  company: string;
  companyUrl?: string;
  role: string;
  location: string;
  period: {
    start: string;
    end: string | "Present";
  };
  description: string;
  technologies?: string[];
}

// Tools
export interface Tool {
  name: string;
  description: string;
  url?: string;
}

export interface ToolCategory {
  label: string;
  tools: Tool[];
}
