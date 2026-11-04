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
              find: /^@bubblesjs\/workflow-vue$/,
              replacement: fileURLToPath(
                new URL("../../../packages/vue/core/src/index.ts", import.meta.url),
              ),
            },
            {
              find: /^@bubblesjs\/workflow-vue\/style\.css$/,
              replacement: fileURLToPath(
                new URL("../../../packages/vue/core/src/style.css", import.meta.url),
              ),
            },
          ]
        : [],
    dedupe: ["vue"],
  },
}));
