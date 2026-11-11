import { WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "./constant";
import type { WorkflowNode } from "../types";

/** 每次创建相互独立的初始数据，供 React 受控状态初始化。 */
export function createDefaultNodes<TConfig = unknown>(): WorkflowNode<TConfig>[] {
  return [
    {
      id: "1",
      type: WORKFLOW_NODE_SLOT,
      data: { label: "Node 1", type: WORKFLOW_NODE_TYPE.START },
    },
    {
      id: "2",
      type: WORKFLOW_NODE_SLOT,
      data: { label: "Node 2", type: WORKFLOW_NODE_TYPE.ADD },
    },
    {
      id: "3",
      type: WORKFLOW_NODE_SLOT,
      data: { label: "Node 3", type: WORKFLOW_NODE_TYPE.END },
    },
  ];
}

export const defaultNodes = createDefaultNodes();
