# React 工作流设计器

基于 FlowGram 固定布局引擎，目录和业务数据格式与 Vue 版对应。支持审批、填写、抄送、条件分支、循环、退出循环、节点配置、删除确认及只读预览。删除确认使用 Ant Design Modal，添加节点使用 Popover，节点和操作图标使用 `@ant-design/icons`。

```tsx
import { useState } from "react";
import { Designer, createDefaultNodes, type WorkflowNode } from "@bubblesjs/workflow-react-core";
import "@bubblesjs/workflow-react-core/style.css";

interface BusinessConfig {
  approverIds?: string[];
}

export function Workflow() {
  const [nodes, setNodes] = useState<WorkflowNode<BusinessConfig>[]>(createDefaultNodes());
  return (
    <div style={{ height: 720 }}>
      <Designer
        id="workflow"
        nodes={nodes}
        onNodesChange={setNodes}
        onNodeClick={({ id }) => console.log("配置业务节点", id)}
      />
    </div>
  );
}
```

`nodes` 是唯一的流程源数据，数组顺序表示同层执行顺序，`parentNode` 表示层级。业务信息放在 `data.config`，以不可变更新数组和节点的方式回写配置；可使用 `JSON.stringify(nodes)` 保存草稿，解析并校验后恢复。不要保存 FlowGram 内部节点、坐标或实体对象。

| 属性                  | 说明                                                    |
| --------------------- | ------------------------------------------------------- |
| `id`                  | 画布容器唯一标识，必填                                  |
| `nodes`               | `WorkflowNode<TConfig>[]`，必填                         |
| `onNodesChange`       | 增删节点和增加分支后返回新数组                          |
| `onNodeClick`         | 返回业务节点 `{ id, type }`，由业务方打开自己的配置表单 |
| `readonly`            | 隐藏编辑操作，仍支持缩放、平移及外部数据刷新            |
| `className` / `style` | 容器样式，父容器必须有明确高度                          |

还公开 `StartCard`、`EndCard`、`CommonCard`、节点类型和尺寸常量。条件分支至少保留一个普通条件和一个“其他”兜底条件；删除分支或循环会同时删除其子树。退出循环仅能添加在循环内部。

兼容 React 18.2 / 19。Ant Design 6 和图标包作为组件依赖安装；应用已有 `ConfigProvider` 时，弹窗和浮层会继承其主题配置，不需要额外的全局弹窗初始化。引擎在浏览器挂载后延迟加载，服务端渲染仅输出容器。FlowGram 自带样式随客户端画布模块加载，使用方仍需导入本包 `style.css`。React 版无 Vue 运行时依赖。

仓库执行 `pnpm dev:react` 打开示例；`pnpm build:react` 构建两个 React 组件包和预览应用。
