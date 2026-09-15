import js from "@eslint/js";
import { plugin as shadcn } from "@shadcn/lint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", ".astro/**", ".next/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,astro}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // @shadcn/lint reads the theme in src/styles/global.css and the primitives
  // in src/components/ui. Two of its rules stay off on purpose:
  // `no-arbitrary-values` — scripts/check-design-rules.mjs owns the closed
  // sets and the grid arithmetic; `no-inline-styles` — the site drives SVG
  // geometry and CSS custom properties through `style`, by design.
  {
    files: ["**/*.{ts,tsx,astro}"],
    plugins: { shadcn },
    settings: { shadcn: { ui: "@/components/ui" } },
    rules: {
      "shadcn/no-restyle": ["error", { allow: ["layout"] }],
      // `.bg-grid-pattern` is a background-image class in global.css, not a color.
      "shadcn/no-raw-colors": ["error", { allow: ["bg-grid-pattern"] }],
      // JavaScript hooks selected by the scripts in public/, never styled.
      "shadcn/no-unknown-classes": [
        "error",
        { allow: ["blog-zoom", "link-hint", "edge-glow-shell-surface"] },
      ],
      "shadcn/require-static-classes": "error",
    },
  },
  {
    // Primitives own their appearance; only their callers are held to it.
    files: ["src/components/ui/**"],
    rules: { "shadcn/no-restyle": "off" },
  },
  eslintConfigPrettier,
);
