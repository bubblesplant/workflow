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

for (const module of [
  await import("@bubblesjs/workflow-vue-core"),
  require("@bubblesjs/workflow-vue-core"),
]) {
  assert(module.Designer, "ESM / CJS 入口应导出 Designer");
  assert(module.CommonCard, "ESM / CJS 入口应导出 CommonCard");
  assert.equal(typeof module.createDefaultNodes, "function", "应导出节点初始化方法");
  const nodes = module.createDefaultNodes();
  assert.equal(nodes.length, 3, "初始工作流应包含开始、添加和结束节点");
  assert.notEqual(nodes[0].data, module.createDefaultNodes()[0].data, "初始数据应相互独立");
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(module.CommonCard, {
          title: "组件产物检查",
          description: "业务配置说明",
          deletable: false,
        }),
    }),
  );
  assert.match(html, /<button/);
  assert.match(html, /业务配置说明/);
  assert.match(html, /组件产物检查/);
}

console.log("Vue 组件包的 ESM、CJS、类型入口、样式和 SSR 消费检查通过。");
