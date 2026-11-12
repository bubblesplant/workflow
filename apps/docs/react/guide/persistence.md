# React 保存与恢复

`nodes` 是可序列化的源模型。保存节点数组及其中的 `data.config` 即可，FlowGram 的运行时节点、位置与连线无需持久化。

## 保存节点

在组件内使用当前 `nodes` 生成快照：

```tsx
function saveDraft() {
  localStorage.setItem("approval-draft", JSON.stringify(nodes));
}
```

保存到服务器时，可按业务需要附加流程 ID、版本号和名称。`config` 中应使用可序列化值；不要存放函数、DOM 或画布实例。

## 校验后恢复

`JSON.parse` 只能解析 JSON，不能保证节点合法。先把结果视为 `unknown`，通过自己的校验器，再交给 `setNodes`：

```tsx
import type { WorkflowNode } from "@bubblesjs/workflow-react-core";

function restoreDraft(validateNodes: (value: unknown) => WorkflowNode[]) {
  const raw = localStorage.getItem("approval-draft");
  if (!raw) return;

  const value: unknown = JSON.parse(raw);
  const restored = validateNodes(value);
  setNodes(restored);
}
```

示例中的 `nodes` 和 `setNodes` 来自设计器所在组件的 `useState`；`validateNodes` 由业务项目实现，并在校验失败时抛出错误。界面需要捕获解析、校验与浏览器存储异常，展示可操作的提示。

至少检查：

- 输入是节点数组，ID 为非空且唯一的字符串。
- 业务节点提供合法的 `data.type`、标题和配置。
- `parentNode` 引用存在的节点，父子关系不形成环。
- 条件分支保留普通条件与最后一条兜底条件，循环结构符合约定。
- 每类业务节点满足自己的发布规则。

不要仅通过 `as WorkflowNode[]` 跳过校验。替换当前流程前可让用户确认，并保留可恢复的草稿或历史版本。

## 演示行为

[React Playground](../examples/)使用浏览器本地存储保存草稿，恢复前检查节点编号、类型和父子关系。“新建空流程”和“加载审批示例”替换当前编辑内容，已保存草稿仍可恢复。示例校验器属于 Playground 实现，不是组件包的公共 API。
