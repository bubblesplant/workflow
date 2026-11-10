<template>
  <main class="playground">
    <div class="workflow-views">
      <section class="workflow-panel" aria-label="流程编辑">
        <header class="workflow-panel__header">
          <h2>流程编辑</h2>
          <p>{{ readonly ? "已开启只读模式" : "添加节点或点击卡片编辑配置" }}</p>
        </header>
        <div class="workflow-panel__canvas">
          <Designer
            id="workflow-designer"
            v-model:nodes="nodes"
            :readonly="readonly"
            @node-click="handleNodeClick"
          />
        </div>
      </section>
      <section class="workflow-panel" aria-label="只读预览">
        <header class="workflow-panel__header">
          <h2>只读预览</h2>
          <p>实时同步流程结构与节点配置</p>
        </header>
        <div class="workflow-panel__canvas">
          <Designer id="workflow-preview" :nodes="nodes" readonly />
        </div>
      </section>
    </div>
    <aside class="configuration">
      <h1>节点业务配置</h1>
      <label class="readonly-toggle"><input v-model="readonly" type="checkbox" />只读模式</label>
      <form v-if="selectedNode && !readonly" @submit.prevent="saveNodeConfig">
        <p>{{ selectedNode.id }} · {{ selectedNode.data?.type }}</p>
        <label>节点名称<input v-model="draftLabel" required /></label>
        <label>节点说明<input v-model="draftDescription" /></label>
        <label
          >业务配置（JSON）<textarea v-model="draftConfig" rows="10" spellcheck="false" />
        </label>
        <p v-if="configError" role="alert">{{ configError }}</p>
        <button type="submit">保存节点配置</button>
      </form>
      <p v-else>{{ readonly ? "当前仅可查看流程。" : "添加并点击业务节点，在这里编辑配置。" }}</p>
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
} from "@bubblesjs/workflow-vue-core";

type BusinessConfig = Record<string, unknown>;
const nodes = ref<WorkflowNode<BusinessConfig>[]>(createDefaultNodes());
const readonly = ref(false);
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
  if (readonly.value) return;
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

.workflow-views {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: 0;
  min-height: 0;
}

.workflow-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
}

.workflow-panel + .workflow-panel {
  border-left: 1px solid #e5e9f0;
}

.workflow-panel__header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e9f0;
  color: #465675;
  font:
    14px/1.6 system-ui,
    sans-serif;
}

.workflow-panel__header h2 {
  font-size: 16px;
}

.workflow-panel__header p {
  color: #75829b;
  font-size: 12px;
}

.workflow-panel__canvas {
  min-width: 0;
  min-height: 0;
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

.readonly-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.readonly-toggle input {
  width: auto;
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

@media (max-width: 1100px) {
  .workflow-views {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }

  .workflow-panel + .workflow-panel {
    border-top: 1px solid #e5e9f0;
    border-left: 0;
  }
}

@media (max-width: 760px) {
  .playground {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    min-height: 100%;
  }

  .workflow-views {
    height: 100svh;
    min-height: 720px;
  }

  .configuration {
    border-top: 1px solid #e5e9f0;
    border-left: 0;
  }
}
</style>
