"use client";

import { useEffect, useState, useRef } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import { Palette, Check, Monitor } from "lucide-react";
import { ICON_CONFIG } from "@/lib/config/design";
import { useScrollbarCompensation } from "@/lib/hooks/useScrollbarCompensation";
import { SPRING_CONFIG, DURATION, EASING } from "@/lib/config/animation";

const themes = [
  {
    value: "system",
    label: "System",
    colors: ["#333333", "#595959", "#7A7A7A"], // Accent, Secondary, Tertiary (monochrome)
    icon: Monitor,
  },
  {
    value: "light",
    label: "Light",
    colors: ["#333333", "#595959", "#4D4D4D"], // Accent, Secondary, Tertiary (monochrome)
    icon: undefined,
  },
  {
    value: "dark",
    label: "Dark",
    colors: ["#B8B8B8", "#999999", "#808080"], // Accent, Secondary, Tertiary (monochrome)
    icon: undefined,
  },
  {
    value: "tokyo-night",
    label: "Tokyo Night",
    colors: ["#7DCFFF", "#E0AF68", "#BB9AF7"], // Accent (cyan), Secondary (gold), Tertiary (purple)
    icon: undefined,
  },
  {
    value: "gruvbox",
    label: "Gruvbox",
    colors: ["#FABD2F", "#FE8019", "#FB4934"], // Accent (yellow), Secondary (orange), Tertiary (red)
    icon: undefined,
  },
  {
    value: "kanagawa",
    label: "Kanagawa",
    colors: ["#957FB8", "#E6C384", "#98BB6C"], // Accent (purple), Secondary (orange), Tertiary (green)
    icon: undefined,
  },
] as const;

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("system");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Apply scrollbar compensation when dropdown is open
  useScrollbarCompensation(open);

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "system";
    setCurrentTheme(savedTheme);

    // Apply theme immediately
    applyTheme(savedTheme);

    // Listen for system theme changes if using system
    if (savedTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const applyTheme = (theme: string) => {
    if (theme === "system") {
      // Detect system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const actualTheme = prefersDark ? "dark" : "light";

      if (actualTheme === "light") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", actualTheme);
      }
    } else if (theme === "light") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    if (!newOpen) {
      setTimeout(() => {
        triggerRef.current?.blur();
      }, 0);
    }
  };

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    setOpen(false);
    triggerRef.current?.blur();
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="bg-card ring-border inline-flex h-8 w-24 ring-1" />;
  }

  const currentThemeData = themes.find((t) => t.value === currentTheme);

  return (
    <DropdownMenu.Root open={open} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          ref={triggerRef}
          className="bg-card text-foreground hover:bg-muted group relative inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs focus:outline-none"
        >
          {/* Top border - dashed, solid on hover */}
          <div className="border-accent/30 pointer-events-none absolute top-0 right-0 left-0 h-px border-t border-dashed transition-all duration-200 group-hover:border-solid" />

          {/* Bottom border - dashed, solid on hover */}
          <div className="border-accent/30 pointer-events-none absolute right-0 bottom-0 left-0 h-px border-b border-dashed transition-all duration-200 group-hover:border-solid" />

          {/* Left border - dashed, solid on hover */}
          <div className="border-accent/30 pointer-events-none absolute top-0 bottom-0 left-0 w-px border-l border-dashed transition-all duration-200 group-hover:border-solid" />

          {/* Right border - dashed, solid on hover */}
          <div className="border-accent/30 pointer-events-none absolute top-0 right-0 bottom-0 w-px border-r border-dashed transition-all duration-200 group-hover:border-solid" />

          <motion.span
            className="relative z-10 inline-flex"
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 12 }}
            transition={{
              duration: DURATION.normal,
              ease: EASING.easeOutCubic as any,
            }}
          >
            {currentThemeData?.icon ? (
              <currentThemeData.icon
                size={ICON_CONFIG.sizes.sm}
                strokeWidth={ICON_CONFIG.strokeWidth}
              />
            ) : (
              <Palette
                size={ICON_CONFIG.sizes.sm}
                strokeWidth={ICON_CONFIG.strokeWidth}
              />
            )}
          </motion.span>
          <span className="relative z-10">{currentThemeData?.label}</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-card ring-border z-50 min-w-[220px] overflow-hidden p-1 shadow-lg ring-1"
          sideOffset={5}
          align="end"
          asChild
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={SPRING_CONFIG.noBounce}
          >
            {themes.map((theme, index) => (
              <DropdownMenu.Item
                key={theme.value}
                className="text-foreground hover:bg-muted focus:bg-muted group relative flex cursor-pointer items-center gap-3 px-3 py-2 font-mono text-xs outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50"
                onSelect={() => handleThemeChange(theme.value)}
                style={{
                  transition: `all ${DURATION.fast}s cubic-bezier(${EASING.easeOutCubic.join(",")})`,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.03,
                    ...SPRING_CONFIG.noBounce,
                  }}
                  className="contents"
                >
                  {/* Checkmark with animation */}
                  <div className="w-4">
                    <AnimatePresence mode="wait">
                      {currentTheme === theme.value && (
                        <motion.div
                          initial={{ scale: 0, x: -10, opacity: 0 }}
                          animate={{ scale: 1, x: 0, opacity: 1 }}
                          exit={{ scale: 0, x: 10, opacity: 0 }}
                          transition={SPRING_CONFIG.noBounce}
                        >
                          <Check
                            size={ICON_CONFIG.sizes.sm}
                            strokeWidth={ICON_CONFIG.strokeWidth}
                            className="text-accent"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Theme Name */}
                  <span className="flex-1">{theme.label}</span>

                  {/* Color Preview or Icon */}
                  {theme.icon ? (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        duration: DURATION.fast,
                        ease: EASING.easeOutCubic as any,
                      }}
                    >
                      <theme.icon
                        size={ICON_CONFIG.sizes.sm}
                        strokeWidth={ICON_CONFIG.strokeWidth}
                        className="text-foreground/70"
                      />
                    </motion.div>
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
                </motion.div>
              </DropdownMenu.Item>
            ))}
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
