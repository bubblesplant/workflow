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
  await import("@bubblesjs/workflow-vue-history"),
  require("@bubblesjs/workflow-vue-history"),
]) {
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
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(module.WorkflowHistory, null, {
          default: () => h("span", "流程记录插槽内容"),
        }),
    }),
  );
  assert.match(html, /^<div\b[^>]*class="workflow-history"/);
  assert.match(html, /<span>流程记录插槽内容<\/span>/);
  assert.match(html, /暂无流程记录/);

  const records = Object.freeze([
    Object.freeze({
      id: "submit",
      title: "发起申请",
      status: "info",
      statusText: "已提交",
      operator: { name: "张小明", description: "项目部" },
      time: "2026-11-09 09:00",
      datetime: "2026-11-09T09:00:00+08:00",
      opinion: "需要采购 <设备>，请审核。",
      fields: [
        { label: "金额", value: 0 },
        { label: "加急", value: false },
      ],
      attachments: [{ id: "quote", name: "报价单.pdf", url: "/files/quote.pdf" }],
    }),
    Object.freeze({ id: "review", title: "主管审批", status: "processing" }),
  ]);
  const recordsBefore = JSON.stringify(records);
  const timeline = await renderToString(
    createSSRApp({ render: () => h(module.WorkflowHistory, { records }) }),
  );
  assert.match(timeline, /workflow-history__item--info/);
  assert.match(timeline, /workflow-history__item--processing/);
  assert.match(timeline, /aria-expanded="true"/);
  assert.match(timeline, /datetime="2026-11-09T09:00:00\+08:00"/);
  assert.match(timeline, /需要采购 &lt;设备&gt;，请审核。/);
  assert.match(timeline, /<dd>0<\/dd>/);
  assert.match(timeline, /<dd>false<\/dd>/);
  assert.match(timeline, /href="\/files\/quote.pdf"/);
  assert.match(timeline, /等待处理，暂无审批意见/);
  assert.equal(JSON.stringify(records), recordsBefore, "渲染不得修改输入记录");

  const loading = await renderToString(
    createSSRApp({ render: () => h(module.WorkflowHistory, { records, loading: true }) }),
  );
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /正在加载流程记录/);
  assert.doesNotMatch(loading, /workflow-history__list/);

  // 不传标准 records，直接组合组件并完全由业务提供条目内容。
  const composition = await renderToString(
    createSSRApp({
      render: () =>
        h(
          module.WorkflowTimeline,
          { label: "独立业务审批过程" },
          {
            default: () => [
              h(
                module.WorkflowTimelineItem,
                { type: "processing" },
                {
                  title: () => [
                    h(module.WorkflowAvatar, { text: "项目负责人" }),
                    h("a", { href: "/projects/1" }, "业务项目标题"),
                  ],
                  dot: () => [
                    h(module.WorkflowTimelineDot, { type: "info" }, { default: () => "★" }),
                  ],
                  status: () => [
                    h(module.WorkflowTimelineTag, { type: "success", text: "已转交" }),
                  ],
                  default: ({ expanded }) => [h("article", `业务自由内容，展开状态：${expanded}`)],
                },
              ),
            ],
          },
        ),
    }),
  );
  assert.match(composition, /^<ol\b[^>]*workflow-timeline/);
  assert.match(composition, /aria-label="独立业务审批过程"/);
  assert.match(composition, /workflow-timeline-item/);
  assert.match(composition, /workflow-avatar/);
  assert.match(composition, /workflow-timeline-dot/);
  assert.match(composition, /★/);
  assert.match(composition, /<a href="\/projects\/1">业务项目标题<\/a>/);
  assert.match(composition, /已转交/);
  assert.match(composition, /业务自由内容，展开状态：true/);
  assert.doesNotMatch(composition, /workflow-history__fields|未填写审批意见|暂无审批意见/);
}

console.log("流程记录组件包的 ESM、CJS、类型入口、样式、数据渲染与独立组合 SSR 消费检查通过。");
