import Vue from "unplugin-vue/rolldown";
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    platform: "neutral",
    inputOptions: {
      resolve: { mainFields: ["module", "main"] },
      moduleTypes: { ".svg": "dataurl" },
    },
    plugins: [
      Vue({ isProduction: true }),
      {
        name: "inline-svg",
        resolveId(source: string, importer?: string) {
          if (source.endsWith(".svg?inline")) {
            return this.resolve(source.slice(0, -7), importer);
          }
        },
      },
    ],
    dts: { vue: true, generator: "tsc" },
    deps: {
      alwaysBundle: [/^antdv-next(?:\/|$)/],
      neverBundle: [/^vue(?:\/|$)/],
    },
    css: { fileName: "style.css" },
    sourcemap: true,
    clean: true,
  },
});
