# React Designer

```tsx
import { Designer } from "@bubblesjs/workflow-react-core";
import "@bubblesjs/workflow-react-core/style.css";
```

父容器需要明确高度。完整接入示例见[快速开始](../guide/getting-started)。

## Props

`DesignerProps<TConfig = unknown>`：

| 属性            | 类型                                       | 默认值  | 说明                                   |
| --------------- | ------------------------------------------ | ------- | -------------------------------------- |
| `id`            | `string`                                   | 必填    | 设计器实例 ID，同页唯一                |
| `nodes`         | `WorkflowNode<TConfig>[]`                  | 必填    | 受控源节点数组                         |
| `onNodesChange` | `(nodes: WorkflowNode<TConfig>[]) => void` | —       | 结构编辑后的完整节点数组，父组件需回写 |
| `readonly`      | `boolean`                                  | `false` | 隐藏编辑入口并禁用配置回调             |
| `onNodeClick`   | `(event: WorkflowNodeClickEvent) => void`  | —       | 点击业务节点，打开业务配置             |
| `className`     | `string`                                   | —       | 容器 CSS 类名                          |
| `style`         | `CSSProperties`                            | —       | 容器内联样式                           |

## onNodesChange

添加、删除节点或新增条件时，回调返回新的源节点数组。请通过 React state 回写：

```tsx
<Designer id="workflow" nodes={nodes} onNodesChange={setNodes} />
```

组件不会替使用方保存数据。业务表单修改配置时也需生成新的数组、节点和 `data` 引用，见[节点业务配置](../guide/configuration)。

## onNodeClick

```ts
interface WorkflowNodeClickEvent {
  id: string;
  type: Exclude<WorkflowNodeType, "start" | "add" | "end">;
}
```

回调提供节点 ID 与业务类型，不携带节点快照。通过 ID 从当前 `nodes` 中查找配置。开始、结束、添加入口和只读实例不触发此回调。

## 只读模式

`readonly` 隐藏添加、删除和增加条件等编辑入口，不触发配置回调；外部更新 `nodes` 后仍会重新展示流程。单个节点的 `deletable: false` 仅禁止单独删除，不能代替整体只读。

## 加载与定制范围

服务端只渲染容器；客户端挂载后通过 `lazy` 和 `Suspense` 加载 FlowGram 画布，加载文案为“正在加载流程画布…”。组件自动计算布局与连线，当前未提供自定义节点注册、手动连线或拖拽布局属性。

公开的[节点卡片](./cards)可独立组合，不会自动注册到设计器。源模型和工具见[类型与工具](./model)。
