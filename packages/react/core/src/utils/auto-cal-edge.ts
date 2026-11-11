import type { WorkflowRenderEdge, WorkflowNode } from "../types";
import { WORKFLOW_EDGE_TYPE, WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "./index";

interface EdgeNode<TConfig> {
  node: WorkflowNode<TConfig>;
  children: EdgeNode<TConfig>[];
}

interface EdgeTarget {
  id: string;
  /** 为 true 时，将当前连边标记为循环回线。 */
  loop?: boolean;
}

/**
 * 数组顺序表示同层执行顺序，parentNode 表示所属节点，不依赖 position。
 * 条件分支并行展开，各分支末尾汇入后续节点；其他子节点按顺序串联。
 * 循环体末尾连接后续节点并生成回线，exit-loop 在卡片处终止连线。
 * end 和 exit-loop 不生成出边，空循环不生成回线；不修改输入节点。
 */
export function autoCalEdge<TConfig>(
  nodes: readonly WorkflowNode<TConfig>[],
): WorkflowRenderEdge[] {
  const entries = new Map<string, EdgeNode<TConfig>>();
  const roots: EdgeNode<TConfig>[] = [];

  // 步骤 1：按 ID 建立索引并检查重复；只创建内部包装对象，不修改传入节点。
  for (const node of nodes) {
    if (entries.has(node.id)) {
      throw new Error(`自动连边失败：节点 ID「${node.id}」重复。`);
    }
    entries.set(node.id, { node, children: [] });
  }

  // 步骤 2：根据 parentNode 建立父子树，并保留同层节点的输入顺序。
  for (const entry of entries.values()) {
    const parentId = entry.node.parentNode;
    if (parentId === undefined) {
      roots.push(entry);
      continue;
    }
    const parent = entries.get(parentId);
    if (!parent) {
      throw new Error(`自动连边失败：节点「${entry.node.id}」的父节点「${parentId}」不存在。`);
    }
    parent.children.push(entry);
  }

  // 步骤 3：校验父子引用环并整理条件顺序；visiting 记录递归路径，visited 跳过已校验节点。
  const visiting = new Set<EdgeNode<TConfig>>();
  const visited = new Set<EdgeNode<TConfig>>();
  const validate = (entry: EdgeNode<TConfig>): void => {
    if (visited.has(entry)) return;
    if (visiting.has(entry)) {
      throw new Error(`自动连边失败：节点「${entry.node.id}」的父子关系存在循环。`);
    }
    visiting.add(entry);
    if (entry.node.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH) {
      // 普通条件按编号升序排列，未编号的排在已编号的之后，兜底条件始终最后。
      entry.children.sort((left, right) => {
        const defaultOrder =
          Number(Boolean(left.node.data?.isDefaultCondition)) -
          Number(Boolean(right.node.data?.isDefaultCondition));
        return (
          defaultOrder ||
          (left.node.data?.conditionIndex ?? Number.MAX_SAFE_INTEGER) -
            (right.node.data?.conditionIndex ?? Number.MAX_SAFE_INTEGER)
        );
      });
    }
    for (const child of entry.children) validate(child);
    visiting.delete(entry);
    visited.add(entry);
  };
  // 从全部节点发起校验，避免漏掉脱离根节点的父子引用环。
  for (const entry of entries.values()) validate(entry);

  // 步骤 4：统一创建边，使用工作流边插槽，并通过 data.type 区分循环回线。
  const edges: WorkflowRenderEdge[] = [];
  // 转义分隔符，避免不同的 source/target 组合生成相同 ID。
  const encodeId = (id: string): string => encodeURIComponent(id).replaceAll("-", "%2D");
  const connect = (source: string, targets: readonly EdgeTarget[]): void => {
    for (const target of targets) {
      edges.push({
        id: `e${encodeId(source)}-${encodeId(target.id)}${target.loop ? "-loop" : ""}`,
        source,
        target: target.id,
        type: WORKFLOW_NODE_SLOT,
        ...(target.loop ? { data: { type: WORKFLOW_EDGE_TYPE.LOOP } } : {}),
      });
    }
  };

  /**
   * 步骤 5：按节点类型递归展开出边。
   * targets 是当前节点或其子树正常执行完成后的去向，可同时包含后续节点和循环回线。
   */
  const visitNode = (entry: EdgeNode<TConfig>, targets: readonly EdgeTarget[]): void => {
    const { node, children } = entry;
    // 结束和退出循环都在当前卡片处终止连线，不参与后续汇合或生成循环回线。
    if (
      node.data?.type === WORKFLOW_NODE_TYPE.END ||
      node.data?.type === WORKFLOW_NODE_TYPE.EXIT_LOOP
    ) {
      return;
    }

    const firstChild = children[0];
    if (!firstChild) {
      // 叶节点直接连接后续目标；空分支和空循环也走这里，不额外生成循环回线。
      connect(node.id, targets);
      return;
    }

    if (node.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH) {
      // 条件分支分别连向每个条件入口，并将同一组后续目标传给各分支，实现末尾汇合。
      for (const child of children) {
        connect(node.id, [{ id: child.node.id }]);
        visitNode(child, targets);
      }
      return;
    }

    // 其余有子节点的节点先进入第一个子节点，子节点之间再按顺序串联。
    connect(node.id, [{ id: firstChild.node.id }]);
    if (node.data?.type === WORKFLOW_NODE_TYPE.LOOP) {
      // 循环体末尾同时连接正常后续目标和循环入口。
      visitSequence(children, [...targets, { id: node.id, loop: true }]);
    } else {
      visitSequence(children, targets);
    }
  };

  // 步骤 6：串联同层节点；当前节点完成后进入下一个兄弟节点，最后一个再接外层后续目标。
  const visitSequence = (
    sequence: readonly EdgeNode<TConfig>[],
    targets: readonly EdgeTarget[],
  ): void => {
    sequence.forEach((entry, index) => {
      const next = sequence[index + 1];
      visitNode(entry, next ? [{ id: next.node.id }] : targets);
    });
  };

  // 步骤 7：从根节点序列开始展开；最外层没有后续目标，因此传入空数组。
  visitSequence(roots, []);
  return edges;
}
