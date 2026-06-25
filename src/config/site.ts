export const SITE = {
  name: "Xein Deniel",
  shortName: "XD",
  url: "https://xeind.net",
  locale: "en_US",
  language: "en",
  description:
    "Full-stack engineer specializing in high-performance interfaces, thoughtful motion, and polished web experiences.",
  email: "xd@xeind.net",
  location: "Philippines",
  jobTitle: "Full-Stack Engineer",
  socialImage: "/opengraph.jpg",
  twitterHandle: "@xeinvi",
  profiles: [
    "https://github.com/xeind",
    "https://twitter.com/xeinvi",
    "https://linkedin.com/in/xeind",
  ],
} as const;

export function absoluteUrl(path = "/") {
  const url = new URL(path, SITE.url);
  const isDocumentPath =
    url.origin === SITE.url &&
    !url.pathname.endsWith("/") &&
    !url.pathname.split("/").at(-1)?.includes(".");

  if (isDocumentPath) {
    url.pathname += "/";
  }

  return url.toString();
}
