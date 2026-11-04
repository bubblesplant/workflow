# 节点与流程结构

`nodes` 是一个扁平数组。同层节点按数组顺序串联，嵌套关系由 `parentNode` 描述。布局和连线由设计器根据这两项信息计算。

## 节点类型

通过 `WORKFLOW_NODE_TYPE` 引用类型常量：

| 常量               | 值                 | 用途                             |
| ------------------ | ------------------ | -------------------------------- |
| `START`            | `start`            | 流程开始，不可删除               |
| `ADD`              | `add`              | 添加节点的入口，不可单独删除     |
| `APPROVAL`         | `approval`         | 审批节点                         |
| `FILL`             | `fill`             | 填写节点                         |
| `COPY`             | `copy`             | 抄送节点                         |
| `CONDITION_BRANCH` | `condition-branch` | 条件分支容器                     |
| `CONDITION`        | `condition`        | 某一条条件路径                   |
| `LOOP`             | `loop`             | 循环容器                         |
| `EXIT_LOOP`        | `exit-loop`        | 退出最近一层循环                 |
| `END`              | `end`              | 流程结束，不可删除               |
| `COMMON`           | `common`           | 通用节点，当前采用审批节点的展示 |

添加菜单提供审批、填写、抄送、条件分支和循环。退出循环仅在循环内部的添加入口中提供；条件节点由分支结构创建。

## 串行流程

建议从 `createDefaultNodes()` 开始，通过画布添加节点。如果需要预置流程，保留添加入口可以让使用方继续插入节点：

```ts
import { WORKFLOW_NODE_TYPE as T, type WorkflowNode } from "@bubblesjs/workflow-vue";

const nodes: WorkflowNode[] = [
  { id: "start", data: { type: T.START, label: "发起" } },
  { id: "add-before", data: { type: T.ADD, label: "添加节点" } },
  {
    id: "approval",
    data: { type: T.APPROVAL, label: "主管审批", config: { approverIds: ["user-1"] } },
  },
  { id: "add-after", data: { type: T.ADD, label: "添加节点" } },
  { id: "end", data: { type: T.END, label: "结束" } },
];
```

节点外层 `type` 是 Vue Flow 的渲染类型，省略时由设计器补为 `workflow`；`data.type` 才是业务节点类型。通常不需要指定外层 `type`。

## 条件分支

添加条件分支时，设计器创建一个分支容器、一条普通条件、一条“其他”兜底条件，以及相应添加入口。

```text
condition-branch
├── condition（conditionIndex: 1）
│   ├── add
│   ├── approval
│   └── add
└── condition（isDefaultCondition: true）
    └── add
```

条件节点的 `parentNode` 指向分支容器；条件内的业务节点和添加入口指向各自的条件节点。

- 点击分支容器的“添加分支”，会在兜底条件之前新增普通条件。
- 普通条件按 `conditionIndex` 升序展示，编号从 1 开始。
- 兜底条件始终排在最后，不能单独删除。
- 同组条件至少保留两条，包括兜底条件。
- 删除普通条件后，其余普通条件重新连续编号。
- 条件路径在末尾汇入分支后的节点。

条件节点固定展示“条件规则 N”与“点击查看条件规则”，兜底节点固定展示“其他”。具体表达式放在 `data.config` 中，由业务系统解释。

## 循环与退出

循环体中的节点通过 `parentNode` 归属循环节点；循环内部可以嵌套条件分支和其他循环。

```text
loop
├── add
├── approval
├── add
└── exit-loop
```

循环体的末尾生成回到循环入口的连线，同时保留通向循环后续节点的路径。空循环不生成回线。`exit-loop` 直接连接最近一层循环之后的节点，跳过本层循环体剩余节点；添加退出节点时不再追加添加入口。

循环次数、终止条件和退出表达式需要在 `data.config` 中约定，并由工作流引擎执行。

## 删除与保护

业务卡片的删除按钮在悬停或聚焦时显示，点击后需要确认。删除分支或循环会连同它的全部后代一起删除，并合并删除位置两侧相邻的添加入口。

设置 `deletable: false` 可以禁止单独删除某个节点。祖先容器被删除时，其后代仍会一同移除；该字段用于界面约束，业务权限还需在服务端检查。

## 导入数据的约束

节点 ID 必须唯一，`parentNode` 必须引用存在的节点，父子关系不能形成环。设计器对重复 ID、缺失父节点和父子引用环会抛出错误；将外部数据赋给 `nodes` 前，请先校验结构和业务规则。

完整字段见[类型与工具](../api/model)，持久化说明见[保存与恢复](./persistence)。
