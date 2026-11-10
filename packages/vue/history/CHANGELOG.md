# @bubblesjs/workflow-vue-history

## 0.2.0

### Minor Changes

- 4817076: 为 WorkflowHistory 增加数据驱动的可折叠流程时间线，支持五种状态、操作人、时间、意见、附件与扩展字段，并提供受控展开、加载和空状态及自定义插槽。
  
  公开 WorkflowAvatar、WorkflowTimelineDot、WorkflowTimelineTag、WorkflowTimelineItem 和 WorkflowTimeline 五个可独立组合的小组件。WorkflowTimelineItem 的正文由使用方通过默认插槽传入，WorkflowHistory 基于这些组件组合并协调记录展开状态。

### Patch Changes

- 80afeb5: git hooks
