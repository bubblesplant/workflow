<template>
  <Start v-if="data.type === WORKFLOW_NODE_TYPE.START" />
  <Add v-if="data.type === WORKFLOW_NODE_TYPE.ADD" />
  <Common v-if="data.type === WORKFLOW_NODE_TYPE.COMMON" />
</template>

<script setup lang="ts">
import type { NodeData } from "../../types";
import Start from "./modules/start.vue";
import Add from "./modules/add.vue";
import Common from "./modules/common.vue";
import { WORKFLOW_NODE_TYPE } from "../../utils/index.ts";

const { data } = defineProps<{
  data: NodeData;
}>();
</script>

<style lang="scss" scoped></style>
