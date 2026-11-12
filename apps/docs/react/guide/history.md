# React 流程记录

`@bubblesjs/workflow-react-history` 独立于设计器，负责展示处理记录，不会执行审批或读取 `nodes`。业务系统需将接口数据适配为 `WorkflowHistoryRecord[]`。

## 安装与展示

```bash
pnpm add @bubblesjs/workflow-react-history
```

```tsx
import { WorkflowHistory, type WorkflowHistoryRecord } from "@bubblesjs/workflow-react-history";
import "@bubblesjs/workflow-react-history/style.css";

const records: WorkflowHistoryRecord[] = [
  {
    id: "approval-1",
    title: "部门负责人审批",
    status: "success",
    operator: { name: "张敏", description: "产品研发部" },
    time: "2026-11-09 09:38",
    datetime: "2026-11-09T09:38:00+08:00",
    opinion: "同意，请财务继续审核。",
    fields: [{ label: "采购金额", value: 12000 }],
    attachments: [{ id: "file-1", name: "采购明细.pdf" }],
  },
  { id: "approval-2", title: "财务确认", status: "processing" },
];

export function ApprovalHistory() {
  return (
    <WorkflowHistory
      records={records}
      onAttachmentClick={({ attachment, event }) => {
        event.preventDefault();
        // 根据附件 ID 调用业务方的文件预览服务。
        console.log(attachment.id);
      }}
    />
  );
}
```

`time` 原样显示，由业务方统一格式和时区；`datetime` 用作 HTML 时间语义。状态支持 `success`、`processing`、`pending`、`reject` 和 `info`，自定义业务操作码应先映射为展示状态。

字段值 `0` 和 `false` 会正常展示，空值显示“—”，意见保留换行。记录 ID 应唯一且稳定，用于维护展开状态。

## 控制展开与加载

默认由组件管理展开状态，记录默认全部展开。传入 `defaultExpanded={false}` 可让未操作的记录默认折叠。

需要由父组件控制时，将 `expandedKeys` 和 `onExpandedKeysChange` 配对使用：

```tsx
const [expandedKeys, setExpandedKeys] = useState<string[]>(["approval-1"]);

<WorkflowHistory
  records={records}
  expandedKeys={expandedKeys}
  onExpandedKeysChange={setExpandedKeys}
  onToggle={({ record, expanded }) => console.log(record.id, expanded)}
/>;
```

上例的 `useState` 从 `react` 导入，并在组件内调用。`collapsible={false}` 会让详情始终展开。通过 `loading`、`emptyText`、`loadingContent` 与 `emptyContent` 配置加载和空状态。

## 接管附件预览

有合法 `url` 的附件默认显示链接，可使用相对地址、HTTP(S) 或 Blob URL。没有合法地址时显示按钮。使用 `onAttachmentClick` 根据附件 ID 接入预览服务；若提供了链接但希望自行处理，先调用 `event.preventDefault()`。

需要完全自定义附件外观时使用 `renderAttachment`，并自行提供点击处理。

## 组合基础组件

记录数据无法适配标准列表时，可直接组合时间线，使用 React 渲染函数自定义标题、状态、圆点和详情。

```tsx
import {
  WorkflowAvatar,
  WorkflowTimeline,
  WorkflowTimelineItem,
} from "@bubblesjs/workflow-react-history";
import "@bubblesjs/workflow-react-history/style.css";

export function CustomHistory() {
  return (
    <WorkflowTimeline label="审批记录">
      <WorkflowTimelineItem
        type="success"
        title="负责人审批"
        renderTitle={() => (
          <>
            <WorkflowAvatar text="张敏" />
            负责人审批
          </>
        )}
      >
        {({ toggle }) => (
          <div>
            <p>同意采购。</p>
            <button type="button" onClick={toggle}>
              收起详情
            </button>
          </div>
        )}
      </WorkflowTimelineItem>
    </WorkflowTimeline>
  );
}
```

`renderTitle`、`renderStatus`、`renderDot` 和函数形式的 `children` 都接收 `{ expanded, toggle }`。即使自定义标题，也应提供 `title`，用于折叠按钮的无障碍名称。

## 调整样式与查看示例

样式类以 `workflow-react-` 开头，主题变量以 `--workflow-history-` 开头，可在业务容器上覆盖。完整属性、渲染参数与变量见 [WorkflowHistory API](../api/history)。

[React 交互示例](../examples/)中的“流程记录”提供组合示例、记录列表和附件预览。
