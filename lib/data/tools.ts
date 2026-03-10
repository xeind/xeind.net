import { ToolCategory } from "@/lib/types";

export const toolCategories: ToolCategory[] = [
  {
    label: "Productivity",
    tools: [
      { name: "Raycast", description: "Launcher and productivity tool", url: "https://raycast.com" },
      { name: "Things 3", description: "Task manager", url: "https://culturedcode.com/things" },
      { name: "Obsidian", description: "Knowledge base and notes", url: "https://obsidian.md" },
      { name: "Pure Paste", description: "Paste without formatting", url: "https://sindresorhus.com/pure-paste" },
      { name: "CleanShot X", description: "Screenshot and recording tool", url: "https://cleanshot.com" },
    ],
  },
  {
    label: "Development",
    tools: [
      { name: "Ghostty", description: "GPU-accelerated terminal", url: "https://ghostty.org" },
      { name: "Zed", description: "High-performance code editor", url: "https://zed.dev" },
      { name: "Neovim", description: "Hyperextensible text editor", url: "https://neovim.io" },
      { name: "tmux", description: "Terminal multiplexer", url: "https://github.com/tmux/tmux" },
      { name: "Docker", description: "Containerization platform", url: "https://docker.com" },
    ],
  },
  {
    label: "Design",
    tools: [
      { name: "Figma", description: "Interface design tool", url: "https://figma.com" },
      { name: "Adobe Photoshop", description: "Image editing" },
      { name: "Illustrator", description: "Vector graphics" },
      { name: "Premiere Pro", description: "Video editing" },
      { name: "After Effects", description: "Motion graphics" },
      { name: "DaVinci Resolve", description: "Color grading and editing", url: "https://www.blackmagicdesign.com/products/davinciresolve" },
    ],
  },
  {
    label: "Browser",
    tools: [
      { name: "Firefox", description: "Primary browser", url: "https://firefox.com" },
      { name: "Zen Browser", description: "Firefox-based minimal browser", url: "https://zen-browser.app" },
    ],
  },
  {
    label: "CLI",
    tools: [
      { name: "ripgrep", description: "Fast recursive search", url: "https://github.com/BurntSushi/ripgrep" },
      { name: "fzf", description: "Fuzzy finder", url: "https://github.com/junegunn/fzf" },
      { name: "yazi", description: "Terminal file manager", url: "https://github.com/sxyazi/yazi" },
      { name: "btop", description: "Resource monitor", url: "https://github.com/aristocratos/btop" },
      { name: "lsd", description: "Modern ls replacement", url: "https://github.com/lsd-rs/lsd" },
    ],
  },
  {
    label: "Utilities",
    tools: [
      { name: "Helium", description: "Floating browser window", url: "https://helium.app" },
      { name: "Bitwarden", description: "Password manager", url: "https://bitwarden.com" },
      { name: "Tailscale", description: "Mesh VPN", url: "https://tailscale.com" },
      { name: "LocalSend", description: "Local file sharing", url: "https://localsend.org" },
      { name: "Karabiner-Elements", description: "Keyboard customizer", url: "https://karabiner-elements.pqrs.org" },
      { name: "BetterDisplay", description: "Display management", url: "https://github.com/waydabber/BetterDisplay" },
    ],
  },
  {
    label: "AI",
    tools: [
      { name: "Claude Opus 4.6", description: "Primary AI assistant", url: "https://claude.ai" },
    ],
  },
];
