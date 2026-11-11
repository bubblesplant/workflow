import type { WorkflowNodeType } from "../types";
import { WORKFLOW_NODE_TYPE } from "./constant";

interface NodeConfig {
  type: WorkflowNodeType;
  label: string;
  color: string;
  icon: string;
}

const approvalConfig = {
  type: WORKFLOW_NODE_TYPE.APPROVAL,
  label: "审批",
  color: "linear-gradient(135deg, #5c88ee 0%, #4269d4 100%)",
  icon: "审",
} as const;

export const WORKFLOW_NODE_CONFIG = {
  [WORKFLOW_NODE_TYPE.COMMON]: approvalConfig,
  [WORKFLOW_NODE_TYPE.APPROVAL]: approvalConfig,
  [WORKFLOW_NODE_TYPE.FILL]: {
    type: WORKFLOW_NODE_TYPE.FILL,
    label: "填写",
    color: "linear-gradient(135deg, #43b6a5 0%, #2c918f 100%)",
    icon: "填",
  },
  [WORKFLOW_NODE_TYPE.COPY]: {
    type: WORKFLOW_NODE_TYPE.COPY,
    label: "抄送",
    color: "linear-gradient(135deg, #e77b9a 0%, #cf5d86 100%)",
    icon: "抄",
  },
  [WORKFLOW_NODE_TYPE.CONDITION_BRANCH]: {
    type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
    label: "条件分支",
    color: "linear-gradient(135deg, #f0a044 0%, #e47b2d 100%)",
    icon: "分",
  },
  [WORKFLOW_NODE_TYPE.CONDITION]: {
    type: WORKFLOW_NODE_TYPE.CONDITION,
    label: "条件规则",
    color: "linear-gradient(135deg, #f0a044 0%, #e47b2d 100%)",
    icon: "条",
  },
  [WORKFLOW_NODE_TYPE.LOOP]: {
    type: WORKFLOW_NODE_TYPE.LOOP,
    label: "循环",
    color: "linear-gradient(135deg, #9780db 0%, #7760c2 100%)",
    icon: "循",
  },
  [WORKFLOW_NODE_TYPE.EXIT_LOOP]: {
    type: WORKFLOW_NODE_TYPE.EXIT_LOOP,
    label: "退出循环",
    color: "linear-gradient(135deg, #9ca3af 0%, #788190 100%)",
    icon: "退",
  },
} as const satisfies Record<
  Exclude<
    WorkflowNodeType,
    typeof WORKFLOW_NODE_TYPE.START | typeof WORKFLOW_NODE_TYPE.ADD | typeof WORKFLOW_NODE_TYPE.END
  >,
  NodeConfig
>;

export type CommonNodeType = Exclude<
  keyof typeof WORKFLOW_NODE_CONFIG,
  typeof WORKFLOW_NODE_TYPE.CONDITION_BRANCH
>;

export const WORKFLOW_NODE_GROUPS = [
  {
    label: "普通节点",
    options: [WORKFLOW_NODE_CONFIG.approval, WORKFLOW_NODE_CONFIG.fill, WORKFLOW_NODE_CONFIG.copy],
  },
  { label: "条件", options: [WORKFLOW_NODE_CONFIG[WORKFLOW_NODE_TYPE.CONDITION_BRANCH]] },
  {
    label: "循环与退出",
    options: [WORKFLOW_NODE_CONFIG.loop, WORKFLOW_NODE_CONFIG[WORKFLOW_NODE_TYPE.EXIT_LOOP]],
  },
] as const;
