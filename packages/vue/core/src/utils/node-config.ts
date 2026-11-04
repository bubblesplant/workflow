import type { WorkflowNodeType } from "../types";
import approvalIcon from "../assets/icon/svg/approval.svg?inline";
import fillIcon from "../assets/icon/svg/fill.svg?inline";
import copyIcon from "../assets/icon/svg/copy.svg?inline";
import conditionBranchIcon from "../assets/icon/svg/condition-branch.svg?inline";
import loopIcon from "../assets/icon/svg/loop.svg?inline";
import exitLoopIcon from "../assets/icon/svg/exit-loop.svg?inline";
import { WORKFLOW_NODE_TYPE } from "./index";

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
  icon: approvalIcon,
} as const;

export const WORKFLOW_NODE_CONFIG = {
  [WORKFLOW_NODE_TYPE.COMMON]: approvalConfig,
  [WORKFLOW_NODE_TYPE.APPROVAL]: approvalConfig,
  [WORKFLOW_NODE_TYPE.FILL]: {
    type: WORKFLOW_NODE_TYPE.FILL,
    label: "填写",
    color: "linear-gradient(135deg, #43b6a5 0%, #2c918f 100%)",
    icon: fillIcon,
  },
  [WORKFLOW_NODE_TYPE.COPY]: {
    type: WORKFLOW_NODE_TYPE.COPY,
    label: "抄送",
    color: "linear-gradient(135deg, #e77b9a 0%, #cf5d86 100%)",
    icon: copyIcon,
  },
  [WORKFLOW_NODE_TYPE.CONDITION_BRANCH]: {
    type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
    label: "条件分支",
    color: "linear-gradient(135deg, #f0a044 0%, #e47b2d 100%)",
    icon: conditionBranchIcon,
  },
  [WORKFLOW_NODE_TYPE.CONDITION]: {
    type: WORKFLOW_NODE_TYPE.CONDITION,
    label: "条件规则",
    color: "linear-gradient(135deg, #f0a044 0%, #e47b2d 100%)",
    icon: conditionBranchIcon,
  },
  [WORKFLOW_NODE_TYPE.LOOP]: {
    type: WORKFLOW_NODE_TYPE.LOOP,
    label: "循环",
    color: "linear-gradient(135deg, #9780db 0%, #7760c2 100%)",
    icon: loopIcon,
  },
  [WORKFLOW_NODE_TYPE.EXIT_LOOP]: {
    type: WORKFLOW_NODE_TYPE.EXIT_LOOP,
    label: "退出循环",
    color: "linear-gradient(135deg, #9ca3af 0%, #788190 100%)",
    icon: exitLoopIcon,
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
    options: [
      WORKFLOW_NODE_CONFIG[WORKFLOW_NODE_TYPE.APPROVAL],
      WORKFLOW_NODE_CONFIG[WORKFLOW_NODE_TYPE.FILL],
      WORKFLOW_NODE_CONFIG[WORKFLOW_NODE_TYPE.COPY],
    ],
  },
  {
    label: "条件",
    options: [WORKFLOW_NODE_CONFIG[WORKFLOW_NODE_TYPE.CONDITION_BRANCH]],
  },
  {
    label: "循环与退出",
    options: [
      WORKFLOW_NODE_CONFIG[WORKFLOW_NODE_TYPE.LOOP],
      WORKFLOW_NODE_CONFIG[WORKFLOW_NODE_TYPE.EXIT_LOOP],
    ],
  },
] as const;
