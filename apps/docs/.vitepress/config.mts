import { defineConfig } from "vitepress";

const basePath = (process.env.DOCS_BASE ?? "/").trim().replace(/^\/+|\/+$/g, "");

export default defineConfig({
  title: "Workflow",
  description: "基于 pnpm、Vue 3 与 Vite+ 的组件开发工作区",
  lang: "zh-CN",
  base: basePath ? `/${basePath}/` : "/",
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    theme: { light: "github-light", dark: "github-dark" },
  },
  themeConfig: {
    nav: [
      { text: "快速开始", link: "/guide/getting-started" },
      { text: "工作区约定", link: "/guide/workspace" },
      { text: "版本与发布", link: "/guide/release" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "项目指南",
          items: [
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "工作区约定", link: "/guide/workspace" },
            { text: "版本与发布", link: "/guide/release" },
          ],
        },
      ],
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
      message: "开发 Vue 组件，在 playground 中验证交互。",
    },
  },
});
