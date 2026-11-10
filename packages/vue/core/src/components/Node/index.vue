<template>
  <Start v-if="data?.type === WORKFLOW_NODE_TYPE.START" />
  <Add
    v-else-if="data?.type === WORKFLOW_NODE_TYPE.ADD"
    :allow-exit-loop="allowExitLoop"
    @add-node="emit('addNode', $event)"
  />
  <End v-else-if="data?.type === WORKFLOW_NODE_TYPE.END" />
  <Branch
    v-else-if="data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH"
    :readonly="readonly"
    :deletable="deletable"
    @click="emit('click', $event)"
    @add-branch="emit('addBranch', $event)"
    @delete="emit('delete', $event)"
  />
  <Common
    v-else
    :title="data?.label"
    :type="data?.type"
    :description="data?.description"
    :condition-index="data?.conditionIndex"
    :is-default-condition="data?.isDefaultCondition"
    :readonly="readonly"
    :deletable="deletable"
    @click="emit('click', $event)"
    @delete="emit('delete', $event)"
  />
</template>

<script setup lang="ts">
import Start from "./modules/start.vue";
import Add from "./modules/add/index.vue";
import End from "./modules/end.vue";
import Branch from "./modules/branch.vue";
import Common from "./modules/common.vue";
import { WORKFLOW_NODE_TYPE } from "../../utils";
import type { AddNodeOption } from "../../utils/add-node";
import type { NodeData } from "../../types";

const {
  data,
  deletable,
  allowExitLoop,
  readonly = false,
} = defineProps<{
  data: NodeData;
  deletable: boolean;
  allowExitLoop: boolean;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent | KeyboardEvent];
  addNode: [option: AddNodeOption];
  addBranch: [event: MouseEvent];
  delete: [event: MouseEvent];
}>();
</script>

<style lang="scss" scoped></style>
