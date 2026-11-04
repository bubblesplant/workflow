<template>
  <main class="playground">
    <Designer id="workflow-designer" v-model:nodes="nodes" @node-click="handleNodeClick" />
    <aside class="configuration">
      <h1>节点业务配置</h1>
      <form v-if="selectedNode" @submit.prevent="saveNodeConfig">
        <p>{{ selectedNode.id }} · {{ selectedNode.data?.type }}</p>
        <label>节点名称<input v-model="draftLabel" required /></label>
        <label>节点说明<input v-model="draftDescription" /></label>
        <label
          >业务配置（JSON）<textarea v-model="draftConfig" rows="10" spellcheck="false" />
        </label>
        <p v-if="configError" role="alert">{{ configError }}</p>
        <button type="submit">保存节点配置</button>
      </form>
      <p v-else>添加并点击业务节点，在这里编辑配置。</p>
      <details>
        <summary>查看 nodes 数据（{{ (nodes || []).length }} 个节点）</summary>
        <pre>{{ JSON.stringify(nodes || [], null, 2) }}</pre>
      </details>
    </aside>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  createDefaultNodes,
  Designer,
  type WorkflowNode,
  type WorkflowNodeClickEvent,
} from "@workflow/vue-core";

type BusinessConfig = Record<string, unknown>;
const nodes = ref<WorkflowNode<BusinessConfig>[]>(createDefaultNodes());
const selectedNodeId = ref("");
const selectedNode = computed(() =>
  (nodes.value || []).find((node) => node.id === selectedNodeId.value),
);
const draftLabel = ref("");
const draftDescription = ref("");
const draftConfig = ref("{}");
const configError = ref("");

function handleNodeClick({ id }: WorkflowNodeClickEvent) {
  selectedNodeId.value = id;
  draftLabel.value = selectedNode.value?.data?.label ?? "";
  draftDescription.value = selectedNode.value?.data?.description ?? "";
  draftConfig.value = JSON.stringify(selectedNode.value?.data?.config ?? {}, null, 2);
  configError.value = "";
}

function saveNodeConfig() {
  configError.value = "";
  let config: unknown;
  try {
    config = JSON.parse(draftConfig.value);
  } catch {
    configError.value = "请输入有效的 JSON 对象。";
    return;
  }
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    configError.value = "业务配置应为 JSON 对象。";
    return;
  }
  const businessConfig = config as BusinessConfig;
  nodes.value = (nodes.value || []).map((node) =>
    node.id === selectedNodeId.value
      ? {
          ...node,
          data: {
            ...node.data!,
            label: draftLabel.value,
            description: draftDescription.value,
            config: businessConfig,
          },
        }
      : node,
  );
}
</script>

<style scoped>
.playground {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  height: 100%;
}

.configuration {
  padding: 20px;
  overflow: auto;
  border-left: 1px solid #e5e9f0;
  color: #465675;
  font:
    14px/1.6 system-ui,
    sans-serif;
}

h1 {
  margin-bottom: 16px;
  font-size: 18px;
}

form,
label {
  display: grid;
  gap: 8px;
}

form {
  gap: 16px;
}

input,
textarea,
button {
  width: 100%;
  padding: 8px;
  border: 1px solid #d6dce8;
  border-radius: 6px;
  font: inherit;
}

textarea,
pre {
  font-family: monospace;
}

button,
summary {
  cursor: pointer;
}

details {
  margin-top: 24px;
}

pre {
  overflow: auto;
  font-size: 12px;
}

[role="alert"] {
  color: #bc3030;
}
</style>
