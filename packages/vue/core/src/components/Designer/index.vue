<template>
  <div class="index-container">
    <VueFlow
      :nodes="renderNodes"
      :edges="renderEdges"
      :id="id"
      fit-view-on-init
      :delete-key-code="null"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :edges-updatable="false"
    >
      <template #[`node-${WORKFLOW_NODE_SLOT}`]="nodeProps">
        <Node
          :data="nodeProps.data"
          :deletable="canDeleteNode(nodesData, nodeProps.id)"
          :allow-exit-loop="isInsideLoop(nodesData, nodeProps.id)"
          @add-node="handleAddNode(nodeProps.id, $event)"
          @add-branch="handleAddBranch(nodeProps.id)"
          @delete="handleDelete(nodeProps.id)"
          @click="handleNodeClick(nodeProps.id)"
        />
      </template>
      <template #[`edge-${WORKFLOW_NODE_SLOT}`]="edgeProps">
        <Edge
          :source-x="edgeProps.sourceX"
          :source-y="edgeProps.sourceY"
          :targetX="edgeProps.targetX"
          :targetY="edgeProps.targetY"
          :data="edgeProps.data"
          :loop-route="layout.loopRoutes.get(edgeProps.target)"
        />
      </template>
    </VueFlow>
  </div>
</template>

<script setup lang="ts" generic="TConfig = unknown">
import { VueFlow } from "@vue-flow/core";
import "../../style.css";
import Node from "../Node/index.vue";
import Edge from "../Edge/index.vue";
import { WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "../../utils/constant";
import { layoutWorkflow } from "../../utils/auto-layout-node-position";
import {
  insertNode,
  insertConditionBranch,
  isInsideLoop,
  type AddNodeOption,
} from "../../utils/add-node";
import { canDeleteNode, removeNode } from "../../utils/delete-node";
import { computed } from "vue";
import type { VueFlowNodeProps, WorkflowNodeClickEvent } from "../../types.ts";
import { autoCalEdge } from "../../utils/auto-cal-edge.ts";

const { id } = defineProps<{
  id: string;
}>();

const nodesData = defineModel<VueFlowNodeProps<TConfig>[]>("nodes", {
  required: true,
});

const emit = defineEmits<{
  nodeClick: [payload: WorkflowNodeClickEvent];
}>();

const layout = computed(() => layoutWorkflow(nodesData.value));
const renderNodes = computed(() => layout.value.nodes);
const renderEdges = computed(() => autoCalEdge(nodesData.value));

function handleAddNode(nodeId: string, option: AddNodeOption) {
  nodesData.value = insertNode(nodesData.value, nodeId, option);
}

function handleAddBranch(nodeId: string) {
  nodesData.value = insertConditionBranch(nodesData.value, nodeId);
}

function handleDelete(nodeId: string) {
  if (!canDeleteNode(nodesData.value, nodeId)) return;
  nodesData.value = removeNode(nodesData.value, nodeId);
}

function handleNodeClick(nodeId: string) {
  const node = nodesData.value.find((entry) => entry.id === nodeId);
  if (!node?.data) return;
  const type = node.data.type;
  if (
    type === WORKFLOW_NODE_TYPE.ADD ||
    type === WORKFLOW_NODE_TYPE.START ||
    type === WORKFLOW_NODE_TYPE.END
  )
    return;
  emit("nodeClick", { id: node.id, type });
}
</script>

<style scoped>
.index-container {
  height: 100%;
}
</style>
