# Vue 快速开始

本页介绍如何在 Vue 应用中使用 `@bubblesjs/workflow-vue-core`。展示审批流转记录请查看[流程记录指南](./history)；运行本仓库请查看[本地开发](/development/)。

## 安装

需要 Vue `^3.5.40`，并使用支持 Vue 单文件组件的构建工具。包导出 ESM、CJS、类型声明和 CSS。

::: code-group

```bash [pnpm]
pnpm add @bubblesjs/workflow-vue-core
```

```bash [npm]
npm install @bubblesjs/workflow-vue-core
```

```bash [yarn]
yarn add @bubblesjs/workflow-vue-core
```

:::

工作区中的应用在 `package.json` 声明内部依赖后，在根目录运行 `pnpm install`：

```json
{
  "dependencies": {
    "@bubblesjs/workflow-vue-core": "workspace:*"
  }
}
```

## 挂载设计器

创建一个有明确高度的父容器，绑定 `v-model:nodes` 并导入样式：

```vue
<template>
  <div class="workflow-container">
    <Designer id="expense-flow" v-model:nodes="nodes" @node-click="handleNodeClick" />
  </div>
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

function handleNodeClick({ id, type }: WorkflowNodeClickEvent) {
  const node = nodes.value.find((entry) => entry.id === id);
  console.log("打开节点配置", type, node?.data?.config);
}
</script>

<style scoped>
.workflow-container {
  height: 640px;
  border: 1px solid #e7e7eb;
  border-radius: 8px;
}
</style>
```

`id` 用于区分画布实例，同一页面不能重复。每个设计器分别调用 `createDefaultNodes()`，保证初始数据相互独立。

## 添加节点

将鼠标移到开始与结束之间的“+”入口，选择审批、填写、抄送、条件分支或循环。设计器会更新 `nodes`，并重新计算位置和连线。

点击业务卡片会触发 `node-click`。开始、结束和添加入口不会触发该事件。使用事件中的 ID 读取节点，并在自己的表单中编辑 `data.config`，详见[节点业务配置](./configuration)。

## 保存流程

节点数组包含结构、标题和业务配置，可作为草稿保存：

```ts
const draft = JSON.stringify(nodes.value);
```

恢复前应校验输入结构，再将节点数组赋给 `nodes.value`。更多说明见[保存与恢复](./persistence)。

## 继续了解

- [交互示例](../examples/)：直接体验预置流程和配置表单。
- [节点与流程结构](./nodes)：理解 `parentNode`、条件与循环。
- [Designer API](../api/designer)：查看组件属性与事件。
- [流程记录](./history)：接入独立的 history 包，展示操作人、处理意见和附件。
