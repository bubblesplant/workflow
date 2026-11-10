<template>
  <span
    class="workflow-history__status workflow-timeline-tag"
    :class="`workflow-history__status--${status.type}`"
  >
    <slot>{{ text || status.text }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed, type VNode } from "vue";
import type { WorkflowTimelineTagProps } from "../../types";
import { getRecordStatus } from "../../utils";

defineOptions({ name: "WorkflowTimelineTag" });

const { type, text } = defineProps<WorkflowTimelineTagProps>();

defineSlots<{
  default?: () => VNode[];
}>();

const status = computed(() => getRecordStatus(type));
</script>
