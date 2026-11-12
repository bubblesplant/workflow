# React 类型与工具

以下类型、常量和工具均从 `@bubblesjs/workflow-react-core` 导出。

## WorkflowNode

```ts
interface WorkflowNode<TConfig = unknown> {
  id: string;
  type?: string;
  parentNode?: string;
  data?: NodeData<TConfig>;
  deletable?: boolean;
  position?: { x: number; y: number };
}
```

| 字段         | 说明                                                |
| ------------ | --------------------------------------------------- |
| `id`         | 节点唯一标识，保存与恢复时保持稳定                  |
| `type`       | 源模型渲染标识，通常省略                            |
| `parentNode` | 父节点 ID；顶层节点省略                             |
| `data`       | 节点类型、标题、说明和业务配置；有效业务节点应提供  |
| `deletable`  | 设置为 `false` 禁止单独删除；结构性删除限制仍然生效 |
| `position`   | 可选布局起点；实际渲染位置由设计器计算，无需维护    |

React 的公共入口不导出画布引擎运行时类型，应用状态和持久化使用 `WorkflowNode<TConfig>`。

## NodeData

```ts
interface NodeData<TConfig = unknown> {
  type: WorkflowNodeType;
  label: string;
  description?: string;
  config?: TConfig;
  conditionIndex?: number;
  isDefaultCondition?: boolean;
}
```

`config` 由业务侧维护，设计器原样保留。`conditionIndex` 从 1 开始；`isDefaultCondition` 标识同组最后一条兜底条件。二者用于条件节点，通常由设计器自动维护。

## WorkflowNodeType

由 `WORKFLOW_NODE_TYPE` 的所有值构成的联合类型：

```ts
type WorkflowNodeType =
  | "start"
  | "add"
  | "common"
  | "end"
  | "approval"
  | "condition"
  | "fill"
  | "copy"
  | "condition-branch"
  | "loop"
  | "exit-loop";
```

含义和结构约束见[节点与流程结构](../guide/nodes)。`WorkflowNodeClickEvent` 见 [Designer 事件](./designer#onnodeclick)。

## createDefaultNodes

```ts
function createDefaultNodes<TConfig = unknown>(): WorkflowNode<TConfig>[];
```

返回新的初始节点数组：开始（ID `1`）、添加入口（ID `2`）、结束（ID `3`）。每次调用都会创建独立的节点对象。

```ts
const first = createDefaultNodes();
const second = createDefaultNodes();
// 两个模型互不共享节点对象；实例 id 也应分别指定。
```

## WORKFLOW_NODE_TYPE / WORKFLOW_NODE_SLOT

```ts
import { WORKFLOW_NODE_TYPE, WORKFLOW_NODE_SLOT } from "@bubblesjs/workflow-react-core";

WORKFLOW_NODE_TYPE.APPROVAL; // "approval"
WORKFLOW_NODE_SLOT; // "workflow"
```

前者定义 `data.type` 的业务类型，后者是源模型渲染标识 `workflow`。React 设计器会自行映射 FlowGram 画布类型，业务侧通常无需设置外层 `type`。

## 节点尺寸

```ts
interface NodeDimensions {
  readonly width: number;
  readonly height: number;
  readonly gap?: number;
}

function getNodeDimensions(type: WorkflowNodeType): NodeDimensions;
```

`WORKFLOW_NODE_DIMENSIONS` 是节点和布局使用的尺寸常量，单位为 px：

| 字段               | 值                    | 用途                                   |
| ------------------ | --------------------- | -------------------------------------- |
| `common`           | `360 × 124`           | 普通业务节点、条件节点、循环与退出节点 |
| `branch`           | `360 × 56`，`gap: 40` | 条件分支容器                           |
| `terminal`         | `104 × 40`            | 开始、结束                             |
| `add`              | `40 × 40`             | 添加入口                               |
| `gap`              | `40`                  | 串行节点纵向间距                       |
| `loop.edgeOffsetX` | `200`                 | 回线距循环中心线的最小水平距离         |
| `loop.edgeGap`     | `20`                  | 回线与循环子树右边界的间距             |
| `loop.edgeOffsetY` | `50`                  | 回线在末尾节点下方预留的距离           |

`getNodeDimensions()` 返回对应节点尺寸，不计算坐标或边界。这些常量用于读取与对齐，当前没有通过 props 自定义尺寸的接口。

## 导出范围

公共入口还导出 `Designer`、`StartCard`、`EndCard` 和 `CommonCard`。内部添加、删除、布局与连线工具，以及 `defaultNodes`、`WORKFLOW_EDGE_TYPE`、`WorkflowRenderNode`、`WorkflowRenderEdge` 等未从公共入口导出，不属于包的公开 API。
