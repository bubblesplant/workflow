import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite-plus";

export default defineConfig(({ command }) => ({
  base: process.env.PLAYGROUND_REACT_BASE ?? "/",
  resolve: {
    alias:
      command === "serve"
        ? [
            {
              find: /^@bubblesjs\/workflow-react-core$/,
              replacement: fileURLToPath(
                new URL("../../../packages/react/core/src/index.ts", import.meta.url),
              ),
            },
            {
              find: /^@bubblesjs\/workflow-react-core\/style\.css$/,
              replacement: fileURLToPath(
                new URL("../../../packages/react/core/src/style.css", import.meta.url),
              ),
            },
            {
              find: /^@bubblesjs\/workflow-react-history$/,
              replacement: fileURLToPath(
                new URL("../../../packages/react/history/src/index.ts", import.meta.url),
              ),
            },
            {
              find: /^@bubblesjs\/workflow-react-history\/style\.css$/,
              replacement: fileURLToPath(
                new URL("../../../packages/react/history/src/style.css", import.meta.url),
              ),
            },
          ]
        : [],
    dedupe: ["react", "react-dom"],
  },
}));
