import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

const require = createRequire(import.meta.url);
const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

for (const entry of [
  manifest.exports["."].import.default,
  manifest.exports["."].require.default,
  manifest.exports["."].import.types,
  manifest.exports["."].require.types,
  manifest.exports["./style.css"],
]) {
  const file = await stat(new URL(`../${entry}`, import.meta.url));
  assert(file.isFile() && file.size > 0, `${entry} 应存在且非空`);
}

for (const module of [await import("@workflow/vue-core"), require("@workflow/vue-core")]) {
  assert(module.WorkflowButton, "ESM / CJS 入口应导出 WorkflowButton");
  const html = await renderToString(
    createSSRApp({
      render: () => h(module.WorkflowButton, { disabled: true }, { default: () => "组件产物检查" }),
    }),
  );
  assert.match(html, /<button/);
  assert.match(html, /disabled/);
  assert.match(html, /组件产物检查/);
}

console.log("Vue 组件包的 ESM、CJS、类型入口、样式和 SSR 消费检查通过。");
