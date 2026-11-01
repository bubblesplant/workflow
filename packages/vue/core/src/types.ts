import { WORKFLOW_NODE_TYPE } from "./utils";

export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPE)[keyof typeof WORKFLOW_NODE_TYPE];

export interface NodeData {
  type: WorkflowNodeType;
}
