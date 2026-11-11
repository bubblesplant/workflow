# 版本与发布

`@bubblesjs/workflow-vue-core` 是公开的 npm 包，首发版本为 `0.1.0`，已设置 `publishConfig.access: "public"`。根项目、`docs` 和 `vue-playground` 保持 `private: true`，不参与 npm 发布。组件包构建 ESM、CJS、类型声明和 CSS，供工作区应用和外部项目引用。

`pnpm verify:packages` 验证本地产物，并将 tarball 安装到独立项目，在最低支持的 Vue 版本下分别检查 ESM、CJS 声明。独立项目使用 `strict: true`、`skipLibCheck: false` 和 `types: []`，确保声明所需的类型随包提供，不依赖工作区的类型自动加载；该检查已包含在 `pnpm ready` 中。

Changesets 和发布工作流负责公开包的版本与发布。CI、发布和文档部署统一使用 Node.js `26.13.0` 与 pnpm `12.15.0`。

## 发布前核对

首次发布前完成以下配置：

1. 核对目标包的包名与版本，确保没有 `private: true`，且 `publishConfig.access` 为 `public`；当前包名为 `@bubblesjs/workflow-vue-core`，首发版本为 `0.1.0`。
2. 完善 `repository`、`homepage`、`bugs`、作者和许可证信息。
3. 核对 `files`、`exports`、ESM/CJS 与类型入口，以及 `style.css` 导出。
4. 保持 Vue 为 peer dependency，并验证包的使用方能加载组件及样式。
5. 核对 `.changeset/config.json` 的默认分支与仓库实际分支一致，确认发布账户拥有目标 scope 的权限。

包名变更时，同步更新 `workspace:*` 依赖、源码导入、开发别名、TypeScript 映射和产物验证脚本。配置完成后运行 `pnpm install` 和 `pnpm ready`。

## 记录与发布版本

修改公开包后记录变更：

```bash
pnpm changeset
```

选择受影响的包，填写版本级别和变更说明。私有应用不参与 npm 发布。

准备版本时运行：

```bash
pnpm version-packages
pnpm ready
```

检查生成的版本、变更日志和锁文件后，在有发布权限的环境执行 `pnpm release`。该命令会发布符合条件的新版本。

首发 `0.1.0` 已在包清单中确定，可以直接在检查通过后运行 `pnpm release`；后续变更再通过 Changesets 升级版本。

`.github/workflows/release.yml` 在合入或推送到 `main` 的 CI 全部通过后自动运行，也支持通过 `workflow_dispatch` 在 `main` 手动触发。自动触发时会核对 CI 检查的提交仍然是 `main` 的最新提交，跳过过时的 CI 结果。工作流先执行 `pnpm ready`；存在待处理的 Changeset 时创建或更新版本 PR，版本 PR 合入 `main` 且 CI 通过后自动发布尚未发布的包版本。升版脚本会更新版本、变更日志和锁文件，并执行格式化。

在仓库设置中允许 GitHub Actions 创建版本 PR，并配置具有 `@bubblesjs` scope 发布权限的 `NPM_TOKEN`。未配置该令牌时，工作流只创建或更新版本 PR。

## 部署文档与 Playground

文档产物位于 `apps/docs/.vitepress/dist/`：

```bash
pnpm docs:build
pnpm docs:preview
```

默认部署路径是 `/`。通过 `DOCS_BASE` 指定子路径，例如在 PowerShell 中：

```powershell
$env:DOCS_BASE = '/workflow/'
pnpm docs:build
```

Playground 产物位于 `apps/playgroud/vue/dist/`。独立部署时默认路径为 `/`，通过 `PLAYGROUND_BASE` 指定子路径：

```powershell
$env:PLAYGROUND_BASE = '/workflow/playground/'
pnpm build:vue
pnpm preview
```

使用 GitHub Pages 时，将构建来源设为 **GitHub Actions**。Release 工作流通过 Changesets 实际发布 npm 新版本后，会自动调用 `.github/workflows/docs.yml`（**Deploy docs and playground**），部署本次 npm 发布对应提交的文档与 Playground。仅创建或更新版本 PR、没有新版本可发布、未配置 `NPM_TOKEN`，或 npm 发布失败时，不会自动部署。也可手动运行文档工作流独立部署。

工作流根据仓库名设置 `DOCS_BASE`，将 Vue 的 `PLAYGROUND_BASE` 设为文档路径下的 `playground/`，将 React 的 `PLAYGROUND_REACT_BASE` 设为 `playground/react/`。依次构建文档、组件库和两个 Playground 后，将 Playground 产物合并到文档产物的对应目录，一起部署到同一个 Pages 站点。

合并后的静态产物会通过 `GITHUB_TOKEN` 推送到 `gh-pages` 分支，首次部署时自动创建分支，后续部署更新分支内容并保留提交历史。文档工作流及 Release 中调用它的 `docs` 作业均需要 `contents: write` 权限。站点仍通过 Pages artifact 部署，仓库 Pages 构建来源保持 **GitHub Actions**，无需额外配置发布令牌。

当前仓库部署后的访问地址：

- [文档站点](https://bubblesplant.github.io/workflow/)
- [在线 Playground](https://bubblesplant.github.io/workflow/playground/)
- [GitHub 仓库](https://github.com/bubblesplant/workflow)

文档导航、首页和交互示例页都提供 Playground 入口。用户或组织主页仓库使用根路径 `/`，对应的 Playground 路径为 `/playground/`；使用自定义域名时，按实际访问路径调整两个应用的 base。
