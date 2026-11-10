import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

export default defineConfig(({ command }) => ({
  base: process.env.PLAYGROUND_BASE ?? "/",
  plugins: [vue()],
  resolve: {
    alias:
      command === "serve"
        ? [
            {
              find: /^@bubblesjs\/workflow-vue-history$/,
              replacement: fileURLToPath(
                new URL("../../../packages/vue/history/src/index.ts", import.meta.url),
              ),
            },
            {
              find: /^@bubblesjs\/workflow-vue-history\/style\.css$/,
              replacement: fileURLToPath(
                new URL("../../../packages/vue/history/src/style.css", import.meta.url),
              ),
            },
            {
              find: /^@bubblesjs\/workflow-vue-core$/,
              replacement: fileURLToPath(
                new URL("../../../packages/vue/core/src/index.ts", import.meta.url),
              ),
            },
            {
              find: /^@bubblesjs\/workflow-vue-core\/style\.css$/,
              replacement: fileURLToPath(
                new URL("../../../packages/vue/core/src/style.css", import.meta.url),
              ),
            },
          ]
        : [],
    dedupe: ["vue"],
  },
}));
