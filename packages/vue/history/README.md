# @bubblesjs/workflow-vue-history

Vue 3 流程记录组件，提供可独立使用的头像、时间线、记录项、状态圆点与标签，通过插槽组合出自己的流程记录。`WorkflowHistory` 则将这五个小组件组合成数据驱动的便捷组件。仅依赖 Vue，不绑定业务接口、工作流引擎或文件预览服务。

[在线使用指南](https://bubblesplant.github.io/workflow/guide/history) · [在线 API](https://bubblesplant.github.io/workflow/api/history) · [仓库使用指南](../../../apps/docs/guide/history.md) · [仓库 API](../../../apps/docs/api/history.md)

## 开发

在仓库根目录执行：

```bash
pnpm dev:history
pnpm build:history
pnpm --filter @bubblesjs/workflow-vue-history typecheck
pnpm --filter @bubblesjs/workflow-vue-history verify:package
```

`dev:history` 监听源码并持续生成组件库产物；`build:history` 执行一次构建。产物包含 ESM、CJS、对应类型声明与 `style.css`。运行产物验证前先执行构建。

根目录的 `pnpm build`、`pnpm typecheck` 和 `pnpm verify:packages` 会自动包含此包，代码检查与格式化沿用仓库统一配置。单独打开本目录时，可使用 `.vscode` 中的扩展推荐与保存设置。

## 接入

使用方需要提供 Vue `^3.5.40`。包发布到 npm 后，可在已有 Vue 应用中安装：

```bash
pnpm add @bubblesjs/workflow-vue-history
# 或使用 npm
npm install @bubblesjs/workflow-vue-history
```

组件与类型从包入口按需导入，样式使用 `import "@bubblesjs/workflow-vue-history/style.css"`。

本工作区的应用在 `package.json` 中声明内部依赖，然后在仓库根目录运行 `pnpm install`：

```json
{
  "dependencies": {
    "@bubblesjs/workflow-vue-history": "workspace:*"
  }
}
```

尚未发布时，仓库外的应用也可使用本地 tarball。在仓库根目录构建并打包：

```bash
pnpm build:history
pnpm --dir packages/vue/history pack
```

随后在目标应用中运行 `pnpm add <生成的 .tgz 文件路径>`。打包产物与 npm 包使用相同的导入方式。

## 组合使用

直接使用五个基础组件，无需转换成 `WorkflowHistoryRecord`。`WorkflowTimelineItem` 负责时间线结构、标题、状态和展开行为，**下方内容由使用者通过默认插槽传入**，不内置意见、附件或字段布局；可以写任意业务详情、表单和操作按钮。

```vue
<template>
  <WorkflowTimeline label="审批流转记录">
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
        <dl>
          <dt>审批意见</dt>
          <dd>同意，请财务核对预算后安排采购。</dd>
        </dl>
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

头像、圆点和标签也可以单独用于业务页面。时间线容器的默认插槽直接放 `WorkflowTimelineItem`；记录项的默认插槽就是它下方的业务内容。

## 数据驱动使用

希望通过统一记录数组快速接入时，使用已组合好的 `WorkflowHistory`：

```vue
<template>
  <WorkflowHistory :records="records" @attachment-click="openAttachment" />
</template>

<script setup lang="ts">
import {
  WorkflowHistory,
  type WorkflowHistoryAttachmentEvent,
  type WorkflowHistoryRecord,
} from "@bubblesjs/workflow-vue-history";
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
    fields: [{ label: "预算金额", value: "¥ 18,600.00" }],
    attachments: [{ id: "file-1", name: "采购明细.pdf" }],
  },
  {
    id: "record-2",
    title: "财务审核",
    status: "processing",
    operator: { name: "李明", description: "财务经理" },
    time: "2026-11-09 09:38 到达",
  },
];

function openAttachment({ attachment, event }: WorkflowHistoryAttachmentEvent) {
  event.preventDefault();
  // 使用 attachment.id 调用自己的文件预览服务。
  console.log(attachment.id);
}
</script>
```

Vue 作为 peer dependency 由使用方提供，支持 `^3.5.40`。外部依赖统一通过根目录 `pnpm-workspace.yaml` 的 `catalog` 管理，公共组件从 `src/index.ts` 导出。

## 基础组件 API

### WorkflowAvatar

| Prop   | 类型     | 默认值 | 说明                     |
| ------ | -------- | ------ | ------------------------ |
| `text` | `string` | 必填   | 姓名，默认展示最后两个字 |
| `src`  | `string` | 未设置 | 头像地址                 |

`default` 插槽仅在 `src` 为空时自定义头像内容，未提供插槽时展示姓名最后两个字；空姓名显示 `—`。提供 `src` 时优先展示图片，图片加载失败不会自动回退为姓名。无专用事件。

### WorkflowTimelineDot

| Prop   | 类型             | 默认值    | 说明                         |
| ------ | ---------------- | --------- | ---------------------------- |
| `type` | `WorkflowStatus` | `pending` | 圆点状态，成功为勾，拒绝为叉 |

`default` 插槽自定义圆点内容。无专用事件。

### WorkflowTimelineTag

| Prop   | 类型             | 默认值     | 说明     |
| ------ | ---------------- | ---------- | -------- |
| `type` | `WorkflowStatus` | `pending`  | 标签状态 |
| `text` | `string`         | 按状态生成 | 标签文案 |

`default` 插槽自定义标签内容，优先于 `text`。无专用事件。

### WorkflowTimeline

| Prop    | 类型     | 默认值           | 说明                 |
| ------- | -------- | ---------------- | -------------------- |
| `label` | `string` | `"流程流转记录"` | 有序列表的无障碍名称 |

根元素为 `ol`，`default` 插槽直接放记录项；不接收记录数组、不添加固定业务内容。无专用事件。

### WorkflowTimelineItem

| Prop               | 类型             | 默认值    | 说明                                    |
| ------------------ | ---------------- | --------- | --------------------------------------- |
| `title`            | `string`         | 未设置    | 默认标题文本，也可通过 `title` 插槽替换 |
| `type`             | `WorkflowStatus` | `pending` | 状态与默认圆点、标签样式                |
| `collapsible`      | `boolean`        | `true`    | 允许折叠；为 `false` 时内容始终展开     |
| `default-expanded` | `boolean`        | `true`    | 非受控模式的默认展开状态                |
| `expanded`         | `boolean`        | 未设置    | 受控展开状态，支持 `v-model:expanded`   |

根元素为 `li`，可直接放入 `WorkflowTimeline`。默认提供状态圆点、状态标签和独立的展开按钮。标题与状态可自由组合头像、时间等内容。

使用 `title` 插槽时，仍建议传入简短的 `title` 属性，供展开按钮生成可访问名称。详情通过 `v-show` 折叠，初次渲染时即挂载，收起后保留内部表单与子组件状态；需要延迟挂载时，可在默认插槽中读取 `expanded` 并自行使用 `v-if`。

| 插槽      | 参数                   | 用途                                             |
| --------- | ---------------------- | ------------------------------------------------ |
| `title`   | `{ expanded, toggle }` | 自定义标题区                                     |
| `status`  | `{ expanded, toggle }` | 自定义状态区，默认使用 `WorkflowTimelineTag`     |
| `dot`     | `{ expanded, toggle }` | 自定义时间线标记，默认使用 `WorkflowTimelineDot` |
| `default` | `{ expanded, toggle }` | 由使用者传入下方业务内容                         |

所有插槽的 `toggle()` 切换当前项展开状态，`expanded` 为当前是否展开。受控模式下，使用方通过 `v-model:expanded` 回写状态。

| 事件              | 参数      | 说明               |
| ----------------- | --------- | ------------------ |
| `update:expanded` | `boolean` | 返回新的展开状态   |
| `toggle`          | `boolean` | 切换展开状态时触发 |

## WorkflowHistory Props

| 名称               | 类型                               | 默认值           | 说明                                        |
| ------------------ | ---------------------------------- | ---------------- | ------------------------------------------- |
| `records`          | `readonly WorkflowHistoryRecord[]` | `[]`             | 按传入顺序展示，组件不排序、不修改原始数据  |
| `title`            | `string`                           | `"流程记录"`     | 面板标题；传入空字符串可隐藏默认标题栏      |
| `loading`          | `boolean`                          | `false`          | 展示加载内容，优先于记录与空状态            |
| `empty-text`       | `string`                           | `"暂无流程记录"` | 空数据文案                                  |
| `collapsible`      | `boolean`                          | `true`           | 是否允许折叠；关闭后所有详情保持展开        |
| `default-expanded` | `boolean`                          | `true`           | 非受控模式下，新记录是否默认展开            |
| `expanded-keys`    | `readonly string[]`                | 未设置           | 受控展开 ID，可使用 `v-model:expanded-keys` |

记录 `id` 在同一实例内必须唯一且稳定，不要使用会随排序变化的数组下标。记录按接口顺序展示；需要倒序时，由使用方传入复制后排序的数组。

`title=""` 且没有 `header` 插槽时，整个标题栏隐藏，“全部展开 / 全部收起”按钮也随之隐藏。需要自定义标题并保留该按钮时，使用 `header` 插槽。

## 数据类型

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

以上类型以及 `WorkflowHistoryProps`、`WorkflowHistoryToggleEvent`、`WorkflowHistoryAttachmentEvent` 均从包入口导出。五个基础组件统一使用 `WorkflowStatus`，`WorkflowHistoryStatus` 保留为同义类型。

| 状态         | 默认文案 | 外观           |
| ------------ | -------- | -------------- |
| `success`    | 已通过   | 绿色勾与标签   |
| `processing` | 处理中   | 黄色圆点与标签 |
| `pending`    | 待处理   | 灰色圆点与标签 |
| `reject`     | 已拒绝   | 红色叉与标签   |
| `info`       | 通知     | 蓝色圆点与标签 |

省略状态或运行时收到未知状态时按 `pending` 展示，`statusText` 可改为“已提交”“已转交”等业务文案。省略头像时展示姓名最后两个字。

`time` 原样展示，`datetime` 只用于 HTML 时间语义；时区与格式由业务方统一。意见保留换行。扩展字段中的 `0` 和 `false` 会正常展示，空字符串、`null`、`undefined` 显示为 `—`。

## 展开与事件

默认可点击每条记录右侧的箭头独立折叠，也可以点击标题栏的“全部收起 / 全部展开”。折叠按钮支持键盘操作，并通过 `aria-expanded` 表达状态。

```vue
<WorkflowHistory v-model:expanded-keys="expandedKeys" :records="records" @toggle="handleToggle" />
```

```ts
import { ref } from "vue";
import type { WorkflowHistoryToggleEvent } from "@bubblesjs/workflow-vue-history";

// 受控模式首次展开哪些记录，由使用方决定；[] 表示全部收起。
const expandedKeys = ref(["record-2"]);
function handleToggle({ record, expanded }: WorkflowHistoryToggleEvent) {
  console.log(record.id, expanded);
}
```

| 事件                  | 参数                            | 说明                                              |
| --------------------- | ------------------------------- | ------------------------------------------------- |
| `update:expandedKeys` | `string[]`                      | 单条或全部展开状态变化时，返回新的展开 ID 数组    |
| `toggle`              | `{ record, expanded }`          | 用户切换一条记录时触发                            |
| `attachment-click`    | `{ record, attachment, event }` | 点击默认附件项时触发，`event` 为原始 `MouseEvent` |

传入 `expanded-keys` 后，必须通过 `v-model` 或更新事件回写状态；`default-expanded` 仅作用于非受控模式。

点击“全部展开 / 全部收起”只触发 `update:expandedKeys`，不会逐条触发 `toggle`；直接修改受控的展开数组也不会触发 `toggle`。`collapsible` 为 `false` 时，所有详情始终展开，并隐藏单条与全部切换按钮。

附件有可用 `url` 时默认在新窗口打开链接；无 `url` 时展示按钮。调用 `event.preventDefault()` 可接管默认打开行为，使用文件 ID 接入自有预览器。默认链接支持 HTTP、HTTPS、Blob 及相对地址；其他协议请通过事件或插槽处理。组件不代替业务方获取文件、判断访问权限或执行上传。

## 插槽

| 插槽         | 参数                     | 用途                                        |
| ------------ | ------------------------ | ------------------------------------------- |
| `header`     | `{ title, records }`     | 替换面板标题内容，保留全部展开控制          |
| `title`      | `{ record }`             | 自定义单条记录标题                          |
| `status`     | `{ record, status }`     | 自定义状态标签，`status` 为回退后的展示状态 |
| `content`    | `{ record }`             | 替换整条记录详情                            |
| `operator`   | `{ record, operator }`   | 替换详情中的操作人内容                      |
| `opinion`    | `{ record }`             | 替换处理意见                                |
| `attachment` | `{ record, attachment }` | 替换每个附件项                              |
| `loading`    | 无                       | 自定义加载状态                              |
| `empty`      | 无                       | 自定义空状态                                |
| `default`    | 无                       | 在记录区域之后追加内容                      |

单条展开使用独立的箭头按钮，自定义标题、状态和详情可包含业务链接或按钮。替换 `attachment` 后，点击行为由自定义内容自行处理。

`content` 替换整块默认详情，因此同一实例中的 `operator`、`opinion`、`attachment` 插槽不再参与渲染。保留默认详情时，`operator` 仅在记录提供 `operator` 时调用，`attachment` 仅在附件数组非空时逐项调用；替换这两个插槽不会隐藏外层的字段标签。

```vue
<WorkflowHistory :records="records" :loading="loading">
  <template #opinion="{ record }">
    <strong v-if="record.status === 'reject'">{{ record.opinion }}</strong>
    <span v-else>{{ record.opinion || "暂无意见" }}</span>
  </template>
  <template #empty>该申请还没有流转记录。</template>
</WorkflowHistory>
```

## 适配业务接口

业务接口的 `actionCode`、附件结构和扩展 JSON 由业务方转为标准记录。下面以 `operationRecordList` 为例，状态与扩展字段标签通过配置传入：

```ts
import type {
  WorkflowHistoryField,
  WorkflowHistoryRecord,
  WorkflowHistoryStatus,
} from "@bubblesjs/workflow-vue-history";

interface OperationRecord {
  recordId: string;
  nodeName?: string;
  nodeLabel?: string;
  actionCode?: string;
  operatorName?: string;
  operationTime?: string;
  commentLabel?: string;
  opinion?: string;
  attachmentFileList?: { id: string; name: string; url?: string }[];
  extraJson?: string;
}

function readFields(
  raw: string | undefined,
  labels: Record<string, string>,
): WorkflowHistoryField[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const data = value as Record<string, unknown>;
    return Object.entries(labels).flatMap(([key, label]) => {
      const field = data[key];
      return ["string", "number", "boolean"].includes(typeof field) && field !== ""
        ? [{ label, value: field as string | number | boolean }]
        : [];
    });
  } catch {
    // 单条扩展数据损坏时仍展示基础记录。
    return [];
  }
}

function toHistoryRecords(
  operationRecordList: readonly OperationRecord[],
  statusByAction: Record<string, WorkflowHistoryStatus>,
  fieldLabels: Record<string, string>,
): WorkflowHistoryRecord[] {
  return operationRecordList.map((item) => ({
    id: item.recordId,
    title: item.nodeName || "流程操作",
    status: statusByAction[item.actionCode || ""] || "info",
    statusText: item.nodeLabel,
    operator: item.operatorName ? { name: item.operatorName } : undefined,
    time: item.operationTime,
    opinionLabel: item.commentLabel,
    opinion: item.opinion,
    attachments: item.attachmentFileList,
    fields: readFields(item.extraJson, fieldLabels),
  }));
}
```

`statusByAction` 应遵循业务系统的操作码定义；动态字段可见性、位置以及 `beeLabelMap` 等协议，也在业务适配层处理。若接口缺少 `recordId`，应先补充稳定的记录标识。

## 样式与演示

组件样式使用独立类名，可覆盖根节点的 CSS 变量，例如：

```css
.my-history {
  --workflow-history-primary: #3267c8;
  --workflow-history-success: #238264;
  --workflow-history-text: #26354a;
}
```

执行 `pnpm dev`，在 Playground 顶部切换到“流程记录”。“记录列表”使用单个静态 `records` 数组，展开状态由组件自行管理，点击附件可查看示例预览；“组合示例”直接使用五个基础组件与业务内容插槽，可联动控制财务详情展开、查看报价、收起审批意见。
