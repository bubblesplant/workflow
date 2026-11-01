# 工作区约定

## 目录职责

```text
apps/
  playgroud/vue/     Vue 预览应用，vue-playground
  docs/              VitePress 文档站点，docs
packages/
  vue/core/          Vue 组件包，@workflow/vue-core
tsconfig/            共享 TypeScript 配置
```

`pnpm-workspace.yaml` 匹配 `apps/*`、`apps/*/*`、`packages/*` 和 `packages/*/*`。每个子项目维护自己的 `package.json`、入口、构建配置和脚本；根目录维护公共命令、依赖版本、锁文件和质量检查。

当前项目及子包均设置为 `private: true`。`tsconfig/` 是普通配置目录，不作为工作区包。

## 依赖管理

外部依赖版本集中声明在根 `pnpm-workspace.yaml` 的 `catalog` 中。子项目只声明需要的依赖：

```json
{
  "dependencies": {
    "vue": "catalog:"
  }
}
```

内部依赖使用 `workspace:*`。Vue playground 的组件包依赖为：

```json
{
  "dependencies": {
    "@workflow/vue-core": "workspace:*"
  }
}
```

依赖变更后在根目录运行 `pnpm install`，同步提交清单和锁文件。Vue 组件包把 Vue 声明为 peer dependency，由使用它的应用提供 Vue 运行时，避免打包多份 Vue。

## 开发组件

1. 在 `packages/vue/core/src/` 编写 Vue 组件。
2. 从 `src/index.ts` 显式导出组件与公共类型。
3. 在 `src/style.css` 中维护组件样式。
4. 在 `apps/playgroud/vue/src/` 添加使用示例，通过包名导入组件。
5. 运行 `pnpm dev` 查看交互，运行 `pnpm typecheck`、`pnpm lint` 和 `pnpm build:vue` 验证修改。

应用入口统一导入组件样式：

```ts
import "@workflow/vue-core/style.css";
```

开发模式在 Vite 中精确匹配组件包和样式的源码别名，并通过 TypeScript `paths` 获得源码类型。生产构建通过包的 `exports` 加载已构建产物。新增公开入口时，同时维护 `exports`、开发别名和类型映射，确保两种模式都能解析。

## 打包约定

组件库使用 Vite+ 的 `vp pack`，配置放在 `packages/vue/core/vite.config.ts` 的 `pack` 中，输出 ESM、CJS、对应类型声明和 CSS。Vue 运行时保留为外部依赖。

应用使用 `vp build`，产物在 `apps/playgroud/vue/dist/`。根 `pnpm build:vue` 先构建组件库，再构建应用；`pnpm build` 还会构建文档站点。

`pnpm verify:packages` 验证本地组件包的产物与导出。完整验证运行 `pnpm ready`。

## 共享配置与扩展

Vue 组件包与应用通过 `../../../tsconfig/vue.json` 继承共享配置；文档通过 `../../tsconfig/vue.json` 继承。`base.json` 保存基础类型约束，`node.json` 用于 Node 配置。

格式化统一使用 Oxfmt，包含 `.vue` 文件，运行 `pnpm format` 写入格式、`pnpm format:check` 检查格式。根 `eslint.config.mjs` 基于 `@antfu/eslint-config`，检查 `.vue` 的 Vue 专项质量规则，并保留 `template → script → style` 区块顺序检查与自动修复；其他排版由 Oxfmt 处理。Oxlint 启用内置 `vue` 插件，检查 TS、JS 和 Vue `<script>`；Vue SFC 与模板类型通过 `vue-tsc` 检查。

`pnpm lint` / `pnpm lint:fix` 汇总执行 Oxlint 与 ESLint 检查 / 修复，`pnpm lint:ox` / `pnpm lint:vue` 分别运行两者。提交前对 Vue 文件依次执行 Oxlint 修复、ESLint 修复和 Oxfmt 格式化。

VS Code 可以打开仓库根目录，也可以单独打开 `packages/vue/core` 或 `apps/playgroud/vue`。这三个目录均提供独立的 `.vscode` 保存配置；VS Code 不会将父目录的工作区设置继承到单独打开的子项目。

首次打开时安装并启用 Oxc、ESLint、Vue 扩展；两个子项目的 `.vscode/extensions.json` 已列出推荐，Oxc 也可通过 Vite+ 扩展包安装。安装后若当前窗口尚未加载扩展，执行“开发人员: 重新加载窗口”再保存。保存时自动使用 Oxfmt 格式化，并执行 Oxlint 与 ESLint 各自的代码检查修复；ESLint 的格式化功能关闭。

新增应用或共享包时，放入工作区匹配的目录，创建唯一包名与独立脚本。外部依赖使用 `catalog:`，内部依赖使用 `workspace:*`，并将需要的构建与类型检查纳入根命令。应用之间通过共享包复用代码。

文档页面位于 `apps/docs/`，使用 Markdown 编写并由 VitePress 独立构建。
