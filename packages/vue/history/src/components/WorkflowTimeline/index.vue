<template>
  <ol class="workflow-history__list workflow-timeline" :aria-label="label">
    <slot />
  </ol>
</template>

<script setup lang="ts">
import type { VNode } from "vue";
import type { WorkflowTimelineProps } from "../../types";

defineOptions({ name: "WorkflowTimeline" });
const { label = "流程流转记录" } = defineProps<WorkflowTimelineProps>();
defineSlots<{ default?: () => VNode[] }>();
</script>
