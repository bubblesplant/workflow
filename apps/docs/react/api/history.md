# React WorkflowHistory

本页所有组件和类型均由 `@bubblesjs/workflow-react-history` 导出。安装与接入见[流程记录指南](../guide/history)。

```tsx
import { WorkflowHistory } from "@bubblesjs/workflow-react-history";
import "@bubblesjs/workflow-react-history/style.css";
```

## WorkflowHistory Props

| 属性                  | 类型                               | 默认值         | 说明                                |
| --------------------- | ---------------------------------- | -------------- | ----------------------------------- |
| `records`             | `readonly WorkflowHistoryRecord[]` | `[]`           | 按数组顺序展示记录                  |
| `title`               | `string`                           | `流程记录`     | 列表标题；空字符串隐藏默认头部      |
| `loading`             | `boolean`                          | `false`        | 显示加载状态                        |
| `emptyText`           | `string`                           | `暂无流程记录` | 默认空状态文案                      |
| `collapsible`         | `boolean`                          | `true`         | 是否允许折叠；为 `false` 时始终展开 |
| `defaultExpanded`     | `boolean`                          | `true`         | 非受控模式下，新记录的默认展开状态  |
| `expandedKeys`        | `readonly string[]`                | —              | 传入后由父组件控制展开记录          |
| `loadingContent`      | `ReactNode`                        | —              | 替换默认加载内容                    |
| `emptyContent`        | `ReactNode`                        | —              | 替换默认空状态内容                  |
| `children`            | `ReactNode`                        | —              | 列表后追加的内容                    |
| `className` / `style` | `string` / `CSSProperties`         | —              | 容器样式                            |

### 回调

| 属性                   | 参数                            | 说明                                                |
| ---------------------- | ------------------------------- | --------------------------------------------------- |
| `onExpandedKeysChange` | `keys: string[]`                | 展开状态变化；受控模式需回写                        |
| `onToggle`             | `{ record, expanded }`          | 单条记录展开或收起；全部切换不触发此回调            |
| `onAttachmentClick`    | `{ record, attachment, event }` | 默认附件链接或按钮点击；可 `event.preventDefault()` |

`record` 为 `WorkflowHistoryRecord`，`attachment` 为 `WorkflowHistoryAttachment`。`event` 为 `MouseEvent<HTMLAnchorElement | HTMLButtonElement>`。相应事件类型为 `WorkflowHistoryToggleEvent` 与 `WorkflowHistoryAttachmentEvent`。

### 自定义渲染

以下属性返回 `ReactNode`：

| 属性               | 参数                     | 替换范围                                   |
| ------------------ | ------------------------ | ------------------------------------------ |
| `renderHeader`     | `{ title, records }`     | 头部标题内容                               |
| `renderTitle`      | `{ record }`             | 记录标题                                   |
| `renderStatus`     | `{ record, status }`     | 状态展示，`status` 为规范化展示状态        |
| `renderContent`    | `{ record }`             | 完整详情，替换默认操作人、意见、字段和附件 |
| `renderOperator`   | `{ record, operator }`   | 详情中的操作人                             |
| `renderOpinion`    | `{ record }`             | 处理意见                                   |
| `renderAttachment` | `{ record, attachment }` | 单个附件，自行提供交互                     |

记录级渲染接口由 `WorkflowHistoryRenderers` 导出。

## WorkflowHistoryRecord

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

`id` 同一列表内唯一且稳定。`time` 原样显示，`datetime` 用于 `<time>` 的语义属性。业务操作码需自行映射为展示状态。

默认附件只允许相对地址、HTTP(S) 与 Blob URL；没有合法地址时显示按钮，可通过点击回调接入业务预览。空字段值显示“—”，`0` 和 `false` 保留。意见中的换行会保留。

## WorkflowTimelineItem

可用于不依赖 `WorkflowHistoryRecord` 的自定义时间线。

| 属性                  | 类型                                      | 默认值    | 说明                           |
| --------------------- | ----------------------------------------- | --------- | ------------------------------ |
| `title`               | `string`                                  | —         | 默认标题与折叠按钮的无障碍名称 |
| `type`                | `WorkflowStatus`                          | `pending` | 展示状态                       |
| `collapsible`         | `boolean`                                 | `true`    | 允许折叠                       |
| `defaultExpanded`     | `boolean`                                 | `true`    | 初始展开状态                   |
| `expanded`            | `boolean`                                 | —         | 传入后为受控展开状态           |
| `onExpandedChange`    | `(expanded: boolean) => void`             | —         | 展开状态变化，受控模式需回写   |
| `onToggle`            | `(expanded: boolean) => void`             | —         | 用户展开或收起                 |
| `renderTitle`         | `WorkflowTimelineItemRender`              | —         | 自定义标题                     |
| `renderStatus`        | `WorkflowTimelineItemRender`              | —         | 自定义状态                     |
| `renderDot`           | `WorkflowTimelineItemRender`              | —         | 自定义圆点                     |
| `children`            | `ReactNode \| WorkflowTimelineItemRender` | —         | 详情正文                       |
| `className` / `style` | `string` / `CSSProperties`                | —         | 条目样式                       |

```ts
interface WorkflowTimelineItemSlotProps {
  expanded: boolean;
  toggle: () => void;
}

type WorkflowTimelineItemRender = (scope: WorkflowTimelineItemSlotProps) => ReactNode;
```

虽然参数类型名沿用了 `SlotProps`，React 用法是渲染函数。组合示例见[流程记录指南](../guide/history#组合基础组件)。

## 其他基础组件

以下组件均支持 `className`、`style` 和 `children`：

| 组件                  | 额外属性                                 | 说明                                              |
| --------------------- | ---------------------------------------- | ------------------------------------------------- |
| `WorkflowTimeline`    | `label?: string`                         | 时间线容器及无障碍标签                            |
| `WorkflowAvatar`      | `text: string`、`src?: string`           | 有 src 时显示图片，否则展示 children 或姓名末两字 |
| `WorkflowTimelineDot` | `type?: WorkflowStatus`                  | 状态圆点，可用 children 替换内容                  |
| `WorkflowTimelineTag` | `type?: WorkflowStatus`、`text?: string` | 状态标签，可自定义文本或 children                 |

所有组件的 Props 类型也从公共入口导出，例如 `WorkflowHistoryProps`、`WorkflowTimelineItemProps`、`WorkflowAvatarProps`。通用容器属性为 `WorkflowComponentProps`。

## 样式

组件类名使用 `workflow-react-` 前缀。主题变量可在容器上覆盖：

```css
.approval-history {
  --workflow-history-primary: #6254fe;
}
```

可用变量以包内 `src/style.css` 为准。[React 交互示例](../examples/)提供展开联动、附件预览和自定义时间线。
