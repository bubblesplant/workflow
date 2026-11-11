import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

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

for (const module of [await import(manifest.name), require(manifest.name)]) {
  assert.equal(typeof module.Designer, "function", "ESM / CJS 入口应导出 Designer");
  assert.equal(typeof module.CommonCard, "function", "应导出 CommonCard");
  assert.equal(typeof module.createDefaultNodes, "function", "应导出节点初始化方法");
  const nodes = module.createDefaultNodes();
  assert.equal(nodes.length, 3, "初始工作流应包含开始、添加和结束节点");
  assert.notEqual(nodes[0].data, module.createDefaultNodes()[0].data, "初始数据应相互独立");
  const html = renderToStaticMarkup(
    createElement(module.CommonCard, {
      title: "组件产物检查",
      description: "业务配置说明",
      deletable: false,
    }),
  );
  assert.match(html, /<button/);
  assert.match(html, /业务配置说明/);
  assert.match(html, /组件产物检查/);
  const designerHtml = renderToStaticMarkup(
    createElement(module.Designer, { id: "server-workflow", nodes }),
  );
  assert.match(designerHtml, /id="server-workflow"/);
  assert.doesNotMatch(designerHtml, /正在加载流程画布/);
}

console.log(
  "React 组件包的 ESM、CJS、类型入口、样式和独立卡片 SSR 消费检查通过；FlowGram 画布在浏览器中验证。",
);
