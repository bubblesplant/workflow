<template>
  <div class="index-container">
    <VueFlow :nodes="initialNodes" :edges="initialEdges" :id="id">
      <template #[`node-${WORKFLOW_NODE_SLOT}`]="nodeProps">
        <Node :data="nodeProps.data" />
      </template>
      <template #[`edge-${WORKFLOW_NODE_SLOT}`]="edgeProps">
        <Edge
          :source-x="edgeProps.sourceX"
          :source-y="edgeProps.sourceY"
          :targetX="edgeProps.targetX"
          :targetY="edgeProps.targetY"
          :data="edgeProps.data"
        />
      </template>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow, VueFlow } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import Node from "../Node/index.vue";
import Edge from "../Edge/index.vue";

import { WORKFLOW_NODE_TYPE, WORKFLOW_NODE_SLOT } from "../../utils";

const { id } = defineProps<{
  id: string;
}>();

const flow = useVueFlow(id);

const { addNode, addEdge, removeNode, removeEdge, nodes, edges } = flow;

const initialNodes = [
  {
    id: "1",
    type: WORKFLOW_NODE_SLOT,
    data: { label: "Node 1", type: WORKFLOW_NODE_TYPE.START },
    position: { x: 250, y: 0 },
  },
  {
    id: "2",
    type: WORKFLOW_NODE_SLOT,
    data: { label: "Node 2", type: WORKFLOW_NODE_TYPE.ADD },
    position: { x: 250, y: 200 },
  },
  {
    id: "3",
    type: WORKFLOW_NODE_SLOT,
    data: { label: "Node 3", type: WORKFLOW_NODE_TYPE.COMMON },
    position: { x: 250, y: 400 },
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: WORKFLOW_NODE_SLOT,
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: WORKFLOW_NODE_SLOT,
  },
  {
    id: "e2-1",
    source: "2",
    target: "1",
    type: WORKFLOW_NODE_SLOT,
    data: {
      type: "loop",
    },
  },
];
</script>

<style scoped>
.index-container {
  height: 100%;
}
</style>
