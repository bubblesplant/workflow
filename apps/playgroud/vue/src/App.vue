<template>
  <div class="playground-shell">
    <header class="playground-header">
      <span class="playground-title">Workflow Playground</span>
      <nav class="playground-menu" aria-label="组件演示">
        <button
          v-for="item in menuItems"
          :key="item.id"
          type="button"
          :aria-pressed="activeView === item.id"
          @click="activeView = item.id"
        >
          {{ item.label }}
        </button>
      </nav>
    </header>
    <div class="playground-content">
      <KeepAlive>
        <component :is="activeComponent" />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import DesignerPlayground from "./views/DesignerPlayground.vue";
import HistoryPlayground from "./views/HistoryPlayground.vue";

type PlaygroundView = "designer" | "history";

const menuItems = [
  { id: "designer", label: "流程设计器" },
  { id: "history", label: "流程记录1" },
] as const;

const activeView = ref<PlaygroundView>("designer");
const activeComponent = computed(() =>
  activeView.value === "designer" ? DesignerPlayground : HistoryPlayground,
);
</script>

<style scoped>
.playground-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  background: #fff;
}

.playground-header {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e9f0;
  color: #465675;
  font:
    14px/1.6 system-ui,
    sans-serif;
}

.playground-title {
  font-size: 15px;
  font-weight: 600;
}

.playground-menu {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.playground-menu button {
  padding: 7px 14px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #65748b;
  font: inherit;
  cursor: pointer;
}

.playground-menu button:hover {
  background: #f4f6fa;
}

.playground-menu button[aria-pressed="true"] {
  background: #edf2ff;
  color: #325ed1;
}

.playground-menu button:focus-visible {
  outline: 2px solid #5075dc;
  outline-offset: 3px;
}

.playground-content {
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

@media (max-width: 760px) {
  .playground-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px 16px;
  }

  .playground-menu button {
    flex: 1;
  }
}
</style>
