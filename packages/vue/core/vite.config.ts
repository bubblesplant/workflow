import Vue from "unplugin-vue/rolldown";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    platform: "neutral",
    plugins: [Vue({ isProduction: true })],
    dts: { vue: true, generator: "tsc" },
    deps: { neverBundle: [/^vue(?:\/|$)/] },
    css: { fileName: "style.css" },
    sourcemap: true,
    clean: true,
  },
});
