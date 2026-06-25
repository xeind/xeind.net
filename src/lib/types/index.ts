// Personal Information
export interface PersonalInfo {
  name: string;
  location: string;
  tagline: string;
  bio: string;
  email: string;
  cvUrl: string;
  calComUrl: string;
}

// Skills/Tech Stack
export interface Skill {
  name: string;
  category: "language" | "framework" | "tool" | "database";
  proficiency?: "beginner" | "intermediate" | "advanced" | "expert";
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

// Social Links
export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string; // Lucide icon name
  label: string;
}

// Blog Post
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
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

// Site Configuration
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  author: PersonalInfo;
}
