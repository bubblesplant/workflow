import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite-plus";

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  resolve: {
    alias:
      command === "serve"
        ? [
            {
              find: /^@workflow\/vue-core$/,
              replacement: fileURLToPath(
                new URL("../../../packages/vue/core/src/index.ts", import.meta.url),
              ),
            },
            {
              find: /^@workflow\/vue-core\/style\.css$/,
              replacement: fileURLToPath(
                new URL("../../../packages/vue/core/src/style.css", import.meta.url),
              ),
            },
          ]
        : [],
    dedupe: ["vue"],
  },
}));
