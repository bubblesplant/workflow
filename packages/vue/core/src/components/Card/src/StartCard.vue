<template>
  <TerminalCard>
    <template #icon>
      <slot name="icon">
        <img :src="startIcon" width="16" height="16" alt="" aria-hidden="true" />
      </slot>
    </template>
    <slot>{{ label }}</slot>
  </TerminalCard>
</template>

<script setup lang="ts">
import startIcon from "../../../assets/icon/svg/start.svg?inline";
import TerminalCard from "./TerminalCard.vue";

const { label = "发起" } = defineProps<{
  label?: string;
}>();
</script>
