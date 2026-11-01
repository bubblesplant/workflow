import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*.{js,jsx,ts,tsx,mjs,cjs,mts,cts,json,jsonc,yaml,yml,md,css,scss}": "vp check --fix",
    "*.vue": ["vp lint --fix", "eslint --fix --max-warnings=0", "vp fmt --write"],
  },
  fmt: {
    tabWidth: 2,
    useTabs: false,
    ignorePatterns: [
      "**/dist/**",
      "**/coverage/**",
      "**/.vitepress/cache/**",
      "**/.vitepress/dist/**",
    ],
  },
  lint: {
    plugins: ["eslint", "typescript", "unicorn", "oxc", "vue"],
    ignorePatterns: [
      "**/dist/**",
      "**/coverage/**",
      "**/.vitepress/cache/**",
      "**/.vitepress/dist/**",
    ],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: { scripts: false, tasks: true },
    tasks: {
      quality: {
        command: ["pnpm format:check", "pnpm lint", "pnpm typecheck", "pnpm test"],
        cache: false,
      },
    },
  },
});
