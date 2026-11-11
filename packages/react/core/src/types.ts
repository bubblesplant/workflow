import type { WORKFLOW_NODE_TYPE } from "./utils/constant";

export type WorkflowNodeType = (typeof WORKFLOW_NODE_TYPE)[keyof typeof WORKFLOW_NODE_TYPE];

export interface NodeData<TConfig = unknown> {
  type: WorkflowNodeType;
  label: string;
  description?: string;
  /** 使用方维护的节点业务配置，设计器负责原样保留。 */
  config?: TConfig;
  /** 条件在所属分支中的序号，从 1 开始。 */
  conditionIndex?: number;
  /** 兜底条件始终放在同组条件最后，且不可单独删除。 */
  isDefaultCondition?: boolean;
}

/** 可序列化的工作流源数据，数组顺序表示同层执行顺序。 */
export interface WorkflowNode<TConfig = unknown> {
  id: string;
  type?: string;
  parentNode?: string;
  data?: NodeData<TConfig>;
  deletable?: boolean;
  /** 可选布局起点，实际画布坐标由设计器计算。 */
  position?: { x: number; y: number };
}

/** 内部布局结果；子节点 position 相对于 parentNode，不写回源数据。 */
export interface WorkflowRenderNode<TConfig = unknown> extends WorkflowNode<TConfig> {
  position: { x: number; y: number };
}

/** 框架中立的连线，适配画布时转换成引擎的实体结构。 */
export interface WorkflowRenderEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: { type?: string };
}

export interface WorkflowNodeClickEvent {
  id: string;
  type: Exclude<
    WorkflowNodeType,
    typeof WORKFLOW_NODE_TYPE.ADD | typeof WORKFLOW_NODE_TYPE.START | typeof WORKFLOW_NODE_TYPE.END
  >;
}
