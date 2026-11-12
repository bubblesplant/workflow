# React 介绍

Workflow 为 React 应用提供工作流设计器和流程记录组件。`@bubblesjs/workflow-react-core` 基于 FlowGram 编排流程，`@bubblesjs/workflow-react-history` 展示业务系统生成的操作记录，两者可分别安装。

本分区的示例使用 React、TSX 和回调属性。选择 [Vue 文档](/vue/guide/introduction)可查看 Vue 的组件用法。

## 能做什么

- **可视化编排**：添加审批、填写、抄送、条件分支、循环与退出循环，自动计算布局与连线。
- **受控数据**：通过 `nodes` 与 `onNodesChange` 管理完整节点数组。
- **业务配置**：监听 `onNodeClick`，用自己的表单维护节点的 `data.config`。
- **只读展示**：通过 `readonly` 隐藏编辑操作，继续接收外部节点更新。
- **流程记录**：展示操作人、状态、时间、处理意见、扩展字段和附件；支持控制展开状态与自定义渲染。
- **TypeScript 支持**：通过 `WorkflowNode<TConfig>` 描述业务配置类型。

## 从数据到画布

```text
React 应用                        Designer / FlowGram
nodes / data.config    ──────→    自动布局与连线
setNodes               ←──────    onNodesChange(nextNodes)
业务配置表单           ←──────    onNodeClick({ id, type })
```

同层节点按数组顺序执行，`parentNode` 描述嵌套关系。保存源节点数组即可，无需保存画布内部状态。

## 使用范围

支持 React 与 React DOM `^18.2.0 || ^19.0.0`。画布在客户端挂载后延迟加载，组件的父容器需要明确高度。设计器采用自动布局，公共接口未开放拖拽布局、手工连线或自定义节点注册。

组件负责流程编排与记录展示。审批执行、条件求值、权限和数据保存由业务系统实现。

## 接下来

- [快速开始](./getting-started)：安装 React 包并挂载设计器。
- [交互示例](../examples/)：在 React Playground 体验编辑和流程记录。
- [节点业务配置](./configuration)：用不可变更新同步业务表单。
- [流程记录](./history)：使用独立的 history 包展示处理过程。
- [Designer API](../api/designer)：查看 React 属性与回调。
