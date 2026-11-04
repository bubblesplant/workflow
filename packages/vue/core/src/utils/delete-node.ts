import type { VueFlowNodeProps } from "../types";
import { WORKFLOW_NODE_TYPE } from "./constant";

function getConditions<TConfig>(nodes: readonly VueFlowNodeProps<TConfig>[], parentNode?: string) {
  return nodes.filter(
    (node) => node.parentNode === parentNode && node.data?.type === WORKFLOW_NODE_TYPE.CONDITION,
  );
}

/** 条件数量按所属分支计算，兜底条件、开始、结束和添加入口不允许单独删除。 */
export function canDeleteNode<TConfig>(
  nodes: readonly VueFlowNodeProps<TConfig>[],
  nodeId: string,
): boolean {
  const node = nodes.find((entry) => entry.id === nodeId);
  if (!node || node.deletable === false) return false;
  switch (node.data?.type) {
    case WORKFLOW_NODE_TYPE.START:
    case WORKFLOW_NODE_TYPE.END:
    case WORKFLOW_NODE_TYPE.ADD:
      return false;
    case WORKFLOW_NODE_TYPE.CONDITION:
      return !node.data.isDefaultCondition && getConditions(nodes, node.parentNode).length > 2;
    default:
      return true;
  }
}

/** 删除节点及其子树，合并删除位置两侧的添加入口；不计算画布位置。 */
export function removeNode<TConfig>(
  nodes: readonly VueFlowNodeProps<TConfig>[],
  nodeId: string,
): VueFlowNodeProps<TConfig>[] {
  const target = nodes.find((node) => node.id === nodeId);
  if (!target) {
    throw new Error(`删除节点失败：节点「${nodeId}」不存在。`);
  }
  if (!canDeleteNode(nodes, nodeId)) {
    if (target.data?.type === WORKFLOW_NODE_TYPE.CONDITION && target.data.isDefaultCondition) {
      throw new Error("删除节点失败：“其他”兜底条件不允许单独删除。");
    }
    if (
      target.data?.type === WORKFLOW_NODE_TYPE.CONDITION &&
      getConditions(nodes, target.parentNode).length <= 2
    ) {
      throw new Error("删除节点失败：每个条件分支至少保留 2 个条件节点。");
    }
    throw new Error(`删除节点失败：节点「${nodeId}」不允许删除。`);
  }

  // 按 parentNode 收集全部后代，不依赖父子节点在数组中的先后位置。
  const children = new Map<string, string[]>();
  for (const node of nodes) {
    if (node.parentNode === undefined) continue;
    const siblings = children.get(node.parentNode) ?? [];
    siblings.push(node.id);
    children.set(node.parentNode, siblings);
  }
  const removed = new Set<string>();
  const pending = [nodeId];
  while (pending.length > 0) {
    const id = pending.pop()!;
    if (removed.has(id)) continue;
    removed.add(id);
    for (const childId of children.get(id) ?? []) pending.push(childId);
  }

  // 只合并本次删除产生的相邻入口，保留前一个入口及其属性。
  const siblings = nodes.filter((node) => node.parentNode === target.parentNode);
  const index = siblings.findIndex((node) => node.id === nodeId);
  const previous = siblings[index - 1];
  const next = siblings[index + 1];
  if (
    previous?.data?.type === WORKFLOW_NODE_TYPE.ADD &&
    next?.data?.type === WORKFLOW_NODE_TYPE.ADD
  ) {
    removed.add(next.id);
  }

  let remaining = nodes.filter((node) => !removed.has(node.id));
  if (target.data?.type === WORKFLOW_NODE_TYPE.CONDITION) {
    // 保持现有显示顺序，普通条件重新连续编号，兜底条件不参与编号。
    const conditions = getConditions(remaining, target.parentNode)
      .filter((node) => !node.data?.isDefaultCondition)
      .sort(
        (left, right) =>
          (left.data?.conditionIndex ?? Number.MAX_SAFE_INTEGER) -
          (right.data?.conditionIndex ?? Number.MAX_SAFE_INTEGER),
      );
    const indices = new Map(
      conditions.map((node, conditionIndex) => [node.id, conditionIndex + 1]),
    );
    remaining = remaining.map((node) => {
      const conditionIndex = indices.get(node.id);
      return conditionIndex === undefined
        ? node
        : { ...node, data: { ...node.data!, conditionIndex, label: `条件规则${conditionIndex}` } };
    });
  }

  return remaining;
}
