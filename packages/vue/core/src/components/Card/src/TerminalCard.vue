<template>
  <div
    class="workflow-terminal-card"
    :style="{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }"
  >
    <span class="workflow-terminal-card__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span class="workflow-terminal-card__label">
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
import { WORKFLOW_NODE_DIMENSIONS } from "../../../utils/node-dimensions";

const dimensions = WORKFLOW_NODE_DIMENSIONS.terminal;
</script>

<style scoped>
.workflow-terminal-card {
  display: inline-flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 6px 20px rgb(0 0 0 / 12%);
  color: #1f2329;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  vertical-align: middle;
  cursor: default;
}

.workflow-terminal-card__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: #3461c8;
}

.workflow-terminal-card__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
