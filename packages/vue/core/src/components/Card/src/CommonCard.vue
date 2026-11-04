<template>
  <div
    ref="card"
    class="workflow-common-card"
    :class="{ 'is-selected': selected }"
    :style="{
      '--workflow-card-color': color,
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
    }"
  >
    <button
      class="workflow-common-card__trigger"
      type="button"
      :aria-pressed="selected"
      @click="select"
    >
      <span class="workflow-common-card__header" :class="{ 'has-delete': deletable }">
        <span v-if="$slots.icon" class="workflow-common-card__icon" aria-hidden="true">
          <slot name="icon" />
        </span>
        <span class="workflow-common-card__title">
          <slot name="title">{{ title }}</slot>
        </span>
      </span>
      <span class="workflow-common-card__body">
        <Tooltip :title="description">
          <span class="workflow-common-card__content">
            <slot>{{ description }}</slot>
          </span>
        </Tooltip>
        <img
          v-if="showArrow"
          class="workflow-common-card__arrow"
          :src="chevronRightIcon"
          width="18"
          height="18"
          alt=""
          aria-hidden="true"
        />
      </span>
    </button>
    <button
      v-if="deletable"
      class="workflow-common-card__delete nodrag nopan"
      type="button"
      :aria-label="`删除${title}`"
      @pointerdown.stop
      @keydown.stop
      @click.stop="confirmDelete"
    >
      <img :src="deleteIcon" width="20" height="20" alt="" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import Modal from "antdv-next/dist/modal/index";
import Tooltip from "antdv-next/dist/tooltip/index";
import { useTemplateRef } from "vue";
import chevronRightIcon from "../../../assets/icon/svg/chevron-right.svg?inline";
import deleteIcon from "../../../assets/icon/svg/delete.svg?inline";
import { WORKFLOW_NODE_DIMENSIONS } from "../../../utils/node-dimensions";

const dimensions = WORKFLOW_NODE_DIMENSIONS.common;

const {
  title,
  description = "",
  color = "#5075dc",
  deletable = true,
  showArrow = true,
} = defineProps<{
  title?: string;
  description?: string;
  color?: string;
  deletable?: boolean;
  showArrow?: boolean;
}>();

const selected = defineModel<boolean>("selected", { default: false });
const card = useTemplateRef<HTMLElement>("card");

onClickOutside(card, () => {
  selected.value = false;
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  delete: [event: MouseEvent];
}>();

function select(event: MouseEvent) {
  selected.value = true;
  emit("click", event);
}

function confirmDelete(event: MouseEvent) {
  Modal.confirm({
    type: "confirm",
    title: "确认删除",
    content: `确定要删除“${title}”节点吗？`,
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
.workflow-common-card {
  --workflow-card-shadow: 0 0 0 0 transparent;

  position: relative;
  box-sizing: border-box;
  border: 1px solid #e5e9f0;
  border-radius: 10px;
  background: #fff;
  box-shadow: var(--workflow-card-shadow);
  font-family: inherit;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.workflow-common-card:hover {
  --workflow-card-shadow: 0 8px 24px rgb(31 35 41 / 14%);
}

.workflow-common-card.is-selected {
  border-color: #4e78f6;
}

.workflow-common-card__trigger {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #526481;
  font: inherit;
  font-size: 16px;
  line-height: 24px;
  text-align: left;
  cursor: pointer;
}

.workflow-common-card__trigger:focus,
.workflow-common-card__delete:focus {
  outline: none;
}

.workflow-common-card__header {
  display: flex;
  box-sizing: border-box;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 12px 20px;
  background: var(--workflow-card-color);
  color: #fff;
}

.workflow-common-card__header.has-delete {
  padding-right: 56px;
}

.workflow-common-card__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.workflow-common-card__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workflow-common-card__body {
  display: flex;
  box-sizing: border-box;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 0;
  padding: 20px;
}

.workflow-common-card__content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workflow-common-card__arrow {
  flex: none;
  color: #b7c3d5;
}

.workflow-common-card__delete {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #fff;
  opacity: 0;
  cursor: pointer;
  pointer-events: none;
  transition:
    opacity 160ms ease,
    background-color 160ms ease;
}

.workflow-common-card:hover .workflow-common-card__delete,
.workflow-common-card:focus-within .workflow-common-card__delete {
  opacity: 1;
  pointer-events: auto;
}

.workflow-common-card__delete:hover,
.workflow-common-card__delete:focus-visible {
  background: rgb(255 255 255 / 18%);
}

@media (hover: none) {
  .workflow-common-card__delete {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .workflow-common-card,
  .workflow-common-card__delete {
    transition: none;
  }
}
</style>
