# React 节点卡片

卡片可独立使用，不包含流程编排能力，也不会自动成为 `Designer` 的自定义节点。

```tsx
import { StartCard, EndCard, CommonCard } from "@bubblesjs/workflow-react-core";
import "@bubblesjs/workflow-react-core/style.css";
```

## StartCard / EndCard

两者共享 `TerminalCardProps`：

| 属性        | 类型        | 默认值          | 说明     |
| ----------- | ----------- | --------------- | -------- |
| `label`     | `string`    | `开始` / `结束` | 默认正文 |
| `children`  | `ReactNode` | —               | 替换正文 |
| `className` | `string`    | —               | CSS 类名 |

```tsx
<StartCard label="开始申请" />
<EndCard>流程完成</EndCard>
```

## CommonCard

| 属性          | 类型                                   | 默认值    | 说明                         |
| ------------- | -------------------------------------- | --------- | ---------------------------- |
| `title`       | `ReactNode`                            | —         | 标题                         |
| `description` | `string`                               | `""`      | 默认正文及提示文本           |
| `icon`        | `ReactNode`                            | —         | 标题左侧图标                 |
| `color`       | `string`                               | `#5075dc` | 标题颜色，可传入 CSS 渐变    |
| `selected`    | `boolean`                              | `false`   | 受控选中状态                 |
| `readonly`    | `boolean`                              | `false`   | 只读展示，隐藏操作和选中样式 |
| `deletable`   | `boolean`                              | `true`    | 是否允许显示删除入口         |
| `showArrow`   | `boolean`                              | `true`    | 是否显示正文右侧箭头         |
| `children`    | `ReactNode`                            | —         | 替换默认正文                 |
| `onClick`     | `MouseEventHandler<HTMLButtonElement>` | —         | 正文按钮点击                 |
| `onDelete`    | `MouseEventHandler<HTMLButtonElement>` | —         | 删除按钮点击                 |
| `className`   | `string`                               | —         | CSS 类名                     |

只有非只读、`deletable` 为 `true` 且提供了 `onDelete` 时才显示删除按钮。独立 React 卡片点击删除时直接调用回调；业务方自行确认并更新数据。`selected` 也由父组件维护。

```tsx
import { useState } from "react";
import { CommonCard } from "@bubblesjs/workflow-react-core";
import "@bubblesjs/workflow-react-core/style.css";

export function ApprovalCard() {
  const [selected, setSelected] = useState(false);
  return (
    <CommonCard
      title="主管审批"
      description="由直属主管审批"
      selected={selected}
      deletable={false}
      onClick={() => setSelected(true)}
    />
  );
}
```

设置 `readonly` 后正文使用非交互容器，不触发 `onClick`，不显示删除按钮和箭头。卡片不会执行审批或保存业务配置。
