---
outline: [2, 3]
---

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { withBase } from "vitepress";
const WorkflowExample = defineAsyncComponent(() => import("./WorkflowExample.vue"));
</script>

# 交互示例

选择预置流程，在画布中添加节点，点击业务卡片后修改名称、说明和 JSON 配置。节点数据可在下方展开查看。

也可以<a :href="withBase('/playground/')" target="_blank" rel="noopener noreferrer">打开独立 Playground</a>，使用完整画布体验节点编排与业务配置。项目源码见 [GitHub 仓库](https://github.com/bubblesplant/workflow)。

<ClientOnly>
  <WorkflowExample />
  <template #fallback>
    <div class="example-loading" role="status">正在加载设计器…</div>
  </template>
</ClientOnly>

“保存草稿”保存当前流程的内存快照，“恢复草稿”会覆盖当前画布。“重置流程”恢复当前预置流程。切换预置流程也会替换画布；刷新页面后草稿清空。

## 可以试试

1. 在“审批流程”中点击“主管审批”，修改名称与 `approverIds` 配置，然后保存。
2. 将鼠标移到“+”入口，选择“填写”或“抄送”，查看节点与连线的变化。
3. 切换“条件分支”，点击容器右侧的加号增加条件。兜底条件始终放在末尾。
4. 切换“循环流程”，在循环内部的添加入口中选择“退出循环”。
5. 保存草稿，再删除节点，最后恢复草稿，比较下方节点 JSON。

## 在 VitePress 中加载

通过 `ClientOnly` 和动态导入避免在服务端初始化画布。交互示例的样式随异步组件一同加载。

```vue
<script setup lang="ts">
import { defineAsyncComponent } from "vue";
const WorkflowExample = defineAsyncComponent(() => import("./WorkflowExample.vue"));
</script>

<ClientOnly>
  <WorkflowExample />
  <template #fallback>正在加载设计器…</template>
</ClientOnly>
```

## 示例源码

示例直接使用公共的 `Designer`、`WorkflowNode` 与节点类型常量；预置流程也采用可保存的节点模型。配置和草稿逻辑可作为业务接入参考。

::: details 查看完整组件

<<< ./WorkflowExample.vue

:::
