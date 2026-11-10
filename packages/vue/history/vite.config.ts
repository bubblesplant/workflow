import Vue from "unplugin-vue/rolldown";
import VueVite from "unplugin-vue/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [VueVite()],
  pack: {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    platform: "neutral",
    plugins: [Vue({ isProduction: true })],
    dts: { vue: true, generator: "tsc" },
    deps: {
      neverBundle: [/^vue(?:\/|$)/],
    },
    css: { fileName: "style.css" },
    sourcemap: true,
    clean: true,
  },
});
