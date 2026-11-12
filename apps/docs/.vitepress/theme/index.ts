import { defineComponent, h } from "vue";
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import WorkflowHome from "./WorkflowHome.vue";
import DocsRedirect from "./DocsRedirect.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("DocsRedirect", DocsRedirect);
  },
  Layout: defineComponent({
    setup() {
      return () => h(DefaultTheme.Layout, null, { "home-hero-before": () => h(WorkflowHome) });
    },
  }),
} satisfies Theme;
