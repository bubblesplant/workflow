<template>
  <span
    class="workflow-history__dot workflow-timeline-dot"
    :class="`workflow-history__dot--${status.type}`"
    aria-hidden="true"
  >
    <slot>{{ status.icon }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed, type VNode } from "vue";
import type { WorkflowTimelineDotProps } from "../../types";
import { getRecordStatus } from "../../utils";

defineOptions({ name: "WorkflowTimelineDot" });

const { type } = defineProps<WorkflowTimelineDotProps>();

defineSlots<{
  default?: () => VNode[];
}>();

const status = computed(() => getRecordStatus(type));
</script>
