import type { WorkflowNodeType } from "../types";
import { WORKFLOW_NODE_TYPE } from "./constant";

export interface NodeDimensions {
  readonly width: number;
  readonly height: number;
  readonly gap?: number;
}

/** 节点外框、布局间距和循环回线偏移，单位 px。 */
export const WORKFLOW_NODE_DIMENSIONS = {
  /** 串行节点之间的默认纵向间距。 */
  gap: 40,
  common: { width: 360, height: 124 },
  branch: { width: 360, height: 56, gap: 40 },
  terminal: { width: 104, height: 40 },
  add: { width: 40, height: 40 },
  loop: {
    /** 回线向右绕行的距离。 */
    edgeOffsetX: 200,
    /** 回线在末尾节点下方预留的距离。 */
    edgeOffsetY: 50,
  },
} as const satisfies Record<"common" | "branch" | "terminal" | "add", NodeDimensions> & {
  gap: number;
  loop: { edgeOffsetX: number; edgeOffsetY: number };
};

export function getNodeDimensions(type: WorkflowNodeType): NodeDimensions {
  if (type === WORKFLOW_NODE_TYPE.START || type === WORKFLOW_NODE_TYPE.END) {
    return WORKFLOW_NODE_DIMENSIONS.terminal;
  }
  if (type === WORKFLOW_NODE_TYPE.ADD) {
    return WORKFLOW_NODE_DIMENSIONS.add;
  }
  if (type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH) {
    return WORKFLOW_NODE_DIMENSIONS.branch;
  }
  return WORKFLOW_NODE_DIMENSIONS.common;
}
