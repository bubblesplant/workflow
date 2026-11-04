<template>
  <CommonCard
    :title="nodeTitle"
    :description="nodeDescription"
    :color="nodeConfig.color"
    :show-arrow="!isFallbackCondition"
    :deletable="deletable"
    @click="emit('click', $event)"
    @delete="emit('delete', $event)"
  >
    <template #icon>
      <img :src="nodeConfig.icon" width="20" height="20" alt="" />
    </template>
  </CommonCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CommonCard from "../../Card/src/CommonCard.vue";
import { WORKFLOW_NODE_TYPE } from "../../../utils";
import { WORKFLOW_NODE_CONFIG, type CommonNodeType } from "../../../utils/node-config";

const {
  title,
  type = WORKFLOW_NODE_TYPE.COMMON,
  description = "",
  conditionIndex = 1,
  isDefaultCondition = false,
  deletable = true,
} = defineProps<{
  title?: string;
  type?: CommonNodeType;
  description?: string;
  conditionIndex?: number;
  isDefaultCondition?: boolean;
  deletable?: boolean;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
  delete: [event: MouseEvent];
}>();

const isCondition = computed(() => type === WORKFLOW_NODE_TYPE.CONDITION);
const isFallbackCondition = computed(() => isCondition.value && isDefaultCondition);
const nodeConfig = computed(() => WORKFLOW_NODE_CONFIG[type]);

const nodeTitle = computed(() => {
  if (!isCondition.value) return title;
  return isFallbackCondition.value ? "其他" : `条件规则${conditionIndex}`;
});

const nodeDescription = computed(() => {
  if (!isCondition.value) return description;
  return isFallbackCondition.value ? "未满足其他条件时进入此分支" : "点击查看条件规则";
});
</script>

<style scoped></style>
