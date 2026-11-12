<template>
  <p>文档已按技术栈分区，正在跳转。<a :href="target">前往新页面</a>。</p>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { withBase } from "vitepress";

const props = defineProps<{ to: string }>();
const target = withBase(props.to);

onMounted(() => {
  window.location.replace(`${target}${window.location.search}${window.location.hash}`);
});
</script>
