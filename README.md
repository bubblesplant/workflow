# Workflow

基于 **pnpm workspace + Vue 3 + TypeScript + Vite+** 的组件开发工作区。`packages/vue/core` 编写流程设计器，`packages/vue/history` 编写流程记录展示组件，`apps/playgroud/vue` 引用组件并提供交互预览，`apps/docs` 保存 VitePress 文档。

[文档](https://bubblesplant.github.io/workflow/) · [Playground](https://bubblesplant.github.io/workflow/playground/) · [贡献指南](CONTRIBUTING.md) · [GitHub](https://github.com/bubblesplant/workflow)

## 启动

- Node.js 26，`.node-version` 固定为 `26.13.0`，`mise.toml` 使用 26 系列。
- pnpm 12，根目录 `packageManager` 固定为 `pnpm@12.15.0`。

```bash
pnpm install
pnpm dev
```

打开 <http://localhost:5173>，通过顶部菜单切换“流程设计器”和“流程记录”。页面使用 Vue 动态组件与 `KeepAlive` 切换，返回设计器时保留编辑状态。开发服务通过源码别名引用组件，修改 `packages/vue/core/src/` 或 `packages/vue/history/src/` 后即可看到更新，无需先构建组件包。

## 目录

```text
apps/
  playgroud/vue/       Vue 组件预览应用，包名 vue-playground
  docs/                VitePress 中文文档
packages/
  vue/core/            Vue 组件包，包名 @bubblesjs/workflow-vue-core
  vue/history/         Vue 流程记录组件包，包名 @bubblesjs/workflow-vue-history
tsconfig/              共享 TypeScript 配置
.changeset/            公开包的版本管理配置
```

`playgroud` 沿用当前项目的目录命名。工作区同时匹配 `apps/*`、`apps/*/*`、`packages/*` 和 `packages/*/*`，支持按框架组织子项目。

## 常用命令

| 命令                                                      | 作用                                   |
| --------------------------------------------------------- | -------------------------------------- |
| `pnpm dev` / `pnpm dev:vue`                               | 启动 Vue playground                    |
| `pnpm preview`                                            | 预览已构建的 playground                |
| `pnpm dev:core`                                           | 监听并重新打包 Vue 组件库              |
| `pnpm build:core`                                         | 只构建 Vue 组件库                      |
| `pnpm dev:history`                                        | 监听并重新打包流程记录组件库           |
| `pnpm build:history`                                      | 只构建流程记录组件库                   |
| `pnpm build:vue`                                          | 按依赖顺序构建组件库与 Vue playground  |
| `pnpm build`                                              | 构建整个工作区，包括文档               |
| `pnpm typecheck`                                          | 检查根配置及各子项目类型               |
| `pnpm lint` / `pnpm lint:fix`                             | 执行 / 修复 Oxlint 与 ESLint 检查      |
| `pnpm lint:ox` / `pnpm lint:vue`                          | 分别执行 Oxlint / Vue 专项 ESLint 检查 |
| `pnpm format` / `pnpm format:check`                       | 格式化 / 检查格式                      |
| `pnpm check`                                              | 执行工作区质量检查                     |
| `pnpm verify:packages`                                    | 验证产物及独立安装后的严格类型检查     |
| `pnpm ready` / `pnpm run ci`                              | 质量检查、全量构建和产物验证           |
| `pnpm docs:dev` / `pnpm docs:build` / `pnpm docs:preview` | 文档开发 / 构建 / 预览                 |
| `pnpm hooks:install`                                      | 安装提交检查 hooks                     |

组件库使用 `vp pack`，输出 ESM、CJS、类型声明和 `style.css`；Vue 声明为 peer dependency。应用使用 `vp build`，生产构建通过包的 `exports` 消费组件库的 `dist` 产物。

## 引用组件

应用在 `package.json` 中声明 `"@bubblesjs/workflow-vue-core": "workspace:*"`，按包名引用组件，并在应用入口导入样式：

```vue
<template>
  <Designer id="workflow" v-model:nodes="nodes" @node-click="handleNodeClick" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Designer,
  createDefaultNodes,
  type WorkflowNode,
  type WorkflowNodeClickEvent,
} from "@bubblesjs/workflow-vue-core";
import "@bubblesjs/workflow-vue-core/style.css";

interface BusinessConfig {
  approverIds?: string[];
}

const nodes = ref<WorkflowNode<BusinessConfig>[]>(createDefaultNodes<BusinessConfig>());
const selectedNodeId = ref("");

function handleNodeClick({ id }: WorkflowNodeClickEvent) {
  selectedNodeId.value = id;
  // 按 id 从 nodes 中读取节点，打开自己的业务配置表单。
}
</script>
```

`nodes` 是流程结构和业务配置的源数据；添加、删除节点和增加条件分支都会通过 `v-model:nodes` 回写。数组顺序表示同层执行顺序，`parentNode` 表示所属节点；位置和连线由设计器内部计算，无须获取 Vue Flow 实例。

`node-click` 提供 `{ id, type }`，开始、结束和添加入口不触发该事件。使用方可以在对应节点的 `data.config` 中维护可 JSON 序列化的业务信息。表单提交时更新节点数据即可同步画布，完整示例见 `apps/playgroud/vue/src/App.vue`。

保存草稿时可以序列化 `nodes.value`，恢复时将解析后的节点数组赋给 `nodes.value`。真正提交给工作流引擎执行时，仍需按目标引擎的协议转换并校验流程和业务配置。

公共组件从 `packages/vue/core/src/index.ts` 导出。外部依赖版本统一放在 `pnpm-workspace.yaml` 的 `catalog` 中，子项目使用 `catalog:`，内部包使用 `workspace:*`。

流程记录组件从 `packages/vue/history/src/index.ts` 导出，使用独立包 `@bubblesjs/workflow-vue-history`。公开头像、状态圆点、状态标签、时间轴条目和时间轴五个小组件，`WorkflowTimelineItem` 的正文由使用方通过默认插槽传入。`WorkflowHistory` 基于这些组件组合，接收记录数组并协调展开状态。Playground 的“流程记录”提供直接组合示例与静态记录列表，支持展开详情和预览附件；接入方式见 [history 说明](packages/vue/history/README.md)与[组件 API](apps/docs/api/history.md)。

`@bubblesjs/workflow-vue-core` 与 `@bubblesjs/workflow-vue-history` 为公开包，首发版本均为 `0.1.0`，使用 Changesets 管理版本与发布；根项目、文档和预览应用保持私有。`pnpm verify:packages` 只验证本地产物，不执行发布。

## 格式化与保存

所有支持的文件（包括 `.vue`）统一由 Oxfmt 格式化。根 `eslint.config.mjs` 使用 `@antfu/eslint-config`，对 `.vue` 启用 Vue 专项质量规则，并保留 `template → script → style` 区块顺序检查与自动修复；其他排版由 Oxfmt 处理。Oxlint 启用内置 `vue` 插件，负责 TS、JS 以及 Vue `<script>` 的代码检查。Vue SFC 与模板类型由 `vue-tsc` 检查。

运行 `pnpm format` 格式化整个工作区，`pnpm format:check` 检查格式。`pnpm lint` / `pnpm lint:fix` 汇总执行 Oxlint 与 ESLint 检查 / 修复，`pnpm lint:ox` 和 `pnpm lint:vue` 可分别执行。提交前对 Vue 文件依次执行 Oxlint 修复、ESLint 修复和 Oxfmt 格式化。

VS Code 可以打开仓库根目录，也可以单独打开 `packages/vue/core`、`packages/vue/history` 或 `apps/playgroud/vue`；这些目录均提供独立的 `.vscode` 保存配置。首次打开时，请安装并启用 Oxc、ESLint 和 Vue 扩展；子项目的 `.vscode/extensions.json` 已列出推荐，Oxc 也可通过 Vite+ 扩展包安装。安装后若当前窗口尚未加载扩展，执行“开发人员: 重新加载窗口”再保存。

保存时统一使用 Oxfmt 格式化，同时执行 Oxlint 与 ESLint 各自的代码检查修复；ESLint 的格式化功能关闭。单独打开子项目时使用子目录的 `.vscode` 配置，VS Code 不会继承父目录的工作区设置。

文档站使用 VitePress `2.0.0-alpha.21`，运行 `pnpm docs:dev` 后打开 <http://localhost:5174>。包含组件接入、节点结构、业务配置、保存恢复、API 参考与可运行的交互示例；支持本地搜索、深浅色主题和 `DOCS_BASE` 子路径部署。

GitHub Pages 使用 `.github/workflows/docs.yml` 同时部署文档和 Playground。手动运行 **Deploy docs and playground** 后，Playground 位于文档站点的 `playground/` 子路径，文档导航和首页提供访问入口。单独构建 Playground 时，可通过 `PLAYGROUND_BASE` 指定部署路径。

更多说明见[快速开始](apps/docs/guide/getting-started.md)、[交互示例](apps/docs/examples/index.md)、[本地开发](apps/docs/development/index.md)、[工作区约定](apps/docs/guide/workspace.md)和[版本与发布](apps/docs/guide/release.md)。
