# 节点业务配置

设计器不限制业务配置的字段。审批人、表单权限、条件表达式和循环规则等信息，可以放在节点的 `data.config` 中。

## 定义配置类型

```ts
import { ref } from "vue";
import { createDefaultNodes, type WorkflowNode } from "@bubblesjs/workflow-vue";

interface BusinessConfig {
  approverIds?: string[];
  expression?: string;
}

const nodes = ref<WorkflowNode<BusinessConfig>[]>(createDefaultNodes<BusinessConfig>());
```

`WorkflowNode<BusinessConfig>` 会将 `data.config` 的类型约束为 `BusinessConfig`。设计器添加或删除其他节点时会保留已有业务配置。

## 监听节点点击

```vue
<Designer id="approval-flow" v-model:nodes="nodes" @node-click="handleNodeClick" />
```

事件只包含 `{ id, type }`。按 ID 从当前节点数组读取数据，再填充自己的表单：

```ts
import { computed, ref } from "vue";
import type { WorkflowNodeClickEvent } from "@bubblesjs/workflow-vue";

const selectedNodeId = ref("");
const selectedNode = computed(() => nodes.value.find((node) => node.id === selectedNodeId.value));
const draftLabel = ref("");
const draftApprovers = ref("");

function handleNodeClick({ id }: WorkflowNodeClickEvent) {
  selectedNodeId.value = id;
  draftLabel.value = selectedNode.value?.data?.label ?? "";
  draftApprovers.value = selectedNode.value?.data?.config?.approverIds?.join(", ") ?? "";
}
```

开始、结束和添加入口不会触发 `node-click`。条件分支、条件规则、循环以及普通业务节点都会触发。

## 提交表单

用新的节点数组更新模型。保留 `data.type` 和其他结构字段，只修改表单对应的数据：

```ts
function saveNodeConfig() {
  const approverIds = draftApprovers.value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  nodes.value = nodes.value.map((node) => {
    if (node.id !== selectedNodeId.value || !node.data) return node;
    return {
      ...node,
      data: {
        ...node.data,
        label: draftLabel.value,
        config: { ...node.data.config, approverIds },
      },
    };
  });
}
```

普通业务节点会展示新的 `label` 和 `description`。开始、结束、分支容器以及条件卡片使用内置标题；条件的业务表达式应展示在自己的配置面板中。

## 处理删除与切换

用 `computed` 根据当前节点数组查找选中节点。节点被删除后，查找结果会变为 `undefined`，此时隐藏配置表单，避免把旧草稿提交给已不存在的节点。

如果表单内嵌对象或数组，打开表单时应复制数据作为草稿，保存时再回写，避免“取消”操作已经修改原数据。可以对可序列化配置使用 `JSON.parse(JSON.stringify(config))` 创建副本。

可运行的完整表单见[交互示例](../examples/)，源码位于 `apps/docs/examples/WorkflowExample.vue`。示例也展示了保存草稿和恢复流程。
