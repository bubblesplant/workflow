<template>
  <defs>
    <marker
      :id="arrowMarkerId"
      viewBox="0 0 8 16"
      :refX="8"
      :refY="8"
      markerUnits="userSpaceOnUse"
      :markerWidth="8"
      :markerHeight="16"
      orient="auto"
    >
      <path d="M 0 0 L 8 8 L 0 16 Z" :fill="edgeStyle.stroke" />
    </marker>
  </defs>
  <BaseEdge :style="edgeStyle" :path="path" :marker-end="markerEnd" />
</template>

<script setup lang="ts">
import { BaseEdge } from "@vue-flow/core";
import { computed, useId } from "vue";
import { WORKFLOW_EDGE_TYPE, WORKFLOW_NODE_TYPE } from "../../utils/constant";
import { getNodeDimensions, WORKFLOW_NODE_DIMENSIONS } from "../../utils/node-dimensions";
import type { LoopEdgeRoute } from "../../utils/auto-layout-node-position";

const { sourceX, sourceY, targetX, targetY, data, loopRoute } = defineProps<{
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data: any;
  loopRoute?: LoopEdgeRoute;
}>();

const arrowMarkerId = `workflow-arrow-${useId()}`;

const path = computed(() => {
  if (data?.type === WORKFLOW_EDGE_TYPE.LOOP) {
    const { edgeOffsetX, edgeOffsetY } = WORKFLOW_NODE_DIMENSIONS.loop;
    const { width, height } = getNodeDimensions(WORKFLOW_NODE_TYPE.LOOP);
    // Vue Flow 默认目标坐标位于卡片顶部中点，回线落在卡片右侧中点。
    const endX = targetX + width / 2;
    const endY = targetY + height / 2;
    // 同一循环的各分支在完整子树下方汇合，再沿预留的右侧通道返回。
    const bottom = loopRoute?.bottom ?? sourceY + edgeOffsetY;
    const right = loopRoute?.right ?? Math.max(sourceX, targetX) + edgeOffsetX;
    return `M ${sourceX} ${sourceY} V ${bottom} H ${right} V ${endY} H ${endX}`;
  }
  if (Math.abs(sourceX - targetX) < 1) return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  if (Math.abs(sourceY - targetY) < 1) return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  // 在目标前半个节点间距处汇合，避免短分支提前横穿较长的嵌套分支。
  const distanceY = targetY - sourceY;
  const offset = Math.min(WORKFLOW_NODE_DIMENSIONS.gap / 2, Math.abs(distanceY) / 2);
  const middle = targetY - Math.sign(distanceY) * offset;
  return `M ${sourceX} ${sourceY} V ${middle} H ${targetX} V ${targetY}`;
});

const defaultEdgeStyle = {
  strokeWidth: 1.5,
  stroke: "#cfd5df",
};

const edgeStyle = computed(() => {
  if (data?.type === WORKFLOW_EDGE_TYPE.LOOP) {
    return {
      ...defaultEdgeStyle,
      stroke: "#007bff",
    };
  }
  return defaultEdgeStyle;
});

const markerEnd = computed(() => {
  if (data?.type === WORKFLOW_EDGE_TYPE.LOOP) {
    return `url(#${arrowMarkerId})`;
  }
  return undefined;
});
</script>

<style lang="scss" scoped></style>
