# 快速开始

Workflow 把 Vue 组件、预览应用和文档组织在一个 pnpm 工作区中。组件在 `packages/vue/core` 开发，通过 `@workflow/vue-core` 提供给 `apps/playgroud/vue` 使用。

## 环境

- Node.js 26，`.node-version` 为 `26.13.0`，`mise.toml` 使用 26 系列。
- pnpm 12，根 `package.json` 的 `packageManager` 为 `pnpm@12.15.0`。

在仓库根目录安装依赖并启动预览应用：

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:5173`，可以看到组件引用与点击示例。`pnpm dev:vue` 是同一个应用的启动入口。开发模式通过源码别名加载组件和样式，无需预先构建组件库；修改 `packages/vue/core/src/` 后会触发更新。

文档独立启动：

```bash
pnpm docs:dev
```

文档地址为 `http://localhost:5174`。开发端口均启用了 `strictPort`，端口被占用时服务会提示错误。

## 构建与验证

```bash
# 只构建 Vue 组件包
pnpm build:core

# 构建组件包与 Vue 预览应用
pnpm build:vue

# 预览已构建的应用
pnpm preview
```

组件包使用 `vp pack`，产物位于 `packages/vue/core/dist/`，包含 ESM、CJS、类型声明和 `style.css`。应用使用 `vp build`，生产构建引用组件包的 `dist`，因此需要先构建组件包；`pnpm build:vue` 已按依赖顺序处理。

需要监听组件包产物时可以运行 `pnpm dev:core`。日常 playground 开发直接运行 `pnpm dev` 即可。

提交前执行：

```bash
pnpm ready
```

该命令完成质量检查、全工作区构建和本地产物验证。也可以分别运行 `pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build` 和 `pnpm verify:packages`。

在 pnpm 12 中，`pnpm ci` 是内置安装命令。执行本项目的同名脚本应使用 `pnpm run ci`，或直接使用 `pnpm ready`。

只操作某个子项目时使用过滤器：

```bash
pnpm --filter @workflow/vue-core build
pnpm --filter vue-playground dev
pnpm --filter docs build
```

添加组件前可阅读[工作区约定](./workspace)。当前所有项目均为私有；将来需要 npm 发布时，再按[版本与发布](./release)配置。
