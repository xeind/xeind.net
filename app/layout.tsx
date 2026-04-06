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
        url: "/opengraph-img.jpg",
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
    images: ["/opengraph-img.jpg"],
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
        {/* Preload primary UI fonts BEFORE inline CSS so browser reuses them */}
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
          media="(min-width: 768px)"
        />
        <link
          rel="preload"
          href="/fonts/CommitMono-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          media="(min-width: 768px)"
        />

        {/* Inline critical CSS to prevent render blocking */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face{font-family:Latin Modern Roman;src:url(/fonts/LatinModernRoman-Regular.woff2)format("woff2");font-weight:400;font-style:normal;font-display:optional}
              @font-face{font-family:Latin Modern Roman;src:url(/fonts/LatinModernRoman-Bold.woff2)format("woff2");font-weight:700;font-style:normal;font-display:optional}
              @font-face{font-family:Inter;src:url(/fonts/Inter-Regular.woff2)format("woff2");font-weight:400;font-style:normal;font-display:optional}
              @font-face{font-family:Inter;src:url(/fonts/Inter-Bold.woff2)format("woff2");font-weight:700;font-style:normal;font-display:optional}
              @font-face{font-family:Commit Mono;src:url(/fonts/CommitMono-Regular.woff2)format("woff2");font-weight:400;font-style:normal;font-display:optional}
              @font-face{font-family:Commit Mono;src:url(/fonts/CommitMono-Bold.woff2)format("woff2");font-weight:700;font-style:normal;font-display:optional}
              :root{--color-background:hsl(0 0% 100%);--color-foreground:hsl(0 0% 0%);--color-card:hsl(0 0% 100%);--color-border:hsl(0 0% 85%);--color-muted:hsl(0 0% 96%);--color-accent:hsl(0 0% 20%);--color-accent-hover:hsl(0 0% 10%);--color-destructive:hsl(0 0% 40%);--color-success:hsl(0 0% 30%);--color-primary:hsl(0 0% 20%);--color-primary-hover:hsl(0 0% 10%);--color-secondary:hsl(0 0% 35%);--color-secondary-hover:hsl(0 0% 25%);--color-tertiary:hsl(0 0% 10%);--color-tertiary-hover:hsl(0 0% 20%);--color-info:hsl(0 0% 45%);--color-warning:hsl(0 0% 40%);--font-family-sans:"Inter",system-ui,sans-serif;--font-family-mono:"Commit Mono",Menlo,Monaco,monospace;--footer-height:128px}
              [data-theme=dark]{--color-background:hsl(0 0% 10%);--color-foreground:hsl(0 0% 100%);--color-card:hsl(0 0% 16%);--color-border:hsl(0 0% 30%);--color-muted:hsl(0 0% 15%);--color-accent:hsl(0 0% 85%);--color-accent-hover:hsl(0 0% 95%);--color-destructive:hsl(0 0% 50%);--color-success:hsl(0 0% 60%);--color-primary:hsl(0 0% 85%);--color-primary-hover:hsl(0 0% 95%);--color-secondary:hsl(0 0% 70%);--color-secondary-hover:hsl(0 0% 80%);--color-tertiary:hsl(0 0% 100%);--color-tertiary-hover:hsl(0 0% 90%);--color-info:hsl(0 0% 70%);--color-warning:hsl(0 0% 60%)}
              [data-theme=nightingale]{--color-background:hsl(0 0% 12.5%);--color-foreground:hsl(42 27% 80%);--color-card:hsl(0 0% 15.6%);--color-border:hsl(0 0% 21.5%);--color-muted:hsl(0 0% 9.4%);--color-accent:hsl(86 36% 57%);--color-accent-hover:hsl(86 36% 67%);--color-destructive:hsl(3 96% 65%);--color-success:hsl(86 36% 57%);--color-primary:hsl(86 36% 57%);--color-primary-hover:hsl(86 36% 67%);--color-secondary:hsl(17 87% 75%);--color-secondary-hover:hsl(17 87% 85%);--color-tertiary:hsl(43 74% 72%);--color-tertiary-hover:hsl(43 74% 82%);--color-info:hsl(214 45% 69%);--color-warning:hsl(32 86% 65%)}
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
        {/* Meta description for search engines / Lighthouse */}
        <meta name="description" content={metadata.description ?? undefined} />

        {/* Preload grain texture on desktop only — CSS background, not needed in mobile critical path */}
        <link
          rel="preload"
          href="/grain-texture.webp"
          as="image"
          media="(min-width: 768px)"
        />

        {/* Structured data for SEO */}
        <StructuredData />

        <Script id="hero-interactions" strategy="afterInteractive">
          {`(() => {
            if (!window.matchMedia('(pointer: fine)').matches) return;

            let ctx = null;
            let primed = false;

            const getCtx = () => {
              if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
              return ctx;
            };

            const prime = async () => {
              if (primed) return;
              const audio = getCtx();
              if (audio.state === 'suspended') await audio.resume();
              const buffer = audio.createBuffer(1, 1, audio.sampleRate);
              const source = audio.createBufferSource();
              const gain = audio.createGain();
              source.buffer = buffer;
              gain.gain.value = 0.0001;
              source.connect(gain);
              gain.connect(audio.destination);
              source.start(audio.currentTime);
              primed = true;
            };

            const playClickSoft = () => {
              const audio = getCtx();
              if (audio.state === 'suspended') void audio.resume();
              const noise = audio.createBufferSource();
              const buf = audio.createBuffer(1, audio.sampleRate * 0.012, audio.sampleRate);
              const data = buf.getChannelData(0);
              for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 80);
              noise.buffer = buf;
              const filter = audio.createBiquadFilter();
              filter.type = 'bandpass';
              filter.frequency.value = 3000 + Math.random() * 400;
              filter.Q.value = 2;
              const gain = audio.createGain();
              gain.gain.value = 0.12 + Math.random() * 0.03;
              noise.connect(filter);
              filter.connect(gain);
              gain.connect(audio.destination);
              noise.start(audio.currentTime);
            };

            const heroLinkSelector = '[data-hero-sfx="click"]';

            document.addEventListener('click', (event) => {
              const target = event.target instanceof Element ? event.target.closest(heroLinkSelector) : null;
              if (!target) return;
              void prime();
              playClickSoft();
            }, { passive: true });

            window.addEventListener('keydown', (event) => {
              if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
              if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;

              const key = event.key.toLowerCase();
              if (key !== 'v' && key !== 'c') return;

              const link = document.querySelector('[data-hero-shortcut="' + key + '"]');
              if (!(link instanceof HTMLAnchorElement)) return;

              event.preventDefault();
              void prime();
              playClickSoft();
              window.open(link.href, link.target || '_blank', 'noopener,noreferrer');
            });
          })();`}
        </Script>
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
