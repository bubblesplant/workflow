# 节点卡片

`StartCard`、`EndCard` 和 `CommonCard` 可作为独立展示组件使用。它们不包含流程编排能力，也不会自动成为 `Designer` 的自定义节点。

```ts
import { StartCard, EndCard, CommonCard } from "@workflow/vue-core";
import "@workflow/vue-core/style.css";
```

## StartCard / EndCard

| 属性    | 类型     | 默认值          | 说明                     |
| ------- | -------- | --------------- | ------------------------ |
| `label` | `string` | `发起` / `结束` | 默认插槽为空时展示的文本 |

| 插槽      | 说明         |
| --------- | ------------ |
| `default` | 自定义正文   |
| `icon`    | 替换默认图标 |

两者的固定尺寸为 `104 × 40px`。

```vue
<StartCard label="开始申请" />
<EndCard>流程完成</EndCard>
```

## CommonCard

### Props

| 属性          | 类型      | 默认值    | 说明                                 |
| ------------- | --------- | --------- | ------------------------------------ |
| `title`       | `string`  | —         | 卡片标题                             |
| `description` | `string`  | `""`      | 默认正文及提示文本                   |
| `color`       | `string`  | `#5075dc` | 标题背景，可传入 CSS 渐变            |
| `deletable`   | `boolean` | `true`    | 是否提供删除入口                     |
| `showArrow`   | `boolean` | `true`    | 是否展示正文右侧箭头                 |
| `selected`    | `boolean` | `false`   | 通过 `v-model:selected` 同步选中状态 |

### Events

| 事件              | 参数         | 说明                                    |
| ----------------- | ------------ | --------------------------------------- |
| `click`           | `MouseEvent` | 点击正文按钮，同时更新选中状态为 `true` |
| `delete`          | `MouseEvent` | 删除确认框中选择“删除”后触发            |
| `update:selected` | `boolean`    | 点击卡片或点击卡片外部导致状态变化      |

卡片不会自行从数据中移除；业务侧需在 `delete` 事件中处理删除。

### Slots

| 插槽      | 说明                             |
| --------- | -------------------------------- |
| `icon`    | 标题左侧图标                     |
| `title`   | 替换标题内容                     |
| `default` | 替换正文，默认使用 `description` |

固定尺寸为 `360 × 124px`。长正文以单行省略，提示文本使用 `description`。

```vue
<template>
  <CommonCard
    v-model:selected="selected"
    title="主管审批"
    description="由直属主管审批"
    :deletable="false"
    @click="openSettings"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { CommonCard } from "@workflow/vue-core";
import "@workflow/vue-core/style.css";

const selected = ref(false);
function openSettings() {
  // 打开业务配置表单。
}
</script>
```
