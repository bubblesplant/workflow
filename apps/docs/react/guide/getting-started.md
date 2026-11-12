# React 快速开始

本页使用 `@bubblesjs/workflow-react-core`。展示审批记录请查看[流程记录指南](./history)；运行仓库请查看[本地开发](/development/)。

## 安装

需要 React 与 React DOM `^18.2.0 || ^19.0.0`：

```bash
pnpm add @bubblesjs/workflow-react-core
```

## 接入设计器

导入包样式，用 `useState` 保存节点，并给父容器设置高度。一个页面上的设计器实例应使用不同的 `id`。

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
  const [nodes, setNodes] = useState<WorkflowNode<BusinessConfig>[]>(() =>
    createDefaultNodes<BusinessConfig>(),
  );

  function configureNode({ id, type }: WorkflowNodeClickEvent) {
    // 按 id 读取节点，并打开业务方自己的配置表单。
    console.log(id, type);
  }

  return (
    <div style={{ height: 640 }}>
      <Designer
        id="approval-editor"
        nodes={nodes}
        onNodesChange={setNodes}
        onNodeClick={configureNode}
      />
    </div>
  );
}
```

`createDefaultNodes()` 每次返回新的开始、添加入口和结束节点。从画布的“+”入口插入业务节点后，组件通过 `onNodesChange` 返回新的完整数组。父组件需回写此数组，编辑结果才会保留。

## 只读展示

```tsx
<Designer id="approval-preview" nodes={nodes} readonly />
```

只读实例可以共享编辑实例的 `nodes`，随编辑结果同步更新；它不需要 `onNodesChange`。只读时隐藏增删操作，不触发业务节点配置回调。

## 接入业务与保存

`onNodeClick` 提供 `{ id, type }`，开始、结束和添加入口不触发。通过 ID 查找当前节点，在自己的表单中编辑 `data.config`，并使用不可变更新回写数组，见[节点业务配置](./configuration)。

保存时序列化 `nodes`，恢复前校验数据结构与业务配置，再调用 `setNodes`，见[保存与恢复](./persistence)。

## 流程记录

记录展示使用独立的 `@bubblesjs/workflow-react-history` 包，通过 React 回调和渲染函数处理展开、附件与自定义内容，见[流程记录指南](./history)和 [WorkflowHistory API](../api/history)。

## 本地预览

在仓库根目录运行 `pnpm dev:react`，打开 `http://localhost:5175`。设计器和流程记录演示共用 React Playground，完整操作说明见[交互示例](../examples/)。

## 下一步

- [交互示例](../examples/)：体验采购审批流程、配置表单和浏览器草稿。
- [节点与流程结构](./nodes)：了解条件分支和嵌套循环。
- [Designer API](../api/designer)：查看完整属性与回调。
- [流程记录](./history)：接入独立记录组件。
