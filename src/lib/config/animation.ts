// Animation configuration following .github/animation-instruction.md

// Spring animations - default for Motion/Framer Motion
export const SPRING_CONFIG = {
  default: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
  },
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 25,
  },

  // Duration + bounce based springs (simpler API)
  modal: {
    type: "spring" as const,
    duration: 0.6,
    bounce: 0.3,
  },
  gentle: {
    type: "spring" as const,
    duration: 0.5,
    bounce: 0.2,
  },
  snappy: {
    type: "spring" as const,
    duration: 0.4,
    bounce: 0.4,
  },
  noBounce: {
    type: "spring" as const,
    duration: 0.3,
    bounce: 0, // No overshoot, smooth deceleration
  },
};

// Easing functions - custom cubic-bezier curves
export const EASING = {
  // Standard CSS ease - best for hover effects
  ease: [0.25, 0.1, 0.25, 1],

  // ease-out: Best for elements entering the screen
  easeOutQuad: [0.25, 0.46, 0.45, 0.94],
  easeOutCubic: [0.215, 0.61, 0.355, 1],
  easeOutQuart: [0.165, 0.84, 0.44, 1],
  easeOutQuint: [0.23, 1, 0.32, 1],
  easeOutExpo: [0.19, 1, 0.22, 1],

  // ease-in-out: For elements moving within the screen
  easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
  easeInOutCubic: [0.645, 0.045, 0.355, 1],
  easeInOutQuart: [0.77, 0, 0.175, 1],
  easeInOutQuint: [0.86, 0, 0.07, 1],
};

// Duration (in seconds) - keep animations fast (0.2s-0.3s)
export const DURATION = {
  instant: 0,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
};

// Pre-built transition objects for common patterns
export const TRANSITIONS = {
  // Border hover effects (dashed → solid)
  border: {
    duration: DURATION.normal,
    ease: EASING.easeOutCubic,
  },
  // Quick fade transitions
  fade: {
    duration: DURATION.fast,
    ease: EASING.easeOutCubic,
  },
  // Scale animations (modals, dropdowns)
  scale: {
    duration: DURATION.normal,
    ease: EASING.easeOutQuart,
  },
  // Hover effects (buttons, links)
  hover: {
    duration: DURATION.normal,
    ease: EASING.ease,
  },
  // Spring configurations
  springModal: SPRING_CONFIG.noBounce,
  springDropdown: SPRING_CONFIG.gentle,
  springBouncy: SPRING_CONFIG.bouncy,
};

// CSS style objects for inline styles
export const CSS_TRANSITIONS = {
  border: {
    transitionDuration: `${TRANSITIONS.border.duration}s`,
    transitionTimingFunction: `cubic-bezier(${TRANSITIONS.border.ease.join(",")})`,
  },
  fade: {
    transitionDuration: `${TRANSITIONS.fade.duration}s`,
    transitionTimingFunction: `cubic-bezier(${TRANSITIONS.fade.ease.join(",")})`,
  },
  hover: {
    transitionDuration: `${TRANSITIONS.hover.duration}s`,
    transitionTimingFunction: `cubic-bezier(${TRANSITIONS.hover.ease.join(",")})`,
  },
};

// Legacy hover transition config (for backwards compatibility)
export const HOVER_TRANSITION = {
  duration: DURATION.normal,
  ease: "ease" as const,
};

// Animation presets for specific use cases
export const ANIMATION_PRESETS = {
  // For dashed borders that become solid on hover
  borderInteractive: {
    transition: `all ${DURATION.normal}s cubic-bezier(${EASING.easeOutCubic.join(",")})`,
  },
  // For modals and overlays
  modalEnter: SPRING_CONFIG.noBounce,
  // For dropdown menus
  dropdownEnter: SPRING_CONFIG.gentle,
  // For quick micro-interactions
  micro: {
    duration: DURATION.fast,
    ease: EASING.easeOutCubic,
  },
};
