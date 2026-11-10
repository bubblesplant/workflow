# 参与贡献 / Contributing

欢迎通过 Issue 和 Pull Request 改进 Workflow，中文和英文均可。提交公开 Issue 或从个人 Fork 发起 PR，无需仓库写入权限。

## 提交 Issue

请先阅读[组件文档](https://bubblesplant.github.io/workflow/)，并搜索[已有 Issue](https://github.com/bubblesplant/workflow/issues)。然后在 [Issue 创建页](https://github.com/bubblesplant/workflow/issues/new/choose)选择：

- **缺陷反馈 / Bug report**：描述预期与实际行为，提供最小复现、操作步骤及依赖版本。文档问题可以提供对应文档链接。
- **功能建议 / Feature request**：描述使用场景、当前限制、建议的 API 和替代方案。

新 Issue 会自动添加 `pending triage` 标签；维护者确认分类后移除此标签。较大的 API 或行为变更，建议先开 Issue 讨论。

## 本地开发

项目使用 Node.js `26.13.0` 和 pnpm `12.15.0`，版本分别记录在 `.node-version` 和根目录 `package.json` 的 `packageManager` 中。

1. Fork [本仓库](https://github.com/bubblesplant/workflow)，将自己的 Fork 克隆到本地。
2. 从最新的 `main` 创建功能分支。
3. 安装依赖并启动组件预览应用或文档：

```bash
pnpm install --frozen-lockfile
pnpm dev
# 或启动文档站
pnpm docs:dev
```

- `packages/vue/core`：流程设计器组件、公开类型、单元测试和产物验证脚本。
- `packages/vue/history`：流程记录组件、公开类型、单元测试和产物验证脚本。
- `apps/playgroud/vue`：组件交互预览，`playgroud` 沿用仓库现有目录命名。
- `apps/docs`：组件文档与示例。

开发模式通过源码别名加载组件，修改组件后无需预先构建。完整工作区约定见[开发文档](https://bubblesplant.github.io/workflow/development/)。

## 检查改动

完整检查与 CI 对应：

```bash
pnpm ready
```

该命令依次完成格式检查、静态检查、类型检查、单元测试、全工作区构建，以及组件包产物和独立安装后的严格类型检查。也可以根据改动分别执行：

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify:packages
```

`pnpm verify:packages` 需要先构建组件包。需要自动修正格式时运行 `pnpm format`。修复缺陷或新增行为时，请补充必要的测试；涉及公开 API 时同步更新文档与示例。

在 pnpm 12 中，`pnpm ci` 是内置安装命令。执行本项目的同名脚本应使用 `pnpm run ci`，或直接使用 `pnpm ready`。

## 提交 Pull Request

将功能分支推送到自己的 Fork，再向本仓库的 `main` 发起 PR，按模板说明问题、方案、关联 Issue 和验证结果。修复已有问题时，在描述中填写 `Closes #123`。

PR 标题遵循 [Conventional Commits](https://www.conventionalcommits.org/)，例如：

```text
fix(core): 修复节点删除后的连线更新
feat(history): 支持流程记录自定义内容
docs: 补充流程设计器使用示例
ci: 调整贡献检查流程
```

支持的类型为 `build`、`chore`、`ci`、`docs`、`feat`、`fix`、`perf`、`refactor`、`revert`、`style` 和 `test`；scope 可选，冒号后的描述不能为空，也不能以大写英文字母开头。工作过程允许多次提交，CI 检查 PR 标题；`pnpm install` 会安装 Git hooks，本地提交信息由 Commitlint 按 Conventional Commits 检查。维护者建议使用 **Squash and merge**，以 PR 标题作为合并提交信息。

用户可见的组件、类型或行为变更，请运行 `pnpm changeset`，选择受影响的公开包和相应版本级别，并提交生成的 Markdown 文件：

- `@bubblesjs/workflow-vue-core`：流程设计器组件包。
- `@bubblesjs/workflow-vue-history`：流程记录组件包。

两个包独立管理版本；同时影响两个包时应都选中。纯文档、测试或工程配置改动可以不添加 changeset，在 PR 中说明原因即可。

PR 会在 Ubuntu 和 Windows 上运行 `pnpm ready`。来自 Fork 的 PR 使用只读权限运行检查，无需贡献者配置 npm Token 等密钥。首次贡献者的运行可能需要维护者在 Actions 页面批准；标题检查只读取 PR 信息，不执行 PR 中的代码。

## 维护者设置

将这些配置合并到默认分支 `main` 后，Issue 表单和 PR 模板会生效。在 **Settings → General → Features** 中开启 **Issues**。

Issue 表单使用 `bug` 和 `enhancement` 标签，请确保仓库已有这两个标签；`pending triage` 标签由工作流自动创建。

建议开启 **Squash merging**，将默认合并提交信息设置为 PR 标题，并在 `main` 的分支规则中要求以下检查通过：

- `Check and build (ubuntu-latest)`
- `Check and build (windows-latest)`
- `Validate PR title`

这些仓库设置需要维护者在 GitHub 中配置，提交模板和工作流文件不会自动修改分支规则。如 GitHub 要求批准首次外部贡献者的 Actions 运行，维护者审查后可在对应运行中批准。

包含 Changeset 的变更合入 `main` 且 CI 通过后，Release 工作流会自动创建或更新版本 PR；版本 PR 合入 `main` 且 CI 通过后，工作流发布尚未发布的包版本。需要在 **Settings → Actions → General → Workflow permissions** 中允许 GitHub Actions 创建 PR，并为 npm 发布配置 `NPM_TOKEN`；未配置该令牌时只维护版本 PR。详细流程见[版本与发布](https://bubblesplant.github.io/workflow/guide/release)。
