# Vue 保存与恢复

只需保存 `nodes` 中的流程结构和业务配置。节点坐标、连线、选中状态等画布运行时信息由设计器重新计算。

## 保存 JSON

在已有的 `nodes` 模型上序列化数据：

```ts
function serializeWorkflow() {
  return JSON.stringify({ schemaVersion: 1, nodes: nodes.value });
}
```

`schemaVersion` 是业务侧定义的文档格式版本，用于将来迁移历史数据。它不等同于组件包版本。

`data.config` 应仅包含可 JSON 序列化的数据。函数、`undefined`、`Map`、`Set`、循环引用和 `BigInt` 等不能按原样保存；日期建议转换为字符串。

## 恢复数据

从自己服务端读取的草稿，也需要在校验后再赋给模型：

```ts
import type { WorkflowNode } from "@bubblesjs/workflow-vue-core";

interface WorkflowDraft<TConfig> {
  schemaVersion: 1;
  nodes: WorkflowNode<TConfig>[];
}

// 此处假设 draft 已通过运行时校验和必要的数据迁移。
function applyDraft(draft: WorkflowDraft<BusinessConfig>) {
  nodes.value = draft.nodes;
}
```

TypeScript 类型断言不会校验 JSON。用户上传文件或接口响应应先作为 `unknown` 处理，再通过业务校验器检查。组件没有导出通用的导入校验函数。

至少核对以下内容：

1. 文档版本受支持，`nodes` 是数组。
2. 每个节点拥有非空、唯一的字符串 ID。
3. `data.type` 是支持的节点类型，`data.label` 是字符串。
4. `parentNode` 引用有效节点，父子关系不存在环。
5. 条件分支包含普通条件和末尾的兜底条件，编号有效。
6. 开始、结束、添加入口、循环与退出结构符合业务约束。
7. `data.config` 符合各类节点的业务 schema。

## 本地草稿

在浏览器事件或 `onMounted` 中使用 `localStorage`。存储可能因浏览器权限或容量限制失败，需要处理异常：

```ts
function saveLocalDraft() {
  try {
    localStorage.setItem("workflow:draft", serializeWorkflow());
    return { ok: true };
  } catch {
    return { ok: false, message: "无法保存本地草稿，请检查浏览器存储权限。" };
  }
}
```

刷新页面前保存草稿，再通过自己的校验器解析和恢复。[交互示例](../examples/) 的“保存草稿”和“恢复草稿”按钮可用于体验；该示例只恢复本次保存到内存中的快照，刷新后不会保留。

## 提交给执行引擎

设计器的数据模型描述可编辑流程。提交给实际工作流引擎前，需要转换为目标引擎接受的协议，检查审批人是否有效、表达式是否合法、循环是否有终止条件，以及当前用户是否具备发布权限。

保存草稿与发布流程建议使用独立操作。业务字段或结构升级后，应在加载阶段迁移旧草稿，再交给设计器编辑。
