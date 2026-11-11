import type { NodeData, WorkflowNode, WorkflowNodeType } from "../types";
import { WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "./constant";

export type AddableNodeType =
  | typeof WORKFLOW_NODE_TYPE.APPROVAL
  | typeof WORKFLOW_NODE_TYPE.FILL
  | typeof WORKFLOW_NODE_TYPE.COPY
  | typeof WORKFLOW_NODE_TYPE.CONDITION_BRANCH
  | typeof WORKFLOW_NODE_TYPE.LOOP
  | typeof WORKFLOW_NODE_TYPE.EXIT_LOOP;

export interface AddNodeOption {
  type: AddableNodeType;
  label: string;
}

type CreateNode<TConfig> = (
  type: WorkflowNodeType,
  label: string,
  parentNode?: string,
  data?: Partial<NodeData<TConfig>>,
) => WorkflowNode<TConfig>;

type InsertHandler = <TConfig>(
  createNode: CreateNode<TConfig>,
  option: AddNodeOption,
) => WorkflowNode<TConfig>[];

function createNodeFactory<TConfig>(
  nodes: readonly WorkflowNode<TConfig>[],
  defaultParentNode?: string,
): CreateNode<TConfig> {
  const ids = new Set(nodes.map((node) => node.id));
  let nextId = 1;
  return (type, label, parentNode = defaultParentNode, data = {}) => {
    let id: string;
    do {
      id = `${type}-${nextId++}`;
    } while (ids.has(id));
    ids.add(id);
    return {
      id,
      type: WORKFLOW_NODE_SLOT,
      ...(parentNode === undefined ? {} : { parentNode }),
      data: { ...data, type, label },
    };
  };
}

function addCommonNode<TConfig>(
  createNode: CreateNode<TConfig>,
  option: AddNodeOption,
): WorkflowNode<TConfig>[] {
  return [createNode(option.type, option.label), createNode(WORKFLOW_NODE_TYPE.ADD, "添加节点")];
}

function addConditionBranchNode<TConfig>(
  createNode: CreateNode<TConfig>,
  option: AddNodeOption,
): WorkflowNode<TConfig>[] {
  const branch = createNode(WORKFLOW_NODE_TYPE.CONDITION_BRANCH, option.label);
  const condition = createNode(WORKFLOW_NODE_TYPE.CONDITION, "条件规则1", branch.id, {
    conditionIndex: 1,
  });
  const fallback = createNode(WORKFLOW_NODE_TYPE.CONDITION, "其他", branch.id, {
    isDefaultCondition: true,
  });
  return [
    branch,
    condition,
    createNode(WORKFLOW_NODE_TYPE.ADD, "添加节点", condition.id),
    fallback,
    createNode(WORKFLOW_NODE_TYPE.ADD, "添加节点", fallback.id),
    createNode(WORKFLOW_NODE_TYPE.ADD, "添加节点"),
  ];
}

function addLoopNode<TConfig>(
  createNode: CreateNode<TConfig>,
  option: AddNodeOption,
): WorkflowNode<TConfig>[] {
  const loop = createNode(WORKFLOW_NODE_TYPE.LOOP, option.label);
  return [
    loop,
    createNode(WORKFLOW_NODE_TYPE.ADD, "添加节点", loop.id),
    createNode(WORKFLOW_NODE_TYPE.ADD, "添加节点"),
  ];
}

function addExitLoopNode<TConfig>(
  createNode: CreateNode<TConfig>,
  option: AddNodeOption,
): WorkflowNode<TConfig>[] {
  // 退出后不再执行当前循环的剩余节点，无须追加添加入口。
  return [createNode(WORKFLOW_NODE_TYPE.EXIT_LOOP, option.label)];
}

const insertHandlers = {
  [WORKFLOW_NODE_TYPE.APPROVAL]: addCommonNode,
  [WORKFLOW_NODE_TYPE.FILL]: addCommonNode,
  [WORKFLOW_NODE_TYPE.COPY]: addCommonNode,
  [WORKFLOW_NODE_TYPE.CONDITION_BRANCH]: addConditionBranchNode,
  [WORKFLOW_NODE_TYPE.LOOP]: addLoopNode,
  [WORKFLOW_NODE_TYPE.EXIT_LOOP]: addExitLoopNode,
} satisfies Record<AddNodeOption["type"], InsertHandler>;

/** 支持条件分支内的循环退出，也支持多层嵌套循环。 */
export function isInsideLoop<TConfig>(
  nodes: readonly WorkflowNode<TConfig>[],
  nodeId: string,
): boolean {
  const entries = new Map(nodes.map((node) => [node.id, node]));
  const visited = new Set<string>();
  let parentId = entries.get(nodeId)?.parentNode;
  while (parentId !== undefined && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = entries.get(parentId);
    if (parent?.data?.type === WORKFLOW_NODE_TYPE.LOOP) return true;
    parentId = parent?.parentNode;
  }
  return false;
}

/** 保留点击的添加节点，在其后插入对应结构，继承所在层级；不计算画布位置。 */
export function insertNode<TConfig>(
  nodes: readonly WorkflowNode<TConfig>[],
  addNodeId: string,
  option: AddNodeOption,
): WorkflowNode<TConfig>[] {
  const index = nodes.findIndex((node) => node.id === addNodeId);
  const anchor = nodes[index];
  if (!anchor || anchor.data?.type !== WORKFLOW_NODE_TYPE.ADD) {
    throw new Error(`添加节点失败：找不到添加入口「${addNodeId}」。`);
  }
  if (option.type === WORKFLOW_NODE_TYPE.EXIT_LOOP && !isInsideLoop(nodes, addNodeId)) {
    throw new Error("添加节点失败：退出循环只能添加在循环内部。");
  }

  const createNode = createNodeFactory(nodes, anchor.parentNode);
  const inserted = insertHandlers[option.type](createNode, option);
  return [...nodes.slice(0, index + 1), ...inserted, ...nodes.slice(index + 1)];
}

/** 在指定条件分支中增加普通条件及其添加入口，兜底条件始终保留在最后。 */
export function insertConditionBranch<TConfig>(
  nodes: readonly WorkflowNode<TConfig>[],
  branchId: string,
): WorkflowNode<TConfig>[] {
  const branch = nodes.find((node) => node.id === branchId);
  if (branch?.data?.type !== WORKFLOW_NODE_TYPE.CONDITION_BRANCH) {
    throw new Error(`添加分支失败：找不到条件分支「${branchId}」。`);
  }

  const conditions = nodes.filter(
    (node) =>
      node.parentNode === branchId &&
      node.data?.type === WORKFLOW_NODE_TYPE.CONDITION &&
      !node.data.isDefaultCondition,
  );
  const conditionIndex =
    Math.max(conditions.length, ...conditions.map((node) => node.data?.conditionIndex ?? 0)) + 1;
  const createNode = createNodeFactory(nodes, branchId);
  const condition = createNode(
    WORKFLOW_NODE_TYPE.CONDITION,
    `条件规则${conditionIndex}`,
    branchId,
    {
      conditionIndex,
    },
  );
  const conditionAdd = createNode(WORKFLOW_NODE_TYPE.ADD, "添加节点", condition.id);
  const fallbackIndex = nodes.findIndex(
    (node) => node.parentNode === branchId && node.data?.isDefaultCondition,
  );
  const index = fallbackIndex === -1 ? nodes.length : fallbackIndex;

  return [...nodes.slice(0, index), condition, conditionAdd, ...nodes.slice(index)];
}
