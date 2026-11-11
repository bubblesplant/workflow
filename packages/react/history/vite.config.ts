import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    platform: "neutral",
    dts: { generator: "tsc" },
    deps: { neverBundle: [/^react(?:\/|$)/, /^react-dom(?:\/|$)/] },
    css: { fileName: "style.css" },
    sourcemap: true,
    clean: true,
  },
});
