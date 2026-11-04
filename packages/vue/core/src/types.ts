import { WORKFLOW_NODE_TYPE } from "./utils/constant";
import { type Edge, type Node } from "@vue-flow/core";

export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPE)[keyof typeof WORKFLOW_NODE_TYPE];

export interface NodeData<TConfig = unknown> {
  type: WorkflowNodeType;
  label: string;
  description?: string;
  /** 使用方维护的节点业务配置，设计器负责原样保留。 */
  config?: TConfig;
  /** 条件在所属分支中的序号，从 1 开始。 */
  conditionIndex?: number;
  /** 兜底条件，应始终放在同组条件的最后，且不允许单独删除。 */
  isDefaultCondition?: boolean;
}

export interface VueFlowNode<TConfig = unknown> extends Node<NodeData<TConfig>> {}

/** 可保存的设计器节点；画布运行时的尺寸、选中状态等由 Vue Flow 内部管理。 */
export interface WorkflowNode<TConfig = unknown> {
  id: string;
  /** Vue Flow 渲染类型；省略时使用设计器的 workflow 节点。 */
  type?: string;
  parentNode?: string;
  data?: NodeData<TConfig>;
  deletable?: boolean;
  /** 可选的布局起点，实际渲染位置由设计器计算。 */
  position?: { x: number; y: number };
}

export type VueFlowNodeProps<TConfig = unknown> = WorkflowNode<TConfig>;

export interface WorkflowNodeClickEvent {
  id: string;
  type: Exclude<
    WorkflowNodeType,
    typeof WORKFLOW_NODE_TYPE.ADD | typeof WORKFLOW_NODE_TYPE.START | typeof WORKFLOW_NODE_TYPE.END
  >;
}

export type VueFlowEdge = Edge & {};
