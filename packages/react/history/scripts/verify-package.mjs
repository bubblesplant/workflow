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
  for (const name of [
    "WorkflowHistory",
    "WorkflowAvatar",
    "WorkflowTimeline",
    "WorkflowTimelineItem",
    "WorkflowTimelineDot",
    "WorkflowTimelineTag",
  ]) {
    assert(module[name], `ESM / CJS 入口应导出 ${name}`);
  }
  assert.match(renderToStaticMarkup(createElement(module.WorkflowHistory)), /暂无流程记录/);
  const html = renderToStaticMarkup(
    createElement(module.WorkflowHistory, {
      records: [
        {
          id: "review",
          title: "主管审批",
          status: "processing",
          fields: [{ label: "金额", value: 0 }],
          attachments: [{ id: "quote", name: "报价.pdf", url: "/quote.pdf" }],
        },
      ],
    }),
  );
  assert.match(html, /workflow-react-history__item--processing/);
  assert.match(html, /<dd>0<\/dd>/);
  assert.match(html, /href="\/quote.pdf"/);
  const composed = renderToStaticMarkup(
    createElement(
      module.WorkflowTimeline,
      null,
      createElement(
        module.WorkflowTimelineItem,
        { title: "组合条目" },
        createElement("article", null, "自由业务详情"),
      ),
    ),
  );
  assert.match(composed, /自由业务详情/);
  assert.doesNotMatch(composed, /未填写审批意见/);
}
console.log("React 流程记录 ESM / CJS、声明、样式与 SSR 消费检查通过。");
