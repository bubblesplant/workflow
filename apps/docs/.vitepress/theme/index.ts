import { defineComponent, h } from "vue";
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import WorkflowHome from "./WorkflowHome.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout: defineComponent({
    setup() {
      return () => h(DefaultTheme.Layout, null, { "home-hero-before": () => h(WorkflowHome) });
    },
  }),
} satisfies Theme;
