<template>
  <li
    class="workflow-history__item workflow-timeline-item"
    :class="`workflow-history__item--${status.type}`"
  >
    <slot name="dot" :expanded="isExpanded" :toggle="toggle">
      <WorkflowTimelineDot :type="status.type" />
    </slot>
    <div class="workflow-history__summary">
      <div class="workflow-timeline-item__title">
        <slot name="title" :expanded="isExpanded" :toggle="toggle">
          <span class="workflow-history__record-title">{{ title }}</span>
        </slot>
      </div>
      <span class="workflow-history__summary-end">
        <slot name="status" :expanded="isExpanded" :toggle="toggle">
          <WorkflowTimelineTag :type="status.type" />
        </slot>
        <button
          v-if="collapsible"
          class="workflow-history__toggle"
          type="button"
          :aria-label="`${isExpanded ? '收起' : '展开'}${title || '流程节点'}`"
          :aria-expanded="isExpanded"
          :aria-controls="contentId"
          @click="toggle"
        >
          <svg
            class="workflow-history__chevron"
            :class="{ 'workflow-history__chevron--expanded': isExpanded }"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="m6 4 4 4-4 4" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </button>
      </span>
    </div>
    <div v-show="isExpanded" :id="contentId" class="workflow-history__details">
      <slot :expanded="isExpanded" :toggle="toggle" />
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, ref, useId, type VNode } from "vue";
import type { WorkflowTimelineItemProps, WorkflowTimelineItemSlotProps } from "../../types";
import { getRecordStatus } from "../../utils";
import WorkflowTimelineDot from "../WorkflowTimelineDot/index.vue";
import WorkflowTimelineTag from "../WorkflowTimelineTag/index.vue";

defineOptions({ name: "WorkflowTimelineItem" });
const {
  title,
  type,
  collapsible = true,
  defaultExpanded = true,
  expanded = undefined,
} = defineProps<WorkflowTimelineItemProps>();
const emit = defineEmits<{
  "update:expanded": [expanded: boolean];
  toggle: [expanded: boolean];
}>();
defineSlots<{
  default?: (props: WorkflowTimelineItemSlotProps) => VNode[];
  title?: (props: WorkflowTimelineItemSlotProps) => VNode[];
  status?: (props: WorkflowTimelineItemSlotProps) => VNode[];
  dot?: (props: WorkflowTimelineItemSlotProps) => VNode[];
}>();

const contentId = useId();
const localExpanded = ref(defaultExpanded);
const status = computed(() => getRecordStatus(type));
const isExpanded = computed(() => !collapsible || (expanded ?? localExpanded.value));

function toggle() {
  if (!collapsible) return;
  const next = !isExpanded.value;
  if (expanded === undefined) localExpanded.value = next;
  emit("update:expanded", next);
  emit("toggle", next);
}
</script>
