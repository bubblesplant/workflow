import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";
import {
  WorkflowAvatar,
  WorkflowHistory,
  WorkflowTimeline,
  WorkflowTimelineDot,
  WorkflowTimelineItem,
  WorkflowTimelineTag,
} from "../index";
import type { WorkflowHistoryRecord } from "../types";
import { resolveRecordExpanded } from "../utils";

const records: readonly WorkflowHistoryRecord[] = Object.freeze([
  Object.freeze({
    id: "submit",
    title: "提交申请",
    status: "info",
    operator: { name: "张小明", description: "项目部" },
    time: "2026-11-09 09:00",
    datetime: "2026-11-09T09:00:00+08:00",
    opinion: "采购 <设备>，请审核。",
    fields: [
      { label: "金额", value: 0 },
      { label: "加急", value: false },
    ],
    attachments: [{ id: "quote", name: "报价单.pdf", url: "/quote.pdf" }],
  }),
  Object.freeze({ id: "review", title: "主管审批", status: "processing" }),
]);

describe("React 流程记录与组合组件", () => {
  it("渲染记录、状态、时间与字段，不修改只读输入", () => {
    const before = JSON.stringify(records);
    const html = renderToStaticMarkup(<WorkflowHistory records={records} />);
    expect(html).toContain("workflow-react-history__item--info");
    expect(html).toContain("workflow-react-history__item--processing");
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('dateTime="2026-11-09T09:00:00+08:00"');
    expect(html).toContain("采购 &lt;设备&gt;，请审核。");
    expect(html).toContain("<dd>0</dd>");
    expect(html).toContain("<dd>false</dd>");
    expect(html).toContain('href="/quote.pdf"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("等待处理，暂无审批意见");
    expect(JSON.stringify(records)).toBe(before);
  });

  it("受控展开键、默认收起和禁用折叠正确呈现", () => {
    const controlled = renderToStaticMarkup(
      <WorkflowHistory records={records} expandedKeys={["review"]} />,
    );
    expect(controlled.match(/aria-expanded="false"/g)).toHaveLength(1);
    expect(controlled.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(controlled.match(/hidden=""/g)).toHaveLength(1);
    const collapsed = renderToStaticMarkup(
      <WorkflowHistory records={records} defaultExpanded={false} />,
    );
    expect(collapsed.match(/hidden=""/g)).toHaveLength(2);
    const fixed = renderToStaticMarkup(
      <WorkflowHistory records={records} collapsible={false} expandedKeys={[]} />,
    );
    expect(fixed).not.toContain("aria-expanded");
    expect(fixed).not.toContain('hidden=""');
    expect(fixed).not.toContain("全部展开");
  });

  it("稳定 id 展开状态优先使用受控键；新记录沿用默认值", () => {
    const expansion = new Map([
      ["submit", false],
      ["review", true],
    ]);
    expect(resolveRecordExpanded("submit", true, undefined, expansion, true)).toBe(false);
    expect(resolveRecordExpanded("review", true, [], expansion, true)).toBe(false);
    expect(resolveRecordExpanded("new", true, undefined, expansion, false)).toBe(false);
    expect(resolveRecordExpanded("new", true, undefined, expansion, true)).toBe(true);
    expect(resolveRecordExpanded("submit", false, [], expansion, false)).toBe(true);
  });

  it("加载优先于记录，空态和业务替换内容正常渲染", () => {
    const loading = renderToStaticMarkup(
      <WorkflowHistory records={records} loading loadingContent={<p>读取审批日志</p>} />,
    );
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain("读取审批日志");
    expect(loading).not.toContain("workflow-react-history__list");
    expect(renderToStaticMarkup(<WorkflowHistory emptyContent="请先发起流程" />)).toContain(
      "请先发起流程",
    );
    const custom = renderToStaticMarkup(
      <WorkflowHistory
        records={records}
        renderContent={({ record }) => <article>{record.title}的业务详情</article>}
      />,
    );
    expect(custom).toContain("主管审批的业务详情");
    expect(custom).not.toContain("workflow-react-history__fields");
  });

  it("不安全或省略 URL 的附件使用按钮，支持完全自定义预览入口", () => {
    const attachmentRecord = {
      id: "file",
      title: "材料",
      attachments: [{ id: "a", name: "业务文件", url: "javascript:alert(1)" }],
    };
    const html = renderToStaticMarkup(<WorkflowHistory records={[attachmentRecord]} />);
    expect(html).toContain('<button class="workflow-react-history__attachment" type="button">');
    expect(html).not.toContain("javascript:");
    const custom = renderToStaticMarkup(
      <WorkflowHistory
        records={[attachmentRecord]}
        renderAttachment={({ attachment }) => <strong>{attachment.name}预览</strong>}
      />,
    );
    expect(custom).toContain("<strong>业务文件预览</strong>");
  });

  it("独立组合条目支持 render props、业务链接与自定义详情", () => {
    const html = renderToStaticMarkup(
      <WorkflowTimeline label="项目审批过程">
        <WorkflowTimelineItem
          title="项目立项"
          type="processing"
          renderTitle={({ expanded }) => (
            <>
              <WorkflowAvatar text="张😀明" />
              <a href="/business/1">立项 {String(expanded)}</a>
            </>
          )}
          renderDot={() => <WorkflowTimelineDot type="info">★</WorkflowTimelineDot>}
          renderStatus={() => <WorkflowTimelineTag type="success" text="已转交" />}
        >
          {({ expanded }) => <article>业务自由内容 {String(expanded)}</article>}
        </WorkflowTimelineItem>
      </WorkflowTimeline>,
    );
    expect(html).toContain('aria-label="项目审批过程"');
    expect(html).toContain("😀明");
    expect(html).toContain("★");
    expect(html).toContain("已转交");
    expect(html).toContain("业务自由内容 true");
    expect(html).not.toContain("未填写审批意见");
    expect(html).not.toMatch(/<button[^>]*>[^]*<a[^]*<\/button>/);
  });
});
