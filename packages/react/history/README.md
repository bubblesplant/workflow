# React 流程记录

与 `packages/vue/history` 对齐的独立 React 组件包。支持 React 18.2 / 19，不依赖设计器或 UI 框架。

```tsx
import { useState } from "react";
import { WorkflowHistory, type WorkflowHistoryRecord } from "@bubblesjs/workflow-react-history";
import "@bubblesjs/workflow-react-history/style.css";

const records: WorkflowHistoryRecord[] = [
  {
    id: "submit",
    title: "提交申请",
    status: "info",
    statusText: "已提交",
    operator: { name: "张明" },
    opinion: "请审批。",
  },
  { id: "review", title: "主管审批", status: "processing" },
];

export function ApprovalHistory() {
  const [expandedKeys, setExpandedKeys] = useState(["submit", "review"]);
  return (
    <WorkflowHistory
      records={records}
      expandedKeys={expandedKeys}
      onExpandedKeysChange={setExpandedKeys}
      onAttachmentClick={({ event, attachment }) => {
        event.preventDefault();
        console.log("接入业务附件预览", attachment);
      }}
    />
  );
}
```

`records` 保持与 Vue 版相同的数据结构。状态为 `success`、`processing`、`pending`、`reject`、`info`；业务操作码应先映射为展示状态。时间原样展示，`datetime` 可传机器可读 ISO 时间。

不传 `expandedKeys` 时组件自行管理展开状态，默认为全部展开；使用 `defaultExpanded={false}` 默认收起。传入 `expandedKeys` 后，由 `onExpandedKeysChange` 请求更新，组件等待父组件回写。`onToggle` 提供 `{ record, expanded }`；`collapsible={false}` 始终展示详情。记录调整顺序时按稳定的 `id` 保留展开状态，新增记录沿用默认值。

`loading`、`emptyText`、`loadingContent`、`emptyContent` 提供加载和空状态。通过 `renderHeader`、`renderTitle`、`renderStatus`、`renderContent`、`renderOperator`、`renderOpinion`、`renderAttachment` 替换对应内容；回调均接收包含 `record` 的对象，附件回调额外提供 `attachment`。`children` 添加底部业务内容。

附件支持相对路径、HTTP(S) 和 `blob:`；未提供可用 URL 时显示按钮，由事件接入预览。链接点击事件可 `preventDefault()`。数字 `0`、布尔 `false` 原样显示，空字段显示“—”。

## 独立组合

```tsx
import {
  WorkflowAvatar,
  WorkflowTimeline,
  WorkflowTimelineItem,
  WorkflowTimelineTag,
} from "@bubblesjs/workflow-react-history";

<WorkflowTimeline label="项目审批过程">
  <WorkflowTimelineItem
    title="项目立项"
    type="processing"
    renderTitle={() => (
      <>
        <WorkflowAvatar text="张明" />
        <a href="/projects/1">项目立项</a>
      </>
    )}
    renderStatus={() => <WorkflowTimelineTag type="success" text="已转交" />}
  >
    {({ expanded, toggle }) => (
      <article>
        自由业务内容 <button onClick={toggle}>{expanded ? "收起" : "展开"}</button>
      </article>
    )}
  </WorkflowTimelineItem>
</WorkflowTimeline>;
```

公开 `WorkflowAvatar`、`WorkflowTimeline`、`WorkflowTimelineDot`、`WorkflowTimelineTag`、`WorkflowTimelineItem` 和 `WorkflowHistory`。组合条目无需标准记录对象，`children` 提供自由内容；`renderTitle`、`renderStatus`、`renderDot` 和函数 `children` 接收 `{ expanded, toggle }`。条目同样支持受控 `expanded` / `onExpandedChange` 和 `onToggle`。各组件支持 `className`、`style`。CSS 类以 `workflow-react-` 开头，可与 Vue 版共存；主题变量沿用 `--workflow-history-*`。
