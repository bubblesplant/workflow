import Vue from "unplugin-vue/rolldown";
import VueVite from "unplugin-vue/vite";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [VueVite()],
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
      dts: {
        // 仅内联公开声明用到的上游类型，避免依赖无关的全局类型。
        alwaysBundle: [/^antdv-next(?:\/|$)/, /^@vue-flow\/core(?:\/|$)/, /^@vueuse\/core(?:\/|$)/],
      },
    },
    css: { fileName: "style.css" },
    sourcemap: true,
    clean: true,
  },
});
