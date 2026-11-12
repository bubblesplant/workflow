<template>
  <div class="workflow-example">
    <div class="example-toolbar">
      <label
        >预置流程<select v-model="preset" @change="reset">
          <option value="approval">审批流程</option>
          <option value="branch">条件分支</option>
          <option value="loop">循环流程</option>
        </select></label
      >
      <div class="example-toolbar-actions">
        <button type="button" @click="saveDraft">保存草稿</button
        ><button type="button" :disabled="!draft" @click="restoreDraft">恢复草稿</button
        ><button type="button" @click="reset">重置流程</button>
      </div>
    </div>
    <div class="example-canvas">
      <Designer
        :key="canvasKey"
        id="docs-workflow-example"
        v-model:nodes="nodes"
        @node-click="selectNode"
      />
    </div>
    <div class="example-inspector">
      <form v-if="selectedNode" @submit.prevent="saveConfig">
        <div class="example-inspector-heading">
          <strong>节点配置</strong><code>{{ selectedNode.id }}</code>
        </div>
        <div class="example-fields">
          <label>节点名称<input v-model="draftLabel" required /></label
          ><label>节点说明<input v-model="draftDescription" /></label>
        </div>
        <label
          >业务配置（JSON 对象）<textarea v-model="draftConfig" rows="5" spellcheck="false" />
        </label>
        <p v-if="error" class="example-error" role="alert">{{ error }}</p>
        <button class="example-save" type="submit">保存节点配置</button>
      </form>
      <p v-else class="example-hint">点击画布中的业务节点，在这里编辑配置。</p>
    </div>
    <p class="example-status" role="status" aria-live="polite">{{ status }}</p>
    <details class="example-data">
      <summary>查看节点 JSON（{{ nodes.length }} 个节点）</summary>
      <pre>{{ JSON.stringify(nodes, null, 2) }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Designer,
  WORKFLOW_NODE_TYPE as T,
  type WorkflowNode,
  type WorkflowNodeClickEvent,
  type WorkflowNodeType,
} from "@bubblesjs/workflow-vue-core";
import "@bubblesjs/workflow-vue-core/style.css";

type BusinessConfig = Record<string, unknown>;
type Preset = "approval" | "branch" | "loop";

const preset = ref<Preset>("approval");
const nodes = ref<WorkflowNode<BusinessConfig>[]>(createPreset("approval"));
const canvasKey = ref(0);
const selectedId = ref("");
const selectedNode = computed(() => nodes.value.find((node) => node.id === selectedId.value));
const draftLabel = ref("");
const draftDescription = ref("");
const draftConfig = ref("{}");
const error = ref("");
const status = ref("流程已就绪。试着添加节点或点击业务卡片。");
const draft = ref<{ preset: Preset; json: string }>();

function node(
  id: string,
  type: WorkflowNodeType,
  label: string,
  parentNode?: string,
): WorkflowNode<BusinessConfig> {
  return { id, ...(parentNode ? { parentNode } : {}), data: { type, label } };
}

function createPreset(kind: Preset): WorkflowNode<BusinessConfig>[] {
  const start = node("start", T.START, "发起");
  const before = node("add-before", T.ADD, "添加节点");
  const after = node("add-after", T.ADD, "添加节点");
  const end = node("end", T.END, "结束");
  if (kind === "branch") {
    const condition = node("condition-1", T.CONDITION, "条件规则1", "branch");
    condition.data = {
      ...condition.data!,
      conditionIndex: 1,
      config: { expression: "amount > 1000" },
    };
    const fallback = node("fallback", T.CONDITION, "其他", "branch");
    fallback.data = { ...fallback.data!, isDefaultCondition: true };
    return [
      start,
      before,
      node("branch", T.CONDITION_BRANCH, "条件分支"),
      condition,
      node("condition-add", T.ADD, "添加节点", condition.id),
      fallback,
      node("fallback-add", T.ADD, "添加节点", fallback.id),
      after,
      end,
    ];
  }
  if (kind === "loop") {
    return [
      start,
      before,
      node("loop", T.LOOP, "逐项处理"),
      node("loop-add-before", T.ADD, "添加节点", "loop"),
      node("loop-fill", T.FILL, "填写处理结果", "loop"),
      node("loop-add-after", T.ADD, "添加节点", "loop"),
      after,
      end,
    ];
  }
  const approval = node("approval", T.APPROVAL, "主管审批");
  approval.data = {
    ...approval.data!,
    description: "由直属主管审批费用申请",
    config: { approverIds: ["user-1"] },
  };
  return [start, before, approval, after, end];
}

function reset() {
  nodes.value = createPreset(preset.value);
  selectedId.value = "";
  error.value = "";
  canvasKey.value++;
  status.value = "已载入预置流程。";
}

function selectNode({ id }: WorkflowNodeClickEvent) {
  selectedId.value = id;
  draftLabel.value = selectedNode.value?.data?.label ?? "";
  draftDescription.value = selectedNode.value?.data?.description ?? "";
  draftConfig.value = JSON.stringify(selectedNode.value?.data?.config ?? {}, null, 2);
  error.value = "";
}

function saveConfig() {
  let config: unknown;
  try {
    config = JSON.parse(draftConfig.value);
  } catch {
    error.value = "JSON 格式有误，请检查引号、逗号和括号。";
    return;
  }
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    error.value = '业务配置需要是 JSON 对象，例如 { "approverIds": [] }。';
    return;
  }
  const businessConfig = config as BusinessConfig;
  nodes.value = nodes.value.map((entry) =>
    entry.id === selectedId.value && entry.data
      ? {
          ...entry,
          data: {
            ...entry.data,
            label: draftLabel.value,
            description: draftDescription.value,
            config: businessConfig,
          },
        }
      : entry,
  );
  error.value = "";
  status.value = "节点配置已保存。";
}

function saveDraft() {
  draft.value = { preset: preset.value, json: JSON.stringify(nodes.value) };
  status.value = "草稿已保存到本页内存，刷新后清空。";
}

function restoreDraft() {
  if (!draft.value) return;
  preset.value = draft.value.preset;
  // 只解析本组件生成的内存快照；外部 JSON 应先做结构和业务校验。
  nodes.value = JSON.parse(draft.value.json) as WorkflowNode<BusinessConfig>[];
  selectedId.value = "";
  error.value = "";
  canvasKey.value++;
  status.value = "已恢复保存的草稿。";
}
</script>

<style scoped>
.workflow-example {
  margin: 24px 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  font-size: 13px;
}
.example-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
}
.example-toolbar > label {
  display: flex;
  align-items: center;
  gap: 12px;
}
.example-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.workflow-example button,
.workflow-example select,
.workflow-example input,
.workflow-example textarea {
  border: 1px solid var(--vp-c-divider);
  border-radius: 5px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  padding: 6px 10px;
  font: inherit;
}
.workflow-example button {
  cursor: pointer;
}
.workflow-example button:hover {
  border-color: var(--vp-c-brand-1);
}
.workflow-example button:disabled {
  cursor: default;
  opacity: 0.4;
}
.workflow-example :is(button, input, select, textarea):focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
.example-canvas {
  height: 520px;
  background: #f8f9fc;
  color: #465675;
  background-image: radial-gradient(#dce0e9 1px, transparent 1px);
  background-size: 18px 18px;
}
.example-inspector {
  padding: 18px;
  border-top: 1px solid var(--vp-c-divider);
}
.example-inspector-heading {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
.example-inspector label {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
}
.example-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.workflow-example input,
.workflow-example textarea {
  width: 100%;
  min-width: 0;
}
.workflow-example textarea {
  resize: vertical;
  font-family: var(--vp-font-family-mono);
}
.workflow-example .example-save {
  background: var(--vp-c-brand-1);
  border-color: transparent;
  color: var(--vp-c-bg);
}
.workflow-example .example-hint {
  margin: 0;
  color: var(--vp-c-text-2);
}
.workflow-example .example-error {
  color: var(--vp-c-danger-1);
  font-size: 13px;
  margin: 8px 0;
}
.workflow-example .example-status {
  margin: 0;
  padding: 0 18px 16px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}
.example-data {
  border-top: 1px solid var(--vp-c-divider);
  padding: 14px 18px;
}
.example-data summary {
  cursor: pointer;
}
.example-data pre {
  max-height: 360px;
  overflow: auto;
  margin-top: 12px;
  font-size: 12px;
  line-height: 1.7;
}
@media (max-width: 600px) {
  .example-fields {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .example-canvas {
    height: 440px;
  }
}
</style>
