# Changesets

`@bubblesjs/workflow-vue` 是公开包，首发版本为 `0.1.0`。根项目、`docs` 和 `vue-playground` 保持私有；根目录 `tsconfig/` 是普通配置目录，均不参与 npm 发布。

修改公开包后运行 `pnpm changeset`，选择包、版本类型并填写变更说明。

合并变更后运行 `pnpm version-packages` 更新版本和锁文件；运行 `pnpm ready` 检查，再运行 `pnpm release` 发布。首发 `0.1.0` 已在包清单中确定，无需额外升版。

新增公开包时，移除 `private: true`，设置 `publishConfig.access` 为 `public` 并完善发布元信息。发布账户须拥有目标 scope 或对应组织的包发布权限。完整步骤见 `apps/docs/guide/release.md`。
