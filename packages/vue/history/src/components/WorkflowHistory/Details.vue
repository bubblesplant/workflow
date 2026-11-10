<template>
  <dl class="workflow-history__fields">
    <div v-if="record.operator" class="workflow-history__field">
      <dt>操作人</dt>
      <dd>
        <slot name="operator" :record="record" :operator="record.operator">
          {{ record.operator.name }}
          <span v-if="record.operator.description" class="workflow-history__description">
            {{ record.operator.description }}
          </span>
        </slot>
      </dd>
    </div>
    <div v-for="(field, index) in record.fields" :key="index" class="workflow-history__field">
      <dt>{{ field.label }}</dt>
      <dd>{{ formatFieldValue(field.value) }}</dd>
    </div>
    <div class="workflow-history__field">
      <dt>{{ record.opinionLabel || "处理意见" }}</dt>
      <dd :class="{ 'workflow-history__muted': !record.opinion }">
        <slot name="opinion" :record="record">
          {{
            record.opinion ||
            (["pending", "processing"].includes(getRecordStatus(record.status).type)
              ? "等待处理，暂无审批意见"
              : "未填写审批意见")
          }}
        </slot>
      </dd>
    </div>
    <div v-if="record.attachments?.length" class="workflow-history__field">
      <dt>{{ record.attachmentsLabel || "附件" }}</dt>
      <dd>
        <ul class="workflow-history__attachments">
          <li v-for="attachment in record.attachments" :key="attachment.id">
            <slot name="attachment" :record="record" :attachment="attachment">
              <component
                :is="getAttachmentUrl(attachment.url) ? 'a' : 'button'"
                class="workflow-history__attachment"
                :href="getAttachmentUrl(attachment.url)"
                :type="getAttachmentUrl(attachment.url) ? undefined : 'button'"
                :target="getAttachmentUrl(attachment.url) ? '_blank' : undefined"
                :rel="getAttachmentUrl(attachment.url) ? 'noopener noreferrer' : undefined"
                @click="emit('attachmentClick', { record, attachment, event: $event })"
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M9 2H4v12h9V6L9 2Zm0 0v4h4M6 9h5M6 11h3"
                    stroke="currentColor"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>{{ attachment.name }}</span>
                <span v-if="attachment.size" class="workflow-history__file-size">
                  {{ attachment.size }}
                </span>
              </component>
            </slot>
          </li>
        </ul>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { VNode } from "vue";
import type {
  WorkflowHistoryAttachment,
  WorkflowHistoryAttachmentEvent,
  WorkflowHistoryRecord,
  WorkflowHistoryUser,
} from "../../types";
import { formatFieldValue, getAttachmentUrl, getRecordStatus } from "../../utils";

defineOptions({ name: "WorkflowHistoryDetails" });
defineProps<{ record: WorkflowHistoryRecord }>();
const emit = defineEmits<{ attachmentClick: [payload: WorkflowHistoryAttachmentEvent] }>();
defineSlots<{
  operator?: (props: { record: WorkflowHistoryRecord; operator: WorkflowHistoryUser }) => VNode[];
  opinion?: (props: { record: WorkflowHistoryRecord }) => VNode[];
  attachment?: (props: {
    record: WorkflowHistoryRecord;
    attachment: WorkflowHistoryAttachment;
  }) => VNode[];
}>();
</script>
