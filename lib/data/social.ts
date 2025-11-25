import { SocialLink } from "@/lib/types";

export const socialLinks: SocialLink[] = [
  {
    id: "github",
    platform: "GitHub",
    url: "https://github.com/xeind",
    icon: "Github",
    label: "View my code on GitHub",
  },
  {
    id: "twitter",
    platform: "Twitter",
    url: "https://twitter.com/xeinvi",
    icon: "Twitter",
    label: "Follow me on Twitter",
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    url: "https://linkedin.com/in/xeind",
    icon: "Linkedin",
    label: "Connect on LinkedIn",
  },
];

// Helper function
export const getSocialLinkByPlatform = (platform: string) => {
  return socialLinks.find(
    (link) => link.platform.toLowerCase() === platform.toLowerCase(),
  );
};
