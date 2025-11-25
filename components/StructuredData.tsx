import { personalInfo, socialLinks } from "@/lib/data";

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: personalInfo.name,
    url: "https://xeind.net",
    email: personalInfo.email,
    jobTitle: "Full-Stack Developer",
    description: personalInfo.bio,
    address: {
      "@type": "PostalAddress",
      addressCountry: "PH",
      addressLocality: personalInfo.location,
    },
    sameAs: socialLinks.map((link) => link.url),
    knowsAbout: [
      "Web Development",
      "TypeScript",
      "React",
      "Next.js",
      "Rust",
      "System Design",
      "Performance Optimization",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
