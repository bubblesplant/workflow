<template>
  <span class="workflow-history__avatar workflow-avatar">
    <img v-if="src" :src="src" alt="" />
    <slot v-else>{{ avatarText }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed, type VNode } from "vue";
import type { WorkflowAvatarProps } from "../../types";

defineOptions({ name: "WorkflowAvatar" });

const { text, src } = defineProps<WorkflowAvatarProps>();

defineSlots<{
  default?: () => VNode[];
}>();

const avatarText = computed(() => Array.from(text).slice(-2).join("") || "—");
</script>
