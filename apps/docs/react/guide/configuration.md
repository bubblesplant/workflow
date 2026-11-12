# React 节点业务配置

设计器只维护流程结构。审批人、表单权限、条件表达式、循环次数等业务规则放在 `data.config` 中，由应用负责编辑和校验。

## 声明业务类型

```tsx
import { useState } from "react";
import { Designer, createDefaultNodes, type WorkflowNode } from "@bubblesjs/workflow-react-core";
import "@bubblesjs/workflow-react-core/style.css";

interface ApprovalConfig {
  approverIds?: string[];
}

export function ApprovalEditor() {
  const [nodes, setNodes] = useState<WorkflowNode<ApprovalConfig>[]>(() =>
    createDefaultNodes<ApprovalConfig>(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = nodes.find((node) => node.id === selectedId);

  function saveConfig(label: string, approverIds: string[]) {
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedId && node.data
          ? {
              ...node,
              data: {
                ...node.data,
                label,
                config: { ...node.data.config, approverIds },
              },
            }
          : node,
      ),
    );
  }

  return (
    <>
      <div style={{ height: 640 }}>
        <Designer
          id="approval-config"
          nodes={nodes}
          onNodesChange={setNodes}
          onNodeClick={({ id }) => setSelectedId(id)}
        />
      </div>
      {selectedNode?.data?.type === "approval" && (
        <button onClick={() => saveConfig("部门负责人审批", ["user-1"])}>
          将当前审批节点设为部门负责人审批
        </button>
      )}
    </>
  );
}
```

实际项目可将按钮换成抽屉、弹窗或侧栏表单。保存前检查当前节点是否仍然存在；用户删除节点后，应关闭对应配置面板。

## 更新规则

React 通过新的引用识别更新。修改配置时，同时创建新的数组、节点和 `data` 对象；避免直接给 `nodes[index].data.config` 赋值。使用 `setNodes(current => ...)` 可基于最新状态更新，避免覆盖刚完成的结构编辑。

`data.label` 是业务标题，`data.description` 是卡片说明，`data.config` 是业务配置。条件节点标题固定为“条件规则 N”或“其他”；修改条件说明请写入 `description`，表达式写入 `config`。

## 校验与权限

提交前按节点类型校验配置，例如审批人不能为空、分支表达式有效、循环具有终止条件。组件不会执行表达式，也不会替代服务端权限检查。

`readonly` 控制整个设计器的编辑入口；`deletable: false` 仅禁止单独删除节点。详细结构见[节点与流程结构](./nodes)，保存方式见[保存与恢复](./persistence)。
