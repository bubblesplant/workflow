# 版本与发布

当前根项目、`docs`、`vue-playground` 和 `@workflow/vue-core` 均为 `private: true`，没有 npm 发布对象。组件包仍可在本地构建 ESM、CJS、类型声明和 CSS，供工作区应用引用。

`pnpm verify:packages` 只验证本地产物。Changesets 和发布工作流保留给将来需要公开的包。

## 将包设为可发布

首次发布前完成以下配置：

1. 为目标包确定包名与版本，移除 `private: true`，公开包设置 `publishConfig.access` 为 `public`。
2. 完善 `repository`、`homepage`、`bugs`、作者和许可证信息。
3. 核对 `files`、`exports`、ESM/CJS 与类型入口，以及 `style.css` 导出。
4. 保持 Vue 为 peer dependency，并验证包的使用方能加载组件及样式。
5. 核对 `.changeset/config.json` 的默认分支与仓库实际分支一致，确认发布账户拥有目标 scope 的权限。

包名变更时，同步更新 `workspace:*` 依赖、源码导入、开发别名、TypeScript 映射和产物验证脚本。配置完成后运行 `pnpm install` 和 `pnpm ready`。

## 记录与发布版本

对将来可发布的包记录变更：

```bash
pnpm changeset
```

选择受影响的包，填写版本级别和变更说明。现有私有应用与包不参与 npm 发布。

准备版本时运行：

```bash
pnpm version-packages
pnpm ready
```

检查生成的版本、变更日志和锁文件后，在有发布权限的环境执行 `pnpm release`。该命令会发布符合条件的新版本。

`.github/workflows/release.yml` 通过 `workflow_dispatch` 手动触发，并在 `main` 分支运行。将来启用时，设置仓库变量 `RELEASE_ENABLED=true`，允许 GitHub Actions 创建版本 PR；配置 `NPM_TOKEN` 后支持 npm 发布。

## 部署文档

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

使用 GitHub Pages 时，将构建来源设为 **GitHub Actions**，再手动运行 `.github/workflows/docs.yml`。工作流根据仓库名设置 `DOCS_BASE`；使用自定义域名时，按实际访问路径调整。
