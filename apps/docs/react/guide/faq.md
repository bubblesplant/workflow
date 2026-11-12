# React 常见问题

## 画布没有显示

确认已导入 `@bubblesjs/workflow-react-core/style.css`，父容器具有明确高度，例如 640px。使用 `createDefaultNodes()` 初始化 `nodes`；同页多个实例必须使用不同的 `id`。

画布在客户端挂载后延迟加载。若一直停在加载状态，请检查浏览器控制台和客户端资源请求。

## 添加节点后为什么没有保留

`Designer` 是受控组件。传入 `nodes={nodes}` 时，还需通过 `onNodesChange={setNodes}` 接收并回写新数组。业务配置也应使用不可变更新，见[节点业务配置](./configuration)。

## 为什么没有 onNodeClick 回调

开始、结束和添加入口不触发业务节点配置回调；只读模式也不触发。编辑模式点击业务卡片后，回调提供 `{ id, type }`，可按 ID 读取当前节点。

## 能手动拖动节点或编辑连线吗

当前设计器采用自动布局。源节点顺序和 `parentNode` 决定结构，公共 API 未提供手动布局或连线编辑开关。

## 如何同步编辑和只读预览

让两个实例共享同一份节点状态：

```tsx
<div style={{ height: 640 }}>
  <Designer id="editor" nodes={nodes} onNodesChange={setNodes} />
</div>
<div style={{ height: 640 }}>
  <Designer id="preview" nodes={nodes} readonly />
</div>
```

## 为什么不能删除“其他”条件

兜底条件必须保留在条件组最后，不能单独删除；同组至少保留两条条件。移除整组时，删除条件分支容器。条件标题固定为“条件规则 N”或“其他”，业务表达式放在 `data.config` 中。

## 如何添加退出循环

在循环内部的添加入口中选择“退出循环”。它退出最近一层循环，也可以位于该循环内的条件路径中。循环和退出表达式由业务系统执行。

## 如何用于 SSR 项目

`Designer` 在服务端输出占位容器，挂载后才加载 FlowGram 画布。业务状态和交互仍需放在客户端组件中；例如 Next.js App Router 的编辑器文件应声明 `"use client"`，浏览器存储操作放在事件或 effect 中。

## 流程记录能独立安装吗

可以，安装 `@bubblesjs/workflow-react-history` 并导入它的 `style.css`。它不依赖设计器节点数据，也不执行审批，详见[流程记录](./history)。
