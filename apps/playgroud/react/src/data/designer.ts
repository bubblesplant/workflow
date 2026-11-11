import type { WorkflowNode } from "@bubblesjs/workflow-react-core";

export type BusinessConfig = Record<string, unknown>;

export function createDesignerNodes(): WorkflowNode<BusinessConfig>[] {
  return [
    { id: "start", data: { type: "start", label: "开始" } },
    { id: "add-start", data: { type: "add", label: "添加节点" } },
    {
      id: "approval-manager",
      data: {
        type: "approval",
        label: "部门负责人审批",
        description: "确认采购需求与预算",
        config: { approverIds: ["department-manager"], approvalMode: "any" },
      },
    },
    { id: "add-before-budget", data: { type: "add", label: "添加节点" } },
    {
      id: "budget-branch",
      data: { type: "condition-branch", label: "按采购预算分流" },
    },
    {
      id: "budget-large",
      parentNode: "budget-branch",
      data: {
        type: "condition",
        label: "条件规则1",
        conditionIndex: 1,
        description: "采购预算 ≥ ¥10,000",
        config: { field: "budget", operator: "gte", value: 10000 },
      },
    },
    {
      id: "add-before-details",
      parentNode: "budget-large",
      data: { type: "add", label: "添加节点" },
    },
    {
      id: "fill-details",
      parentNode: "budget-large",
      data: {
        type: "fill",
        label: "补充采购明细",
        description: "提交设备明细与供应商报价",
        config: { requiredFields: ["items", "quotation"] },
      },
    },
    {
      id: "add-after-details",
      parentNode: "budget-large",
      data: { type: "add", label: "添加节点" },
    },
    {
      id: "budget-other",
      parentNode: "budget-branch",
      data: {
        type: "condition",
        label: "其他",
        isDefaultCondition: true,
        description: "未满足预算条件时进入此分支",
      },
    },
    {
      id: "add-before-copy",
      parentNode: "budget-other",
      data: { type: "add", label: "添加节点" },
    },
    {
      id: "copy-purchasing",
      parentNode: "budget-other",
      data: {
        type: "copy",
        label: "抄送采购专员",
        description: "通知采购部门安排采购",
        config: { recipientIds: ["purchasing-specialist"] },
      },
    },
    {
      id: "add-after-copy",
      parentNode: "budget-other",
      data: { type: "add", label: "添加节点" },
    },
    { id: "add-after-budget", data: { type: "add", label: "添加节点" } },
    { id: "end", data: { type: "end", label: "结束" } },
  ];
}
