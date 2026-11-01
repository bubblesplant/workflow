<template>
  <BaseEdge :style="edgeStyle" :path="path" />
</template>

<script setup lang="ts">
import { BaseEdge } from "@vue-flow/core";
import { computed } from "vue";

const { sourceX, sourceY, targetX, targetY, data } = defineProps<{
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data: any;
}>();

const path = computed(() => {
  if (data?.type === "loop") {
    return `M ${sourceX} ${sourceY + 50} L ${sourceX + 100} ${sourceY + 50} L ${sourceX + 100} ${sourceY} L ${targetX} ${targetY}`;
  }
  if (Math.abs(sourceX - targetX) < 1) return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  if (Math.abs(sourceY - targetY) < 1) return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  const middle = sourceY + (targetY - sourceY) / 2;
  return `M ${sourceX} ${sourceY} V ${middle} H ${targetX} V ${targetY}`;
});

const edgeStyle = {
  strokeWidth: 1.5,
  stroke: "#cfd5df",
};
</script>

<style lang="scss" scoped></style>
