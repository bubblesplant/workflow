<template>
  <TerminalCard>
    <template #icon>
      <slot name="icon">
        <img :src="endIcon" width="16" height="16" alt="" aria-hidden="true" />
      </slot>
    </template>
    <slot>{{ label }}</slot>
  </TerminalCard>
</template>

<script setup lang="ts">
import endIcon from "../../../assets/icon/svg/end.svg?inline";
import TerminalCard from "./TerminalCard.vue";

const { label = "结束" } = defineProps<{
  label?: string;
}>();
</script>
