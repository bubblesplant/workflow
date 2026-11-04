<template>
  <div
    class="workflow-branch-node"
    role="button"
    tabindex="0"
    aria-label="配置条件分支"
    :style="{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }"
    @click="emit('click', $event)"
    @keydown.enter.self.prevent="emit('click', $event)"
    @keydown.space.self.prevent="emit('click', $event)"
  >
    <span class="workflow-branch-node__icon" aria-hidden="true">
      <img :src="conditionBranchIcon" width="20" height="20" alt="" />
    </span>
    <span class="workflow-branch-node__title">{{ title }}</span>
    <button
      class="workflow-branch-node__add nodrag nopan"
      type="button"
      aria-label="添加分支"
      title="添加分支"
      @pointerdown.stop
      @keydown.stop
      @click.stop="emit('addBranch', $event)"
    >
      <img :src="addIcon" width="18" height="18" alt="" aria-hidden="true" />
    </button>
    <button
      v-if="deletable"
      class="workflow-branch-node__delete nodrag nopan"
      type="button"
      aria-label="删除条件分支"
      title="删除条件分支"
      @pointerdown.stop
      @keydown.stop
      @click.stop="confirmDelete"
    >
      <span class="workflow-branch-node__delete-icon" :style="deleteIconStyle" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import Modal from "antdv-next/dist/modal/index";
import addIcon from "../../../assets/icon/svg/add.svg?inline";
import conditionBranchIcon from "../../../assets/icon/svg/condition-branch.svg?inline";
import deleteIcon from "../../../assets/icon/svg/delete.svg?inline";
import { WORKFLOW_NODE_DIMENSIONS } from "../../../utils/node-dimensions";

const { deletable = true } = defineProps<{
  deletable?: boolean;
}>();

const title = "条件分支";
const dimensions = WORKFLOW_NODE_DIMENSIONS.branch;
const deleteIconStyle = { maskImage: `url("${deleteIcon}")` };

const emit = defineEmits<{
  click: [event: MouseEvent | KeyboardEvent];
  addBranch: [event: MouseEvent];
  delete: [event: MouseEvent];
}>();

function confirmDelete(event: MouseEvent) {
  Modal.confirm({
    type: "confirm",
    title: "确认删除",
    content: "确定要删除整个条件分支吗？",
    centered: true,
    okText: "删除",
    cancelText: "取消",
    okButtonProps: { danger: true },
    autoFocusButton: "cancel",
    onOk: () => emit("delete", event),
  });
}
</script>

<style scoped>
.workflow-branch-node {
  display: inline-flex;
  box-sizing: border-box;
  align-items: center;
  gap: 12px;
  padding: 0 14px 0 16px;
  border: 1px solid #edd5bd;
  border-radius: 10px;
  background: #fffaf4;
  font-family: inherit;
  cursor: pointer;
}

.workflow-branch-node:focus-visible {
  outline: 2px solid #b86320;
  outline-offset: 3px;
}

.workflow-branch-node__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #e58a32;
}

.workflow-branch-node__title {
  flex: 1;
  color: #85501f;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.workflow-branch-node__add,
.workflow-branch-node__delete {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  cursor: pointer;
}

.workflow-branch-node__add {
  border-radius: 50%;
  background: #d97726;
}

.workflow-branch-node__add:hover {
  background: #ba601a;
}

.workflow-branch-node__delete {
  border-radius: 4px;
  background: transparent;
  color: #977453;
}

.workflow-branch-node__delete:hover {
  background: #fff0e9;
  color: #c34832;
}

.workflow-branch-node__delete-icon {
  width: 18px;
  height: 18px;
  background: currentColor;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}

.workflow-branch-node__add:focus-visible,
.workflow-branch-node__delete:focus-visible {
  outline: 2px solid #b86320;
  outline-offset: 3px;
}
</style>
