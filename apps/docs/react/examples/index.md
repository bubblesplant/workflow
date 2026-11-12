<script setup lang="ts">
import { withBase } from "vitepress";
</script>

# React 交互示例

React Playground 使用真实 React 组件，包含流程设计器与流程记录。选择下方入口，在独立窗口体验完整画布：

<p>
  <a class="workflow-button primary" :href="withBase('/playground/react/')" target="_blank" rel="noopener noreferrer">打开 React Playground</a>
</p>

## 流程设计器

默认加载采购审批示例，包含负责人审批、预算条件、填写和抄送节点。左侧编辑、右侧只读预览共享数据；选择节点后可在业务表单中编辑配置。

1. 点击负责人审批，修改标题、说明和审批人配置，观察两个画布同步更新。
2. 在添加入口中插入节点，或者在条件容器中增加分支。
3. 在循环内部添加“退出循环”，观察退出最近一层循环的路径。
4. 保存草稿，修改或删除节点，再恢复草稿。
5. 使用“新建空流程”或“加载审批示例”替换当前内容；替换前会确认，已保存草稿仍可恢复。

草稿保存在当前浏览器的本地存储，恢复前检查节点编号、类型和父子关系。示例的确认框、表单和消息提示使用 Ant Design 6，并配置中文 `ConfigProvider` 与 `App` 上下文。

## 流程记录

在 Playground 顶部切换到“流程记录”，体验基础组件组合、记录列表、全部展开/收起和附件预览。菜单切换保留编辑状态。

对应接入代码见[快速开始](../guide/getting-started)、[节点业务配置](../guide/configuration)和[流程记录](../guide/history)。

## 本地运行

在仓库根目录执行：

```bash
pnpm install
pnpm dev:react
```

打开 `http://localhost:5175`。文档开发服务器只负责文档页面，React Playground 需要单独启动。部署时会将构建产物放到文档站点的 `/playground/react/` 路径。

```bash
pnpm build:react
```

示例源码位于 [apps/playgroud/react](https://github.com/bubblesplant/workflow/tree/main/apps/playgroud/react)，通过 React 公共组件接口接入。
