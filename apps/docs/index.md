---
layout: home
title: 首页
hero:
  name: Workflow
  text: 在同一个工作区开发与预览 Vue 组件
  tagline: pnpm 管理依赖，Vite+ 打包组件与应用，playground 实时预览组件变化。
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/getting-started
    - theme: alt
      text: 查看工作区约定
      link: /guide/workspace
features:
  - title: Vue 组件与预览
    details: packages/vue/core 编写组件，apps/playgroud/vue 通过工作区依赖引用组件并展示交互。
  - title: 集中管理依赖
    details: 外部依赖使用 catalog:，工作区依赖使用 workspace:*，在根目录维护版本与锁文件。
  - title: 独立打包与类型声明
    details: vp pack 输出组件的 ESM、CJS、类型声明与样式，vp build 构建应用，质量和产物检查在本地与 CI 运行。
---
