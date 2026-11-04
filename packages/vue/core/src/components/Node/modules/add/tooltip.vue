<template>
  <Tooltip
    trigger="hover"
    placement="right"
    color="#fff"
    :styles="{
      root: { width: '220px', maxWidth: 'calc(100vw - 32px)' },
      container: { padding: 0, color: '#465675', borderRadius: '8px' },
    }"
  >
    <template #title>
      <slot name="title">
        <div class="workflow-node-picker">
          <h2 class="workflow-node-picker__title">添加流程节点</h2>
          <section
            v-for="group in nodeGroups"
            :key="group.label"
            class="workflow-node-picker__group"
          >
            <h3 class="workflow-node-picker__heading">{{ group.label }}</h3>
            <div class="workflow-node-picker__options">
              <div
                v-for="option in group.options"
                @click="emits('addNode', option)"
                :key="option.type"
                class="workflow-node-picker__option"
                :style="{ '--node-option-color': option.color }"
              >
                <span class="workflow-node-picker__icon" aria-hidden="true">
                  <img :src="option.icon" width="18" height="18" alt="" />
                </span>
                <span class="workflow-node-picker__label">{{ option.label }}</span>
              </div>
            </div>
          </section>
        </div>
      </slot>
    </template>
    <slot />
  </Tooltip>
</template>

<script setup lang="ts">
import Tooltip from "antdv-next/dist/tooltip/index";
import { computed } from "vue";
import { WORKFLOW_NODE_GROUPS } from "../../../../utils/node-config";
import { WORKFLOW_NODE_TYPE } from "../../../../utils";
import type { AddNodeOption } from "../../../../utils/add-node";

const { allowExitLoop = false } = defineProps<{
  allowExitLoop?: boolean;
}>();

const nodeGroups = computed(() =>
  WORKFLOW_NODE_GROUPS.map((group) => ({
    ...group,
    options: group.options.filter(
      (option) => option.type !== WORKFLOW_NODE_TYPE.EXIT_LOOP || allowExitLoop,
    ),
  })),
);

const emits = defineEmits<{
  addNode: [option: AddNodeOption];
}>();
</script>

<style scoped>
.workflow-node-picker {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 9px;
  border-radius: 8px;
  background: #fff;
  font-family: inherit;
  cursor: default;
}

.workflow-node-picker__title {
  margin: 0 5px 10px;
  color: #465675;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.workflow-node-picker__group + .workflow-node-picker__group {
  margin-top: 8px;
  padding-top: 9px;
  border-top: 1px solid #eef0f5;
  user-select: none;
}

.workflow-node-picker__heading {
  margin: 0 8px 1px;
  color: #939fba;
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
}

.workflow-node-picker__options {
  display: flex;
  flex-direction: column;
}

.workflow-node-picker__option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  min-height: 38px;
  padding: 0 8px;
  border-radius: 4px;
  cursor: pointer;
}

.workflow-node-picker__option:hover {
  background: #f5f7fb;
}

.workflow-node-picker__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: var(--node-option-color);
  color: #fff;
}

.workflow-node-picker__label {
  color: #465675;
  font-size: 13px;
  line-height: 20px;
}
</style>
