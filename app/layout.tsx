import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/layout/LazyFooter";
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
      "Full-stack engineer who sweats the details – pixel-perfect UI, smooth motion, and clean architecture.",
    siteName: "Xein Deniel",
    images: [
      {
        url: "/opengraph.jpg",
        width: 1200,
        height: 630,
        alt: "Xein Deniel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xein Deniel - Creative Developer",
    description:
      "Full-stack developer specializing in high-performance web applications with expertise in TypeScript, React, and Rust.",
    creator: "@xeinvi",
    images: ["/opengraph.jpg"],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme script - must run before critical CSS to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var d=document.documentElement,t=localStorage.getItem('theme')||'system';
                  if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
                  if(t==='dark'){d.setAttribute('data-theme','dark');d.style.backgroundColor='#262626'}
                  else if(t==='nightingale'){d.setAttribute('data-theme','nightingale');d.style.backgroundColor='#181818'}
                  else{d.removeAttribute('data-theme');d.style.backgroundColor='#f5f5f5'}
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Preload primary fonts so browser starts downloading before parsing CSS */}
        <link
          rel="preload"
          href="/fonts/Inter-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Inter-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Font-face declarations (not in globals.css, must be inline) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `@font-face{font-family:Latin Modern Roman;src:url(/fonts/LatinModernRoman-Regular.woff2)format("woff2");font-weight:400;font-style:normal;font-display:optional}@font-face{font-family:Latin Modern Roman;src:url(/fonts/LatinModernRoman-Bold.woff2)format("woff2");font-weight:700;font-style:normal;font-display:optional}@font-face{font-family:Inter;src:url(/fonts/Inter-Regular.woff2)format("woff2");font-weight:400;font-style:normal;font-display:optional}@font-face{font-family:Inter;src:url(/fonts/Inter-Bold.woff2)format("woff2");font-weight:700;font-style:normal;font-display:optional}@font-face{font-family:Commit Mono;src:url(/fonts/CommitMono-Regular.woff2)format("woff2");font-weight:400;font-style:normal;font-display:optional}@font-face{font-family:Commit Mono;src:url(/fonts/CommitMono-Bold.woff2)format("woff2");font-weight:700;font-style:normal;font-display:optional}`,
          }}
        />
        {/* Meta description for search engines / Lighthouse */}
        <meta name="description" content={metadata.description ?? undefined} />

        {/* Structured data for SEO */}
        <StructuredData />

        <Script
          id="hero-interactions"
          src="/hero-interactions.js"
          strategy="lazyOnload"
        />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased">
        <div
          className="paper-background min-h-dvh overflow-x-clip"
          tabIndex={-1}
        >
          <div className="relative mx-auto max-w-5xl">
            <main className="bg-card border-accent/20 before:bg-accent/20 after:bg-accent/20 relative z-10 mb-(--footer-height) min-h-screen border-x before:absolute before:top-0 before:right-[-9999px] before:left-[-9999px] before:h-px before:content-[''] after:absolute after:right-[-9999px] after:bottom-0 after:left-[-9999px] after:h-px after:content-['']">
              <CornerDiamond position="all" variant="accent" />
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
