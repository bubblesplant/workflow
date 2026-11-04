import { WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "./constant";
import type { VueFlowNodeProps } from "../types";

/** 每次创建独立的初始数据，供 v-model:nodes 初始化。 */
export function createDefaultNodes<TConfig = unknown>(): VueFlowNodeProps<TConfig>[] {
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
