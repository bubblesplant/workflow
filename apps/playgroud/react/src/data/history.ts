import type { WorkflowHistoryRecord } from "@bubblesjs/workflow-react-history";

export const historyRecords: WorkflowHistoryRecord[] = [
  {
    id: "submitted",
    title: "发起申请",
    status: "info",
    statusText: "已提交",
    operator: { name: "王晓雨", description: "产品研发部" },
    time: "2026-11-09 09:12",
    datetime: "2026-11-09T09:12:00+08:00",
    opinionLabel: "申请说明",
    opinion: "因新项目研发需要，申请采购办公及测试设备，明细见附件。",
    fields: [
      { label: "预算金额", value: "¥ 18,600.00" },
      { label: "补充次数", value: 0 },
      { label: "紧急采购", value: false },
    ],
    attachments: [{ id: "purchase-list", name: "办公设备采购明细.pdf", size: "128 KB" }],
  },
  {
    id: "manager",
    title: "部门负责人审批",
    status: "success",
    operator: { name: "张敏", description: "部门负责人" },
    time: "2026-11-09 09:38",
    datetime: "2026-11-09T09:38:00+08:00",
    opinion: "同意，符合本季度采购计划。\n请财务核对预算后安排采购。",
  },
  {
    id: "finance",
    title: "财务审核",
    status: "processing",
    operator: { name: "李明", description: "财务经理" },
    time: "2026-11-09 09:38 到达",
    datetime: "2026-11-09T09:38:00+08:00",
  },
  {
    id: "notification",
    title: "通知采购负责人",
    status: "pending",
    statusText: "待流转",
    operator: { name: "陈倩", description: "行政采购" },
  },
];

export const supplierQuotes = [
  { name: "办公设备供应商 A", amount: "¥ 18,600.00" },
  { name: "办公设备供应商 B", amount: "¥ 19,200.00" },
];
