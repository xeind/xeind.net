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
  longDescription?: string;
  technologies: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  year?: number;
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

// Site Configuration
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  author: PersonalInfo;
}
