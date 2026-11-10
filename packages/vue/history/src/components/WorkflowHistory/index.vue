<template>
  <div class="workflow-history" :aria-busy="loading">
    <header v-if="title || $slots.header" class="workflow-history__header">
      <slot name="header" :title="title" :records="records">
        <h2 class="workflow-history__heading">{{ title }}</h2>
      </slot>
      <button
        v-if="collapsible && !loading && records.length"
        class="workflow-history__toggle-all"
        type="button"
        @click="setExpanded(allExpanded ? [] : records.map((record) => record.id))"
      >
        {{ allExpanded ? "全部收起" : "全部展开" }}
      </button>
    </header>

    <div v-if="loading" class="workflow-history__placeholder" role="status" aria-live="polite">
      <slot name="loading">正在加载流程记录…</slot>
    </div>
    <div v-else-if="!records.length" class="workflow-history__placeholder" role="status">
      <slot name="empty">{{ emptyText }}</slot>
    </div>
    <WorkflowTimeline v-else>
      <WorkflowTimelineItem
        v-for="record in records"
        :key="record.id"
        :title="record.title"
        :type="getRecordStatus(record.status).type"
        :collapsible="collapsible"
        :expanded="isExpanded(record)"
        @update:expanded="setRecordExpanded(record, $event)"
      >
        <template #title>
          <span class="workflow-history__identity">
            <WorkflowAvatar
              v-if="record.operator"
              :text="record.operator.name"
              :src="record.operator.avatar"
            />
            <span class="workflow-history__summary-main">
              <span class="workflow-history__record-title">
                <slot name="title" :record="record">{{ record.title }}</slot>
              </span>
              <span v-if="record.operator || record.time" class="workflow-history__meta">
                <span v-if="record.operator">{{ record.operator.name }}</span>
                <time v-if="record.time" :datetime="record.datetime">{{ record.time }}</time>
              </span>
            </span>
          </span>
        </template>
        <template #status>
          <slot name="status" :record="record" :status="getRecordStatus(record.status).type">
            <WorkflowTimelineTag :type="record.status" :text="record.statusText" />
          </slot>
        </template>
        <slot name="content" :record="record">
          <WorkflowHistoryDetails
            :record="record"
            @attachment-click="emit('attachmentClick', $event)"
          >
            <template v-if="$slots.operator" #operator="scope">
              <slot name="operator" v-bind="scope" />
            </template>
            <template v-if="$slots.opinion" #opinion="scope">
              <slot name="opinion" v-bind="scope" />
            </template>
            <template v-if="$slots.attachment" #attachment="scope">
              <slot name="attachment" v-bind="scope" />
            </template>
          </WorkflowHistoryDetails>
        </slot>
      </WorkflowTimelineItem>
    </WorkflowTimeline>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type VNode } from "vue";
import type {
  WorkflowHistoryAttachment,
  WorkflowHistoryAttachmentEvent,
  WorkflowHistoryProps,
  WorkflowHistoryRecord,
  WorkflowHistoryStatus,
  WorkflowHistoryToggleEvent,
  WorkflowHistoryUser,
} from "../../types";
import { getRecordStatus } from "../../utils";
import WorkflowAvatar from "../WorkflowAvatar/index.vue";
import WorkflowTimeline from "../WorkflowTimeline/index.vue";
import WorkflowTimelineItem from "../WorkflowTimelineItem/index.vue";
import WorkflowTimelineTag from "../WorkflowTimelineTag/index.vue";
import WorkflowHistoryDetails from "./Details.vue";

defineOptions({ name: "WorkflowHistory" });

const {
  records = [],
  title = "流程记录",
  loading = false,
  emptyText = "暂无流程记录",
  collapsible = true,
  defaultExpanded = true,
  expandedKeys,
} = defineProps<WorkflowHistoryProps>();

const emit = defineEmits<{
  "update:expandedKeys": [keys: string[]];
  toggle: [payload: WorkflowHistoryToggleEvent];
  attachmentClick: [payload: WorkflowHistoryAttachmentEvent];
}>();

defineSlots<{
  default?: () => VNode[];
  header?: (props: { title: string; records: readonly WorkflowHistoryRecord[] }) => VNode[];
  loading?: () => VNode[];
  empty?: () => VNode[];
  title?: (props: { record: WorkflowHistoryRecord }) => VNode[];
  status?: (props: { record: WorkflowHistoryRecord; status: WorkflowHistoryStatus }) => VNode[];
  content?: (props: { record: WorkflowHistoryRecord }) => VNode[];
  operator?: (props: { record: WorkflowHistoryRecord; operator: WorkflowHistoryUser }) => VNode[];
  opinion?: (props: { record: WorkflowHistoryRecord }) => VNode[];
  attachment?: (props: {
    record: WorkflowHistoryRecord;
    attachment: WorkflowHistoryAttachment;
  }) => VNode[];
}>();

const expansion = ref(new Map<string, boolean>());
const allExpanded = computed(() => records.every(isExpanded));

function isExpanded(record: WorkflowHistoryRecord) {
  if (!collapsible) return true;
  return expandedKeys === undefined
    ? (expansion.value.get(record.id) ?? defaultExpanded)
    : expandedKeys.includes(record.id);
}

function setExpanded(keys: string[]) {
  const selected = new Set(keys);
  expansion.value = new Map(records.map((record) => [record.id, selected.has(record.id)]));
  emit("update:expandedKeys", keys);
}

function setRecordExpanded(record: WorkflowHistoryRecord, expanded: boolean) {
  if (!collapsible) return;
  setExpanded(
    records
      .filter((item) => (item.id === record.id ? expanded : isExpanded(item)))
      .map((item) => item.id),
  );
  emit("toggle", { record, expanded });
}
</script>
