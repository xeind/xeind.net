import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import CornerDiamond from "@/components/ui/CornerDiamond";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  metadataBase: new URL("https://xeind.net"),
  title: {
    default: "Xein Deniel",
    template: "%s | Xein Deniel",
  },
  description:
    "Full-stack developer specializing in high-performance web applications with expertise in TypeScript, React, and Rust. Building digital systems with precision and clarity.",
  keywords: [
    "Xein Deniel",
    "Full-stack developer",
    "Web developer Philippines",
    "TypeScript developer",
    "React developer",
    "Rust developer",
    "Next.js developer",
    "Portfolio",
    "Software engineer",
  ],
  authors: [{ name: "Xein Deniel", url: "https://xeind.net" }],
  creator: "Xein Deniel",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://xeind.net",
    title: "Xein Deniel - Creative Developer",
    description:
      "Full-stack developer specializing in high-performance web applications. Building digital systems with precision and clarity.",
    siteName: "Xein Deniel Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Xein Deniel - Creative Developer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xein Deniel - Creative Developer",
    description:
      "Full-stack developer specializing in high-performance web applications with expertise in TypeScript, React, and Rust.",
    creator: "@xeinvi",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://xeind.net",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline critical CSS to prevent render blocking */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face{font-family:Latin Modern Roman;src:url(/fonts/LatinModernRoman-Regular.woff2)format("woff2");font-weight:400;font-style:normal;font-display:swap}
              @font-face{font-family:Latin Modern Roman;src:url(/fonts/LatinModernRoman-Bold.woff2)format("woff2");font-weight:700;font-style:normal;font-display:swap}
              @font-face{font-family:Inter;src:url(/fonts/Inter-Regular.woff2)format("woff2");font-weight:400;font-style:normal;font-display:swap}
              @font-face{font-family:Inter;src:url(/fonts/Inter-Bold.woff2)format("woff2");font-weight:700;font-style:normal;font-display:swap}
              @font-face{font-family:Commit Mono;src:url(/fonts/CommitMono-Regular.woff2)format("woff2");font-weight:400;font-style:normal;font-display:swap}
              @font-face{font-family:Commit Mono;src:url(/fonts/CommitMono-Bold.woff2)format("woff2");font-weight:700;font-style:normal;font-display:swap}
              :root{--color-background:#fff;--color-foreground:#000;--color-card:#fff;--color-border:#d9d9d9;--color-muted:#f5f5f5;--color-accent:#333;--font-family-sans:"Inter",system-ui,sans-serif;--font-family-mono:"Commit Mono",Menlo,Monaco,monospace;--footer-height:128px}
              [data-theme=dark]{--color-background:#1a1a1a;--color-foreground:#fff;--color-card:#292929;--color-border:#4d4d4d;--color-muted:#262626;--color-accent:#d9d9d9}
              html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;box-sizing:border-box}
              *,:before,:after{box-sizing:inherit}
              body{min-height:100vh;background-color:var(--color-muted);color:var(--color-foreground);font-family:var(--font-family-sans)}
            `,
          }}
        />
        {/* Theme script - must run before body renders to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'system';
                  if (theme === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      document.documentElement.setAttribute('data-theme', 'dark');
                    }
                  } else if (theme !== 'light') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Preload the primary UI font to speed up FCP/LCP */}
        <link
          rel="preload"
          href="/fonts/Inter-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preload only Inter (primary UI font). Latin Modern is used for headings but
            is not critical for first paint; keep as non-preloaded to reduce blocking. */}
        {/* Commit Mono is only used for meta/code UI; avoid preloading to reduce critical fetches */}
        {/* Preload LCP image - grain texture in footer */}
        <link
          rel="preload"
          href="/grain-texture.webp"
          as="image"
          fetchPriority="high"
        />
        {/* Structured data for SEO */}
        <StructuredData />
      </head>
      <body className="font-sans antialiased">
        <div className="paper-background min-h-dvh" tabIndex={-1}>
          <div className="relative mx-auto max-w-5xl">
            <main className="bg-card border-accent/20 before:bg-accent/20 after:bg-accent/20 relative z-10 mb-(--footer-height) min-h-screen border-x before:absolute before:top-0 before:right-[-100vw] before:left-[-100vw] before:h-px before:content-[''] after:absolute after:right-[-100vw] after:bottom-0 after:left-[-100vw] after:h-px after:content-['']">
              <CornerDiamond position="all" variant="accent" />
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
