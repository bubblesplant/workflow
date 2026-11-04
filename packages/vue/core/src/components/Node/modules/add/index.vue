<template>
  <AddNodeTooltip :allow-exit-loop="allowExitLoop" @add-node="emit('addNode', $event)">
    <button
      class="workflow-add-node nodrag nopan"
      type="button"
      aria-label="添加节点"
      :style="{
        width: `${WORKFLOW_NODE_DIMENSIONS.add.width}px`,
        height: `${WORKFLOW_NODE_DIMENSIONS.add.height}px`,
      }"
    >
      <span class="workflow-add-node__content">
        <img :src="addIcon" width="20" height="20" alt="" aria-hidden="true" />
      </span>
    </button>
  </AddNodeTooltip>
</template>

<script setup lang="ts">
import addIcon from "../../../../assets/icon/svg/add.svg?inline";
import AddNodeTooltip from "./tooltip.vue";
import { WORKFLOW_NODE_DIMENSIONS } from "../../../../utils/node-dimensions";
import type { AddNodeOption } from "../../../../utils/add-node";

const { allowExitLoop } = defineProps<{
  allowExitLoop: boolean;
}>();

const emit = defineEmits<{
  addNode: [option: AddNodeOption];
}>();
</script>

<style scoped>
.workflow-add-node {
  display: inline-flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #fff;
  vertical-align: middle;
  cursor: pointer;
}

.workflow-add-node__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: #ff9c2b;
  transition: transform 160ms ease;
}

.workflow-add-node:hover .workflow-add-node__content,
.workflow-add-node:focus-visible .workflow-add-node__content {
  transform: scale(1.1);
}

.workflow-add-node:focus-visible {
  outline: 2px solid #ff9c2b;
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .workflow-add-node__content {
    transition: none;
  }
}
</style>
