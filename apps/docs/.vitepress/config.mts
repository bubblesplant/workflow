import { defineConfig } from "vitepress";
import { fileURLToPath, URL } from "node:url";

const basePath = (process.env.DOCS_BASE ?? "/").trim().replace(/^\/+|\/+$/g, "");

const developmentSidebar = [
  {
    text: "参与开发",
    items: [
      { text: "本地开发", link: "/development/" },
      { text: "工作区约定", link: "/guide/workspace" },
      { text: "版本与发布", link: "/guide/release" },
    ],
  },
];

function frameworkSidebar(framework: "vue" | "react") {
  const root = `/${framework}`;
  return [
    {
      text: `${framework === "vue" ? "Vue" : "React"} · 开始使用`,
      items: [
        { text: "介绍", link: `${root}/guide/introduction` },
        { text: "快速开始", link: `${root}/guide/getting-started` },
        { text: "交互示例", link: `${root}/examples/` },
      ],
    },
    {
      text: "使用指南",
      items: [
        { text: "节点与流程结构", link: `${root}/guide/nodes` },
        { text: "节点业务配置", link: `${root}/guide/configuration` },
        { text: "保存与恢复", link: `${root}/guide/persistence` },
        { text: "流程记录", link: `${root}/guide/history` },
        { text: "常见问题", link: `${root}/guide/faq` },
      ],
    },
    {
      text: "API 参考",
      items: [
        { text: "Designer", link: `${root}/api/designer` },
        { text: "WorkflowHistory", link: `${root}/api/history` },
        { text: "类型与工具", link: `${root}/api/model` },
        { text: "节点卡片", link: `${root}/api/cards` },
      ],
    },
  ];
}

export default defineConfig({
  title: "Workflow",
  description:
    "面向 Vue 3 与 React 的工作流组件，支持审批、条件分支、循环与流程记录。React 设计器基于 FlowGram。",
  lang: "zh-CN",
  base: basePath ? `/${basePath}/` : "/",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    [
      "link",
      { rel: "icon", type: "image/svg+xml", href: `${basePath ? `/${basePath}` : ""}/logo.svg` },
    ],
  ],
  vite: {
    resolve: {
      alias: [
        {
          find: /^@bubblesjs\/workflow-vue-core$/,
          replacement: fileURLToPath(
            new URL("../../../packages/vue/core/src/index.ts", import.meta.url),
          ),
        },
        {
          find: /^@bubblesjs\/workflow-vue-core\/style\.css$/,
          replacement: fileURLToPath(
            new URL("../../../packages/vue/core/src/style.css", import.meta.url),
          ),
        },
      ],
      dedupe: ["vue"],
    },
  },
  markdown: {
    theme: { light: "github-light", dark: "github-dark" },
  },
  themeConfig: {
    logo: { src: "/logo.svg", alt: "" },
    nav: [
      { text: "Vue 文档", link: "/vue/guide/introduction", activeMatch: "^/vue/" },
      { text: "React 文档", link: "/react/guide/introduction", activeMatch: "^/react/" },
      {
        text: "Playground",
        items: [
          {
            text: "Vue Playground",
            link: "/playground/",
            target: "_blank",
            rel: "noopener noreferrer",
          },
          {
            text: "React Playground",
            link: "/playground/react/",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        ],
      },
      {
        text: "开发",
        items: [
          { text: "本地开发", link: "/development/" },
          { text: "工作区约定", link: "/guide/workspace" },
          { text: "版本与发布", link: "/guide/release" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/bubblesplant/workflow",
        ariaLabel: "GitHub 仓库",
      },
    ],
    sidebar: {
      "/vue/": frameworkSidebar("vue"),
      "/react/": frameworkSidebar("react"),
      "/development/": developmentSidebar,
      "/guide/": developmentSidebar,
    },
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
              modal: {
                displayDetails: "显示详细列表",
                resetButtonTitle: "清除搜索",
                backButtonTitle: "返回",
                noResultsText: "没有找到相关结果",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                  closeText: "关闭",
                },
              },
            },
          },
        },
      },
    },
    outline: { label: "本页目录", level: [2, 3] },
    docFooter: { prev: "上一篇", next: "下一篇" },
    lastUpdated: { text: "最后更新于" },
    returnToTopLabel: "返回顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    skipToContentLabel: "跳转到内容",
    footer: {
      message: "用 Vue 与 React 构建流程，让业务自由生长。",
      copyright: "基于 MIT 许可发布 · Workflow",
    },
  },
});
