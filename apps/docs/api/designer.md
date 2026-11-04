# Designer

`Designer` 是工作流画布组件，通过模型同步节点数据，通过事件通知业务侧打开配置表单。

```ts
import { Designer } from "@workflow/vue-core";
import "@workflow/vue-core/style.css";
```

## 基本使用

```vue
<Designer id="expense-flow" v-model:nodes="nodes" @node-click="handleNodeClick" />
```

父容器需要有明确高度。完整代码见[快速开始](../guide/getting-started)。

## Props

| 名称    | 类型                      | 必填 | 说明                                        |
| ------- | ------------------------- | ---- | ------------------------------------------- |
| `id`    | `string`                  | 是   | Vue Flow 实例 ID；同一页面内保持唯一        |
| `nodes` | `WorkflowNode<TConfig>[]` | 是   | 通过 `v-model:nodes` 绑定流程结构与业务配置 |

`Designer` 支持泛型 `TConfig`，由节点模型中的业务配置类型推断。每个实例应使用独立的节点数组。

## Events

| 事件           | 参数                      | 触发时机                                             |
| -------------- | ------------------------- | ---------------------------------------------------- |
| `update:nodes` | `WorkflowNode<TConfig>[]` | 添加节点、删除节点或增加条件分支后，返回新的完整数组 |
| `node-click`   | `WorkflowNodeClickEvent`  | 点击业务节点、条件、分支或循环容器时                 |

### node-click

```ts
interface WorkflowNodeClickEvent {
  id: string;
  type: Exclude<WorkflowNodeType, "add" | "start" | "end">;
}
```

事件不携带节点配置或 Vue Flow 实例。请根据 `id` 从自己的模型读取最新节点。

也可以显式处理模型更新，适合集中式状态管理：

```vue
<Designer id="expense-flow" :nodes="nodes" @update:nodes="nodes = $event" />
```

## 布局行为

- 初次挂载自动适配视图。
- 不允许拖拽节点、手动连接节点或修改连线。
- 关闭通过键盘 Delete 删除；使用卡片上的删除按钮。
- 节点位置、分支排列和循环回线由内部算法计算。
- `deletable: false` 禁止单独删除该节点；删除祖先容器仍会移除整个子树。

## 扩展边界

当前没有公开的 slots、实例方法、只读开关、缩放属性或 Vue Flow 参数透传接口。不要依赖组件内部 DOM、内部工具函数或私有实例实现业务逻辑。

基础卡片可独立使用，见[节点卡片](./cards)。它们不会自动注册为 `Designer` 的自定义节点。
