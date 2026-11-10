# 流程记录

`@bubblesjs/workflow-vue-history` 用于展示流程已经发生的操作与当前处理状态。它是独立的 Vue 3 组件包，可以单独接入审批详情页，也可以与流程设计器一起使用。记录数据、状态映射和文件预览由业务页面提供。

## 选择接入方式

| 场景                                                         | 接入方式                                                                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 已有统一的操作记录数组，需要展示操作人、意见、附件和扩展字段 | 使用 `WorkflowHistory`                                                  |
| 每个节点有不同的表单、操作按钮或业务布局                     | 组合 `WorkflowTimeline` 与 `WorkflowTimelineItem`                       |
| 只需要在其他页面展示头像或状态                               | 单独使用 `WorkflowAvatar`、`WorkflowTimelineDot`、`WorkflowTimelineTag` |

`WorkflowHistory` 使用上述五个基础组件组合而成。它接收 `WorkflowHistoryRecord[]`；基础组件通过插槽接收业务内容，无须转换为这个数据结构。完整属性与插槽见[流程记录组件 API](../api/history)。

## 安装与样式

需要 Vue `^3.5.40`，以及支持 Vue 单文件组件的构建工具。在已有 Vue 项目中安装：

```bash
pnpm add @bubblesjs/workflow-vue-history
```

包导出 ESM、CJS、TypeScript 类型声明和独立的 CSS。应用入口或使用组件的页面需要导入样式：

```ts
import "@bubblesjs/workflow-vue-history/style.css";
```

::: info 在本仓库中使用
若包尚未发布到 npm，在应用的 `dependencies` 中声明 `"@bubblesjs/workflow-vue-history": "workspace:*"`，并在仓库根目录运行 `pnpm install`。工作区以外可以先在仓库执行 `pnpm build:history`，再执行 `pnpm --dir packages/vue/history pack`，将生成的 tarball 安装到目标应用。仅展示流程记录时，只需安装 history 包。
:::

## 展示记录数组

下面的组件可以直接放入审批详情页。默认全部展开，用户可以单独折叠记录，也可以通过标题栏统一展开、收起。

```vue
<template>
  <WorkflowHistory :records="records" @attachment-click="openAttachment" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  WorkflowHistory,
  type WorkflowHistoryAttachmentEvent,
  type WorkflowHistoryRecord,
} from "@bubblesjs/workflow-vue-history";
import "@bubblesjs/workflow-vue-history/style.css";

const records = ref<WorkflowHistoryRecord[]>([
  {
    id: "purchase-1-review",
    title: "部门负责人审批",
    status: "success",
    operator: { name: "张敏", description: "产品研发部" },
    time: "2026-11-09 09:38",
    datetime: "2026-11-09T09:38:00+08:00",
    opinion: "同意采购。\n请财务继续审核预算。",
    fields: [
      { label: "预算金额", value: "¥ 18,600.00" },
      { label: "是否加急", value: false },
    ],
    attachments: [{ id: "file-1", name: "采购明细.pdf", size: "240 KB" }],
  },
  {
    id: "purchase-1-finance",
    title: "财务审核",
    status: "processing",
    operator: { name: "李明", description: "财务经理" },
    time: "2026-11-09 10:00 到达",
  },
]);

function openAttachment({ record, attachment, event }: WorkflowHistoryAttachmentEvent) {
  event.preventDefault();
  // 将这里替换为自己的文件预览逻辑。
  console.log("预览附件", record.id, attachment.id);
}
</script>
```

记录按传入顺序显示。`id` 必须唯一且稳定，建议使用接口记录 ID；同一节点多次审批也应有各自的记录 ID。若需要倒序，请先复制、排序数据再传入，组件不会排序或修改原始数组。

`time` 是已经格式化好的展示文本；`datetime` 只补充 HTML 时间语义，不会生成或格式化可见时间。`fields` 按数组顺序显示，`0` 和 `false` 分别显示为 `0`、`false`，空字符串、`null`、`undefined` 显示为 `—`。需要“是 / 否”、金额或日期格式时，在业务层先转换为字符串。

## 控制展开状态

只需要默认收起时，无须维护展开数组：

```vue
<WorkflowHistory :records="records" :default-expanded="false" />
```

需要通过页面按钮、路由或其他组件控制时，沿用上例的 `records`，增加 `expandedKeys` 并绑定 `v-model:expanded-keys`：

```ts
const expandedKeys = ref<string[]>(["purchase-1-finance"]);
```

```vue
<button type="button" @click="expandedKeys = records.map((record) => record.id)">
  展开所有记录
</button>
<button type="button" @click="expandedKeys = []">收起所有记录</button>
<WorkflowHistory v-model:expanded-keys="expandedKeys" :records="records" />
```

传入 `expanded-keys` 就进入受控模式，页面必须回写 `update:expandedKeys`，`v-model` 会完成这一步；仅传一个固定数组时，点击箭头无法改变展示状态。空数组表示全部收起，`default-expanded` 只在非受控模式生效。

非受控模式按记录 ID 记忆已操作的展开状态，新增记录使用 `default-expanded`。切换到另一张申请单时，可以重新赋值受控数组，或通过业务单号设置组件的 `key` 来重新创建实例。

单条切换触发 `toggle` 和 `update:expandedKeys`；标题栏的全部展开、收起只触发 `update:expandedKeys`。需要监听完整展开列表时，监听模型更新事件。设置 `:collapsible="false"` 会强制所有详情展开，并隐藏折叠按钮。

## 加载与空状态

加载接口数据时，将请求状态传给 `loading`。组件优先展示加载状态，请求结束且 `records` 为空时才显示空状态；错误提示由页面处理。

```vue
<WorkflowHistory :records="records" :loading="loading" empty-text="该申请还没有流转记录">
  <template #loading>正在获取审批记录…</template>
  <template #empty>提交申请后，可在这里查看流转记录。</template>
</WorkflowHistory>
```

这里的 `loading` 由页面的请求逻辑维护，例如 `const loading = ref(false)`。提供 `empty` 插槽后，它会替换 `empty-text`。默认插槽用于在记录区后追加内容，在加载和空状态下也会显示。

## 接管附件预览

有可用 `url` 的默认附件项是链接，点击后在新标签页打开；没有地址或地址协议不受支持时展示按钮，点击仍会触发 `attachment-click`。支持 HTTP、HTTPS、Blob 和相对地址。

上例通过事件中的 `attachment.id` 接入自己的预览器。若需要先异步获取访问地址，应在事件处理器开始时同步调用 `event.preventDefault()`，再执行请求，避免同时触发默认链接跳转。`size` 是业务提供的展示文本，组件不会计算文件大小。

也可以通过 `attachment` 插槽自行渲染下载按钮或预览入口。替换后，点击行为与事件由插槽内容处理，组件不会再自动触发 `attachment-click`。

## 自定义详情内容

只修改处理意见时，使用 `opinion` 插槽，保留默认操作人、扩展字段与附件布局：

```vue
<WorkflowHistory :records="records">
  <template #opinion="{ record }">
    <strong v-if="record.status === 'reject'">{{ record.opinion || "请补充拒绝原因" }}</strong>
    <span v-else>{{ record.opinion || "暂无意见" }}</span>
  </template>
</WorkflowHistory>
```

需要替换整块详情时，使用 `content`：

```vue
<WorkflowHistory :records="records">
  <template #content="{ record }">
    <section :aria-label="`${record.title}详情`">
      <p>{{ record.operator?.name || "系统" }}：{{ record.opinion || "暂无意见" }}</p>
      <p>业务记录编号：{{ record.id }}</p>
    </section>
  </template>
</WorkflowHistory>
```

`content` 会替换整个默认详情区域，此时 `operator`、`opinion`、`attachment` 插槽也由这块自定义内容接管。`operator` 插槽只替换详情中的操作人，标题旁的头像、姓名仍由记录数据生成。

需要完全自定义每条记录时，改用[基础组件组合示例](../api/history#组合使用)。`WorkflowTimelineItem` 的所有插槽都提供 `{ expanded, toggle }`，可以在业务内容中调用 `toggle()`。即使使用 `title` 插槽，也建议传入 `title` 属性，为折叠按钮提供明确的无障碍名称。

折叠通过 `v-show` 隐藏详情，收起时表单值和子组件状态会保留，内容初始即会挂载。若业务内容需要按展开状态延迟挂载，可以在基础记录项的默认插槽中自行使用 `v-if="expanded"`；这也会在收起时卸载该内容。

## 对接业务数据

接口字段、操作码与 UI 状态的映射放在业务适配层。以下示例先将接口记录转为标准结构，再赋给上例的 `records.value`：

```ts
import type { WorkflowHistoryRecord, WorkflowHistoryStatus } from "@bubblesjs/workflow-vue-history";

interface ApprovalLog {
  id: string;
  nodeName: string;
  action: string;
  userName?: string;
  displayTime: string;
  createdAt: string;
  comment?: string;
}

// 操作码仅为示例，应按实际接口协议配置。
const statusByAction: Record<string, WorkflowHistoryStatus | undefined> = {
  APPROVE: "success",
  REJECT: "reject",
  ARRIVE: "processing",
  SUBMIT: "info",
};

function toHistoryRecords(logs: readonly ApprovalLog[]): WorkflowHistoryRecord[] {
  return logs.map((log) => ({
    id: log.id,
    title: log.nodeName,
    status: statusByAction[log.action] ?? "pending",
    operator: log.userName ? { name: log.userName } : undefined,
    time: log.displayTime,
    datetime: log.createdAt,
    opinion: log.comment,
  }));
}
```

组件不会执行审批、读取接口或解释设计器的 `nodes`。节点定义和操作记录属于不同的数据结构，需要由业务系统生成关联关系。附件结构与扩展 JSON 的适配示例可参考[包内 README](https://github.com/bubblesplant/workflow/blob/master/packages/vue/history/README.md)。

## 调整样式与查看示例

给组件设置类名，并在对应根节点覆盖 CSS 变量。基础组件组合时，可以将类名放在 `WorkflowTimeline` 上，让子组件继承变量：

```vue
<WorkflowHistory class="purchase-history" :records="records" />

<style scoped>
.purchase-history {
  --workflow-history-primary: #3267c8;
  --workflow-history-success: #238264;
  --workflow-history-text: #26354a;
}
</style>
```

可用变量与默认值见 [API 样式说明](../api/history#样式)。在本仓库执行 `pnpm dev`，切换到“流程记录”，可查看“组合示例”和“记录列表”，体验展开联动与附件预览；启动方式见[本地开发](../development/)。
