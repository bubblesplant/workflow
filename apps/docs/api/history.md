# 流程记录组件

提供五个可独立使用的基础组件，通过插槽组合流程记录：`WorkflowAvatar`、`WorkflowTimelineDot`、`WorkflowTimelineTag`、`WorkflowTimeline`、`WorkflowTimelineItem`。`WorkflowHistory` 使用这五个组件提供统一记录数组的便捷接入。独立包 `@bubblesjs/workflow-vue-history` 仅依赖 Vue。

安装、接入方式选择与业务数据适配见[流程记录指南](../guide/history)。本页列出公共组件、类型和交互行为。

```ts
import { WorkflowHistory, type WorkflowHistoryRecord } from "@bubblesjs/workflow-vue-history";
import "@bubblesjs/workflow-vue-history/style.css";
```

## 组合使用

`WorkflowTimelineItem` 下方内容由使用者通过默认插槽传入，可以是业务详情、表单、附件预览或操作按钮。记录项不内置意见、附件和扩展字段，也不要求 `WorkflowHistoryRecord` 数据结构。

```vue
<template>
  <WorkflowTimeline label="采购审批记录">
    <WorkflowTimelineItem v-model:expanded="expanded" type="success" title="部门负责人审批">
      <template #title>
        <WorkflowAvatar text="张敏" />
        <strong>部门负责人审批</strong>
      </template>
      <template #dot>
        <WorkflowTimelineDot type="success" />
      </template>
      <template #status>
        <WorkflowTimelineTag type="success">已通过</WorkflowTimelineTag>
      </template>
      <template #default="{ toggle }">
        <p>同意，请财务核对预算后安排采购。</p>
        <label><input v-model="budgetChecked" type="checkbox" /> 已核对采购预算</label>
        <button type="button" @click="toggle">收起详情</button>
      </template>
    </WorkflowTimelineItem>
  </WorkflowTimeline>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  WorkflowAvatar,
  WorkflowTimeline,
  WorkflowTimelineDot,
  WorkflowTimelineItem,
  WorkflowTimelineTag,
} from "@bubblesjs/workflow-vue-history";
import "@bubblesjs/workflow-vue-history/style.css";

const expanded = ref(true);
const budgetChecked = ref(false);
</script>
```

`WorkflowTimeline` 根元素为 `ol`，默认插槽直接放根元素为 `li` 的 `WorkflowTimelineItem`。头像、圆点和标签可以在其他业务界面单独使用。Playground 的“组合示例”展示业务内容插槽与展开联动。

## 基础组件 API

### WorkflowAvatar

| Prop   | 类型     | 默认值 | 说明                     |
| ------ | -------- | ------ | ------------------------ |
| `text` | `string` | 必填   | 姓名，默认展示最后两个字 |
| `src`  | `string` | 未设置 | 头像地址                 |

未设置 `src` 时，`default` 插槽可替换姓名缩写；空姓名默认显示 `—`。传入 `src` 后优先显示图片，图片加载失败不会自动回退为姓名，需要业务方处理地址。无专用事件。

### WorkflowTimelineDot

| Prop   | 类型             | 默认值    | 说明                             |
| ------ | ---------------- | --------- | -------------------------------- |
| `type` | `WorkflowStatus` | `pending` | 五种状态之一，成功为勾、拒绝为叉 |

`default` 插槽可替换圆点内容，无专用事件。

### WorkflowTimelineTag

| Prop   | 类型             | 默认值     | 说明           |
| ------ | ---------------- | ---------- | -------------- |
| `type` | `WorkflowStatus` | `pending`  | 标签状态       |
| `text` | `string`         | 按状态生成 | 自定义标签文案 |

`default` 插槽优先于 `text`，无专用事件。

### WorkflowTimeline

| Prop    | 类型     | 默认值           | 说明                 |
| ------- | -------- | ---------------- | -------------------- |
| `label` | `string` | `"流程流转记录"` | 有序列表的无障碍名称 |

`default` 插槽直接放记录项，无专用事件。

### WorkflowTimelineItem

| Prop               | 类型             | 默认值    | 说明                                  |
| ------------------ | ---------------- | --------- | ------------------------------------- |
| `title`            | `string`         | 未设置    | 默认标题文本                          |
| `type`             | `WorkflowStatus` | `pending` | 状态与默认圆点、标签样式              |
| `collapsible`      | `boolean`        | `true`    | 是否允许折叠，为 `false` 时保持展开   |
| `default-expanded` | `boolean`        | `true`    | 非受控模式默认展开状态                |
| `expanded`         | `boolean`        | 未设置    | 受控展开状态，支持 `v-model:expanded` |

| Slot      | 参数                   | 说明                                       |
| --------- | ---------------------- | ------------------------------------------ |
| `title`   | `{ expanded, toggle }` | 自定义标题，可放头像、时间等内容           |
| `status`  | `{ expanded, toggle }` | 自定义状态，默认使用 `WorkflowTimelineTag` |
| `dot`     | `{ expanded, toggle }` | 自定义标记，默认使用 `WorkflowTimelineDot` |
| `default` | `{ expanded, toggle }` | 使用者传入的下方业务内容                   |

所有插槽均可读取 `expanded` 或调用 `toggle()` 切换展开状态；受控模式由使用方回写。

`default-expanded` 只在组件创建时初始化本地展开状态，后续主动控制请使用 `v-model:expanded`。`collapsible` 为 `false` 时强制展开，忽略 `expanded`，调用 `toggle()` 不触发事件。

详情使用 `v-show` 隐藏，默认插槽初始即会挂载，收起时保留表单与子组件状态。自定义 `title` 插槽时仍建议提供 `title` 属性，折叠按钮使用它生成无障碍名称；按钮支持键盘操作，并设置 `aria-expanded` 与 `aria-controls`。

| Event             | 参数      | 说明               |
| ----------------- | --------- | ------------------ |
| `update:expanded` | `boolean` | 新的展开状态       |
| `toggle`          | `boolean` | 切换展开状态时触发 |

## WorkflowHistory 数据驱动使用

```vue
<template>
  <WorkflowHistory :records="records" />
</template>

<script setup lang="ts">
import { WorkflowHistory, type WorkflowHistoryRecord } from "@bubblesjs/workflow-vue-history";
import "@bubblesjs/workflow-vue-history/style.css";

const records: WorkflowHistoryRecord[] = [
  {
    id: "record-1",
    title: "部门负责人审批",
    status: "success",
    operator: { name: "张敏", description: "产品研发部" },
    time: "2026-11-09 09:38",
    datetime: "2026-11-09T09:38:00+08:00",
    opinion: "同意，请财务继续审核。",
  },
  {
    id: "record-2",
    title: "财务审核",
    status: "processing",
    operator: { name: "李明", description: "财务经理" },
    time: "2026-11-09 09:38 到达",
  },
];
</script>
```

`WorkflowHistory` 为已组合好的便捷组件，适合统一记录数组；仍可通过 `content` 插槽自定义每条记录下方的内容。打开 Playground 后切换“流程记录”的“记录列表”，可查看静态记录、展开详情与预览附件。示例通过一个数组字面量定义 `records`，展开状态由组件自行管理。

## WorkflowHistory Props

| 名称               | 类型                               | 默认值           | 说明                                          |
| ------------------ | ---------------------------------- | ---------------- | --------------------------------------------- |
| `records`          | `readonly WorkflowHistoryRecord[]` | `[]`             | 按传入顺序展示的记录                          |
| `title`            | `string`                           | `"流程记录"`     | 面板标题，空字符串隐藏默认标题栏              |
| `loading`          | `boolean`                          | `false`          | 显示加载内容，优先于空状态与记录              |
| `empty-text`       | `string`                           | `"暂无流程记录"` | 空数据文案                                    |
| `collapsible`      | `boolean`                          | `true`           | 允许折叠；为 `false` 时始终展开               |
| `default-expanded` | `boolean`                          | `true`           | 非受控模式下，新记录默认是否展开              |
| `expanded-keys`    | `readonly string[]`                | 未设置           | 受控展开记录 ID，支持 `v-model:expanded-keys` |

`title=""` 且没有 `header` 插槽时，整个标题栏与全部展开按钮一起隐藏。提供 `header` 插槽会保留标题栏；全部展开按钮仅在允许折叠、非加载且有记录时显示。

## 记录数据

```ts
type WorkflowStatus = "success" | "processing" | "pending" | "reject" | "info";
type WorkflowHistoryStatus = WorkflowStatus;

interface WorkflowHistoryRecord {
  id: string;
  title: string;
  status?: WorkflowHistoryStatus;
  statusText?: string;
  operator?: WorkflowHistoryUser;
  time?: string;
  datetime?: string;
  opinion?: string;
  opinionLabel?: string;
  attachments?: readonly WorkflowHistoryAttachment[];
  attachmentsLabel?: string;
  fields?: readonly WorkflowHistoryField[];
}

interface WorkflowHistoryUser {
  name: string;
  avatar?: string;
  description?: string;
}

interface WorkflowHistoryAttachment {
  id: string;
  name: string;
  url?: string;
  size?: string;
}

interface WorkflowHistoryField {
  label: string;
  value: string | number | boolean | null | undefined;
}
```

`WorkflowStatus` 是五个基础组件共用的状态类型，`WorkflowHistoryStatus` 为同义类型；两者都从包入口导出。`id` 必须唯一且稳定，组件不修改原始记录。默认意见标签为“处理意见”，默认附件标签为“附件”；均可在记录中覆盖。省略头像时展示姓名最后两个字。

| 状态         | 默认文案 | 颜色 |
| ------------ | -------- | ---- |
| `success`    | 已通过   | 绿   |
| `processing` | 处理中   | 黄   |
| `pending`    | 待处理   | 灰   |
| `reject`     | 已拒绝   | 红   |
| `info`       | 通知     | 蓝   |

省略或运行时未知状态按 `pending` 展示，可用 `statusText` 覆盖文案。意见保留换行，字段值中的 `0`、`false` 正常展示，空字符串、`null`、`undefined` 显示为 `—`。

默认详情按“操作人 → 扩展字段 → 处理意见 → 附件”排列。未提供 `operator` 时省略操作人行；没有附件时省略附件行。处理意见行始终存在：`pending`、`processing` 且意见为空时显示“等待处理，暂无审批意见”，其他状态显示“未填写审批意见”。

`time` 原样展示，由业务方统一格式与时区；`datetime` 为可选的机器可读 ISO 时间，仅在 `time` 非空时写入 `<time>` 元素。`size` 原样展示，不计算文件大小；附件 `id` 在同一条记录内应唯一。接口操作码和动态 JSON 扩展字段应先在业务层转换为标准记录。

## 展开状态与事件

默认每条记录独立展开，可点击记录右侧箭头折叠，也支持全部展开 / 收起。需要由页面控制时，绑定展开 ID：

```vue
<WorkflowHistory
  v-model:expanded-keys="expandedKeys"
  :records="records"
  @toggle="handleToggle"
  @attachment-click="openAttachment"
/>
```

```ts
import { ref } from "vue";
import type {
  WorkflowHistoryAttachmentEvent,
  WorkflowHistoryToggleEvent,
} from "@bubblesjs/workflow-vue-history";

const expandedKeys = ref(["record-2"]);

function handleToggle({ record, expanded }: WorkflowHistoryToggleEvent) {
  console.log(record.id, expanded);
}

function openAttachment({ attachment, event }: WorkflowHistoryAttachmentEvent) {
  event.preventDefault();
  // 按 attachment.id 打开自己的文件预览器。
  console.log(attachment.id);
}
```

| 事件                  | 参数                            | 触发时机                                    |
| --------------------- | ------------------------------- | ------------------------------------------- |
| `update:expandedKeys` | `string[]`                      | 单条或全部展开状态变化                      |
| `toggle`              | `{ record, expanded }`          | 用户切换一条记录                            |
| `attachment-click`    | `{ record, attachment, event }` | 点击默认附件项，`event` 为原始 `MouseEvent` |

传入 `expanded-keys` 后，使用方负责回写状态；空数组表示全部收起。`default-expanded` 仅用于非受控模式。

非受控模式按稳定的记录 ID 记忆已操作状态，未记录状态的 ID 使用 `default-expanded`，所以新增记录也遵循这个默认值。记录按传入顺序显示；每次交互返回的 ID 数组只包含当前记录，并保持 `records` 的顺序。`collapsible` 为 `false` 时所有详情保持展开，忽略 `expanded-keys`。

标题栏的全部展开、收起只触发 `update:expandedKeys`，不逐条触发 `toggle`。模板可使用 `@update:expanded-keys` 显式监听模型更新；附件事件在模板中使用 `@attachment-click`，组件的原始事件名为 `attachmentClick`。

附件默认以 `target="_blank"`、`rel="noopener noreferrer"` 打开可用 `url`，没有地址或地址不可用时展示按钮，仍触发附件点击事件。默认链接支持 HTTP、HTTPS、Blob 及相对地址，其他协议使用事件或插槽处理。接管预览时，先同步调用 `event.preventDefault()`，再执行获取地址等异步逻辑。

## Slots

| 名称         | 参数                     | 说明                                  |
| ------------ | ------------------------ | ------------------------------------- |
| `header`     | `{ title, records }`     | 面板标题，保留全部展开控制            |
| `title`      | `{ record }`             | 单条记录标题                          |
| `status`     | `{ record, status }`     | 状态标签，`status` 已处理未知状态回退 |
| `content`    | `{ record }`             | 整条记录详情                          |
| `operator`   | `{ record, operator }`   | 详情中的操作人                        |
| `opinion`    | `{ record }`             | 处理意见                              |
| `attachment` | `{ record, attachment }` | 单个附件                              |
| `loading`    | 无                       | 加载状态                              |
| `empty`      | 无                       | 空状态                                |
| `default`    | 无                       | 在记录区域后追加内容                  |

单条展开使用独立的箭头按钮，自定义标题、状态和详情可包含业务链接或按钮。替换 `attachment` 后，点击行为由自定义内容自行处理。

`content` 替换整个默认详情，使用后 `operator`、`opinion`、`attachment` 插槽不再参与默认详情的渲染。`operator` 只在存在 `record.operator` 时调用，且仅替换详情中的操作人，不替换标题旁的头像和姓名；`attachment` 只遍历已有的附件。默认插槽在加载、空状态和有记录时均会显示。

```vue
<WorkflowHistory :records="records">
  <template #opinion="{ record }">
    <strong v-if="record.status === 'reject'">{{ record.opinion }}</strong>
    <span v-else>{{ record.opinion || "暂无意见" }}</span>
  </template>
  <template #empty>该申请还没有流转记录。</template>
</WorkflowHistory>
```

## 导出类型

所有公共类型均可从包入口通过 `import type` 导入，无须引用内部文件。

| 类型                                                                          | 用途                                                                                          |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `WorkflowStatus`、`WorkflowHistoryStatus`                                     | 展示状态，后者是前者的同义类型                                                                |
| `WorkflowAvatarProps`、`WorkflowTimelineDotProps`、`WorkflowTimelineTagProps` | 头像、圆点、标签的属性                                                                        |
| `WorkflowTimelineProps`、`WorkflowTimelineItemProps`                          | 时间轴容器与记录项的属性                                                                      |
| `WorkflowTimelineItemSlotProps`                                               | 基础记录项插槽参数：`{ expanded: boolean; toggle: () => void }`                               |
| `WorkflowHistoryProps`、`WorkflowHistoryRecord`                               | 组合组件属性与记录模型                                                                        |
| `WorkflowHistoryUser`、`WorkflowHistoryAttachment`、`WorkflowHistoryField`    | 操作人、附件与扩展字段模型                                                                    |
| `WorkflowHistoryToggleEvent`                                                  | `{ record: WorkflowHistoryRecord; expanded: boolean }`                                        |
| `WorkflowHistoryAttachmentEvent`                                              | `{ record: WorkflowHistoryRecord; attachment: WorkflowHistoryAttachment; event: MouseEvent }` |

## 样式

在 `WorkflowHistory` 或 `WorkflowTimeline` 根节点上设置 CSS 变量即可调整主题：

| 变量                            | 默认值    | 用途                           |
| ------------------------------- | --------- | ------------------------------ |
| `--workflow-history-primary`    | `#4269d4` | 主题色、操作按钮与 `info` 状态 |
| `--workflow-history-success`    | `#22835e` | 通过状态                       |
| `--workflow-history-processing` | `#926b13` | 处理中状态                     |
| `--workflow-history-pending`    | `#758096` | 待处理状态                     |
| `--workflow-history-reject`     | `#bc4747` | 拒绝状态                       |
| `--workflow-history-text`       | `#303d53` | 正文颜色                       |
| `--workflow-history-muted`      | `#68758a` | 次要文本颜色                   |
| `--workflow-history-border`     | `#e7ebf1` | 时间线连线                     |

`info` 复用主题色。样式覆盖示例见[流程记录指南](../guide/history#调整样式与查看示例)。窄屏下头像与间距自动收紧，长标题、意见和文件名可换行。

完整的接口适配示例与本地开发命令见[包内 README](https://github.com/bubblesplant/workflow/blob/master/packages/vue/history/README.md)。
