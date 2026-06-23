"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Palette, Check, Monitor } from "lucide-react";
import { ICON_CONFIG } from "@/lib/config/design";
import { useClickSound } from "@/lib/hooks";
import { CSS_TRANSITIONS } from "@/lib/config/animation";

const themes = [
  {
    value: "system",
    label: "System",
    colors: ["#333333", "#595959", "#7A7A7A"],
    icon: Monitor,
  },
  {
    value: "light",
    label: "Light",
    colors: ["#E2E2E2", "#ECECEC", "#4D4D4D"],
    icon: undefined,
  },
  {
    value: "dark",
    label: "Dark",
    colors: ["#1E1E1E", "#232323", "#808080"],
    icon: undefined,
  },
  {
    value: "nightingale",
    label: "Nightingale",
    colors: ["#202020", "#98BB6C", "#E6C384"],
    icon: undefined,
  },
] as const;

export default function ThemeSwitcher() {
  const themeIconSize = 16;

  const [currentTheme, setCurrentTheme] = useState("system");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { click, hover } = useClickSound();

  const applyThemeInstantly = useCallback((theme: string) => {
    const setRootBackground = (actualTheme: string) => {
      document.documentElement.style.backgroundColor =
        actualTheme === "dark"
          ? "#262626"
          : actualTheme === "nightingale"
            ? "#181818"
            : "#f5f5f5";
    };

    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const actualTheme = prefersDark ? "dark" : "light";

      if (actualTheme === "light") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", actualTheme);
      }
      setRootBackground(actualTheme);
    } else if (theme === "light") {
      document.documentElement.removeAttribute("data-theme");
      setRootBackground("light");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
      setRootBackground(theme);
    }
  }, []);

  const applyTheme = useCallback(
    (theme: string, skipAnimation = false) => {
      if (
        !skipAnimation &&
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        const doc = document as Document & {
          startViewTransition: (callback: () => void) => void;
        };
        doc.startViewTransition(() => {
          applyThemeInstantly(theme);
        });
      } else {
        applyThemeInstantly(theme);
      }
    },
    [applyThemeInstantly]
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    if (savedTheme !== currentTheme) {
      setCurrentTheme(savedTheme);
    }
    applyTheme(savedTheme, true);

    if (savedTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system", true);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const handleThemeChange = (theme: string) => {
    click();
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    setOpen(false);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const currentThemeData = themes.find((t) => t.value === currentTheme);

  // Position ref updated synchronously on toggle — no extra render
  const menuPosRef = useRef({ top: 0, right: 0 });

  const toggleOpen = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      menuPosRef.current = {
        top: rect.top,
        right: window.innerWidth - rect.right,
      };
    }
    setOpen((o) => !o);
  };

  const dropdown = (
    <div
      ref={menuRef}
      role="listbox"
      aria-label="Theme options"
      className={`bg-card border-accent/30 fixed z-[9999] min-w-[220px] border border-dashed p-1 shadow-lg transition-[opacity,transform] duration-150 origin-bottom-right ${
        open
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0"
      }`}
      style={{
        top: menuPosRef.current.top,
        right: menuPosRef.current.right,
        transform: `translateY(-100%) translateY(-6px)${open ? "" : " scale(0.95)"}`,
      }}
    >
      {themes.map((theme) => (
        <button
          key={theme.value}
          role="option"
          aria-selected={currentTheme === theme.value}
          onClick={() => handleThemeChange(theme.value)}
          className="text-foreground hover:bg-muted focus:bg-muted flex w-full cursor-pointer items-center gap-3 px-3 py-2 font-mono text-xs outline-none select-none"
          style={CSS_TRANSITIONS.fade}
        >
          <div className="w-4">
            {currentTheme === theme.value && (
              <Check
                size={themeIconSize}
                className="text-accent"
                strokeWidth={ICON_CONFIG.strokeWidth}
              />
            )}
          </div>

          <span className="flex-1 text-left">{theme.label}</span>

          {theme.icon ? (
            <theme.icon
              size={themeIconSize}
              className="text-foreground/70"
              strokeWidth={ICON_CONFIG.strokeWidth}
            />
          ) : (
            <div className="flex gap-0.5">
              {theme.colors.map((color, i) => (
                <div
                  key={i}
                  className="ring-border/50 h-3 w-3 ring-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        onMouseEnter={hover}
        className="bg-card text-foreground hover:bg-muted group relative inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        suppressHydrationWarning
        aria-label="Select theme"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="border-accent/30 pointer-events-none absolute top-0 right-0 left-0 h-px border-t border-dashed transition-[border-color,border-style] duration-200 group-hover:border-solid" />
        <div className="border-accent/30 pointer-events-none absolute right-0 bottom-0 left-0 h-px border-b border-dashed transition-[border-color,border-style] duration-200 group-hover:border-solid" />
        <div className="border-accent/30 pointer-events-none absolute top-0 bottom-0 left-0 w-px border-l border-dashed transition-[border-color,border-style] duration-200 group-hover:border-solid" />
        <div className="border-accent/30 pointer-events-none absolute top-0 right-0 bottom-0 w-px border-r border-dashed transition-[border-color,border-style] duration-200 group-hover:border-solid" />

        <span className="relative z-10 inline-flex">
          {currentThemeData?.icon ? (
            <currentThemeData.icon
              size={themeIconSize}
              strokeWidth={ICON_CONFIG.strokeWidth}
            />
          ) : (
            <Palette
              size={themeIconSize}
              strokeWidth={ICON_CONFIG.strokeWidth}
            />
          )}
        </span>
        <span className="relative z-10">{currentThemeData?.label}</span>
      </button>

      {mounted && createPortal(dropdown, document.body)}
    </>
  );
}
