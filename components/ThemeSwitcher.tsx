"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import { Palette, Check, Monitor } from "lucide-react";
import { ICON_CONFIG } from "@/lib/config/design";
import {
  useScrollbarCompensation,
  useReducedMotion,
  useClickSound,
} from "@/lib/hooks";
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
    colors: ["#E2E2E2", "#ECECEC", "#4D4D4D"], // Accent, Secondary, Tertiary (monochrome)
    icon: undefined,
  },
  {
    value: "dark",
    label: "Dark",
    colors: ["#1E1E1E", "#232323", "#808080"], // Accent, Secondary, Tertiary (monochrome)
    icon: undefined,
  },
  {
    value: "nightingale",
    label: "Nightingale",
    colors: ["#202020", "#98BB6C", "#E6C384"], // Background, Green, Yellow
    icon: undefined,
  },
] as const;

export default function ThemeSwitcher() {
  const themeIconSize = ICON_CONFIG.sizes.sm;

  // Always start with "system" to avoid hydration mismatch
  const [currentTheme, setCurrentTheme] = useState("system");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { click, hover } = useClickSound();

  // Apply scrollbar compensation when dropdown is open
  useScrollbarCompensation(open);

  const applyThemeInstantly = useCallback((theme: string) => {
    if (theme === "system") {
      // Detect system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
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
  }, []);

  const applyTheme = useCallback(
    (theme: string, skipAnimation = false) => {
      // Check if View Transitions API is supported and animation is not skipped
      if (
        !skipAnimation &&
        typeof document !== "undefined" &&
        "startViewTransition" in document
      ) {
        // Animate theme change with View Transitions
        const doc = document as Document & {
          startViewTransition: (callback: () => void) => void;
        };
        doc.startViewTransition(() => {
          applyThemeInstantly(theme);
        });
      } else {
        // Fallback: instant theme change
        applyThemeInstantly(theme);
      }
    },
    [applyThemeInstantly]
  );

  useEffect(() => {
    // Load saved theme from localStorage on client only
    const savedTheme = localStorage.getItem("theme") || "system";
    if (savedTheme !== currentTheme) {
      setCurrentTheme(savedTheme);
    }

    // Apply theme immediately without animation on initial load
    applyTheme(savedTheme, true);

    // Listen for system theme changes if using system
    if (savedTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system", true);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    if (!newOpen) {
      setTimeout(() => {
        triggerRef.current?.blur();
      }, 0);
    }
  };

  const handleThemeChange = (theme: string) => {
    click();
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    // Close the dropdown - AnimatePresence will handle exit animation
    setOpen(false);
  };

  const currentThemeData = themes.find((t) => t.value === currentTheme);

  return (
    <DropdownMenu.Root open={open} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          ref={triggerRef}
          onMouseEnter={hover}
          className="bg-card text-foreground hover:bg-muted group relative inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          suppressHydrationWarning
          aria-label="Select theme"
        >
          {/* Top border - dashed, solid on hover */}
          <div className="border-accent/30 pointer-events-none absolute top-0 right-0 left-0 h-px border-t border-dashed transition-[border-color,border-style] duration-200 group-hover:border-solid" />

          {/* Bottom border - dashed, solid on hover */}
          <div className="border-accent/30 pointer-events-none absolute right-0 bottom-0 left-0 h-px border-b border-dashed transition-[border-color,border-style] duration-200 group-hover:border-solid" />

          {/* Left border - dashed, solid on hover */}
          <div className="border-accent/30 pointer-events-none absolute top-0 bottom-0 left-0 w-px border-l border-dashed transition-[border-color,border-style] duration-200 group-hover:border-solid" />

          {/* Right border - dashed, solid on hover */}
          <div className="border-accent/30 pointer-events-none absolute top-0 right-0 bottom-0 w-px border-r border-dashed transition-[border-color,border-style] duration-200 group-hover:border-solid" />

          <motion.span
            className="relative z-10 inline-flex"
            animate={{ rotate: 0 }}
            whileHover={prefersReducedMotion ? {} : { rotate: 12 }}
            transition={{
              duration: DURATION.fast,
              ease: EASING.easeOutCubic as [number, number, number, number],
            }}
          >
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
          </motion.span>
          <span className="relative z-10">{currentThemeData?.label}</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <AnimatePresence>
          {open && (
            <DropdownMenu.Content
              className="bg-card ring-border z-50 min-w-[220px] overflow-hidden p-1 shadow-lg ring-1"
              sideOffset={5}
              align="end"
              asChild
            >
              <motion.div
                initial={
                  prefersReducedMotion
                    ? {}
                    : { opacity: 0, scale: 0.95, y: -10 }
                }
                animate={
                  prefersReducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }
                }
                exit={
                  prefersReducedMotion
                    ? {}
                    : { opacity: 0, scale: 0.95, y: -10 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : SPRING_CONFIG.noBounce
                }
                onAnimationComplete={(definition) => {
                  // Close after exit animation completes
                  if (definition === "exit") {
                    setOpen(false);
                  }
                }}
              >
                {themes.map((theme, index) => (
                  <DropdownMenu.Item
                    key={theme.value}
                    className="text-foreground hover:bg-muted focus:bg-muted group relative flex cursor-pointer items-center gap-3 px-3 py-2 font-mono text-xs outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50"
                    onSelect={(event) => {
                      event.preventDefault(); // Prevent Radix auto-close
                      handleThemeChange(theme.value);
                    }}
                    style={{
                      transition: `all ${DURATION.fast}s cubic-bezier(${EASING.easeOutCubic.join(",")})`,
                    }}
                  >
                    <motion.div
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, x: -5 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : {
                              delay: index * 0.03,
                              ...SPRING_CONFIG.noBounce,
                            }
                      }
                      className="contents"
                    >
                      {/* Checkmark with animation */}
                      <div className="w-4">
                        <AnimatePresence mode="wait">
                          {currentTheme === theme.value && (
                            <motion.div
                              initial={
                                prefersReducedMotion
                                  ? {}
                                  : { scale: 0, x: -10, opacity: 0 }
                              }
                              animate={
                                prefersReducedMotion
                                  ? {}
                                  : { scale: 1, x: 0, opacity: 1 }
                              }
                              exit={
                                prefersReducedMotion
                                  ? {}
                                  : { scale: 0, x: 10, opacity: 0 }
                              }
                              transition={
                                prefersReducedMotion
                                  ? { duration: 0 }
                                  : SPRING_CONFIG.noBounce
                              }
                            >
                              <Check
                                size={themeIconSize}
                                className="text-accent"
                                strokeWidth={ICON_CONFIG.strokeWidth}
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
                          whileHover={
                            prefersReducedMotion ? {} : { scale: 1.1 }
                          }
                          transition={{
                            duration: DURATION.fast,
                            ease: EASING.easeOutCubic as [
                              number,
                              number,
                              number,
                              number,
                            ],
                          }}
                        >
                          <theme.icon
                            size={themeIconSize}
                            className="text-foreground/70"
                            strokeWidth={ICON_CONFIG.strokeWidth}
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
          )}
        </AnimatePresence>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
