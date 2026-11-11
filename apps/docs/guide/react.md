# React 工作流组件

<script setup>
import { withBase } from "vitepress";
</script>

React 版本沿用 Vue 的组件包组织：`packages/react/core` 提供基于 FlowGram 的流程设计器，`packages/react/history` 提供流程记录与可组合的时间线组件，`apps/playgroud/react` 提供交互示例。

<a :href="withBase('/playground/react/')" target="_blank" rel="noopener noreferrer">打开 React Playground</a>，在线体验节点编辑、只读预览与流程记录。预览地址跟随文档站的 `DOCS_BASE` 配置。

## 本地预览

在仓库根目录运行：

```bash
pnpm install
pnpm dev:react
```

打开 `http://localhost:5175`，可切换流程设计器和流程记录；切换后保留当前编辑状态。设计器左侧编辑、右侧只读预览保持同步，旁边的表单演示业务配置更新。草稿保存到当前浏览器，恢复前会检查节点编号、节点类型和父子关系。

React Playground 使用 Ant Design 6 的按钮、开关和表单；流程替换与附件预览使用 Modal，保存及恢复结果通过消息和提示展示。入口配置了中文 `ConfigProvider` 和 `App` 上下文，统一组件主题与弹窗文案。

默认展示采购审批示例，包含负责人审批、预算条件、填写和抄送节点，点击卡片可查看业务配置。点击“新建空流程”可从开始、添加入口和结束三个节点开始设计；“加载审批示例”可恢复演示，两项操作都会先确认替换当前编辑内容，已保存的草稿仍可恢复。组件库的 `createDefaultNodes()` 继续返回空流程。

```bash
pnpm build:react
pnpm --filter @bubblesjs/workflow-react-core typecheck
pnpm --filter @bubblesjs/workflow-react-history typecheck
```

## 接入设计器

React 与 React DOM 支持 `^18.2.0 || ^19.0.0`。组件需要有明确高度的父容器，并导入包样式：

```tsx
import { useState } from "react";
import {
  Designer,
  createDefaultNodes,
  type WorkflowNode,
  type WorkflowNodeClickEvent,
} from "@bubblesjs/workflow-react-core";
import "@bubblesjs/workflow-react-core/style.css";

interface BusinessConfig {
  approverIds?: string[];
}

export function WorkflowEditor() {
  const [nodes, setNodes] = useState<WorkflowNode<BusinessConfig>[]>(() => createDefaultNodes());
  function configureNode({ id }: WorkflowNodeClickEvent) {
    // 按 id 查找节点，打开业务方自己的配置表单。
    console.log(id);
  }
  return (
    <div style={{ height: 640 }}>
      <Designer id="workflow" nodes={nodes} onNodesChange={setNodes} onNodeClick={configureNode} />
    </div>
  );
}
```

`nodes` 是唯一流程数据源，节点增删与新增条件会通过 `onNodesChange` 返回新的数组。节点的数组顺序表示同层执行顺序，`parentNode` 表示层级；位置和连线由 FlowGram 管理。保存时直接序列化 `nodes`，恢复后作为 `nodes` 传回。

`onNodeClick` 提供 `{ id, type }`，开始、结束和添加入口不触发。业务数据保存在 `data.config`，组件原样保留。React 中请使用不可变更新，以便画布同步配置：

```tsx
setNodes((current) =>
  current.map((node) =>
    node.id === selectedId && node.data
      ? {
          ...node,
          data: { ...node.data, label: "部门负责人审批", config: { approverIds: ["user-1"] } },
        }
      : node,
  ),
);
```

传入 `readonly` 可展示只读流程：隐藏增删操作、不触发配置事件，同时继续接受外部 `nodes` 更新。

## 流程记录

`WorkflowHistory` 接收与 Vue 版一致的记录字段；事件改为 React 回调：

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
    opinion: "同意，请财务继续审核。",
    attachments: [{ id: "file-1", name: "采购明细.pdf" }],
  },
];

export function ApprovalHistory() {
  return (
    <WorkflowHistory
      records={records}
      onAttachmentClick={({ attachment, event }) => {
        event.preventDefault();
        // 通过 attachment.id 调用业务方文件预览服务。
        console.log(attachment.id);
      }}
    />
  );
}
```

使用 `expandedKeys` 与 `onExpandedKeysChange` 控制展开记录，使用 `loading`、`emptyText` 提供加载与空状态。记录字段的 `0` 和 `false` 会正常显示，意见保留换行。

复杂业务内容可以组合 `WorkflowAvatar`、`WorkflowTimeline`、`WorkflowTimelineDot`、`WorkflowTimelineItem` 与 `WorkflowTimelineTag`。Vue 的标题、状态和圆点插槽在 React 中分别对应 `renderTitle`、`renderStatus`、`renderDot`；详情通过 `children` 传入，也支持 `({ expanded, toggle }) => ReactNode`。

```tsx
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
        <button onClick={toggle}>收起详情</button>
      </div>
    )}
  </WorkflowTimelineItem>
</WorkflowTimeline>
```

详细属性与示例见 [React history 包说明](https://github.com/bubblesplant/workflow/tree/main/packages/react/history)和仓库 `apps/playgroud/react/src/views`。
