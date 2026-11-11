import { createContext, useContext } from "react";
import type { WorkflowNode } from "../../types";
import type { AddNodeOption } from "../../utils/add-node";

export interface WorkflowController {
  nodes: readonly WorkflowNode[];
  readonly: boolean;
  selectedId: string;
  select: (id: string) => void;
  insert: (id: string, option: AddNodeOption) => void;
  addBranch: (id: string) => void;
  remove: (id: string) => void;
}

export const WorkflowContext = createContext<WorkflowController | null>(null);
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error("工作流节点必须在 Designer 中渲染。");
  return context;
}
