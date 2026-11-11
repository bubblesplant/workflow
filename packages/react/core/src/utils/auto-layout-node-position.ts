import type { WorkflowRenderNode, WorkflowNode } from "../types";
import { WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "./constant";
import {
  getNodeDimensions,
  WORKFLOW_NODE_DIMENSIONS,
  type NodeDimensions,
} from "./node-dimensions";

const NODE_GAP = WORKFLOW_NODE_DIMENSIONS.gap;

interface LayoutNode<TConfig> {
  node: WorkflowRenderNode<TConfig>;
  /** 节点自身的外框尺寸，不包含子节点。 */
  dimensions: NodeDimensions;
  children: LayoutNode<TConfig>[];
  /** 子节点区域的总宽度，用于将整个子节点区域居中。 */
  childrenWidth: number;
  /** 当前节点及其整棵子树占用的宽高，包含节点间距和循环回线留白。 */
  width: number;
  height: number;
}

/** 循环回线通道的绝对坐标，包含嵌套循环的占用空间。 */
export interface LoopEdgeRoute {
  right: number;
  bottom: number;
}

/**
 * 按 data.type 布局，数组顺序表示同层执行顺序，parentNode 表示所属节点。
 * condition-branch 的直接子节点并行排列，其余子节点串行排列。
 * 保留首个根节点的位置，未提供时从 (0, 0) 开始。
 * 子节点 position 使用与 Vue 版本兼容的父节点相对坐标；画布适配层再转换。
 */
export const autoLayoutNodePosition = <TConfig>(
  nodes: readonly WorkflowNode<TConfig>[],
): WorkflowRenderNode<TConfig>[] => layoutWorkflow(nodes).nodes;

/** 同时计算节点位置和回线通道，确保连线使用与节点相同的子树边界。 */
export const layoutWorkflow = <TConfig>(
  nodes: readonly WorkflowNode<TConfig>[],
): { nodes: WorkflowRenderNode<TConfig>[]; loopRoutes: Map<string, LoopEdgeRoute> } => {
  const entries = new Map<string, LayoutNode<TConfig>>();
  const roots: LayoutNode<TConfig>[] = [];
  const loopRoutes = new Map<string, LoopEdgeRoute>();

  // 步骤 1：按 ID 建立索引并检查重复；复制节点和坐标，避免布局时修改输入对象。
  for (const node of nodes) {
    if (entries.has(node.id)) {
      throw new Error(`自动布局失败：节点 ID「${node.id}」重复。`);
    }
    const dimensions = getNodeDimensions(node.data?.type ?? WORKFLOW_NODE_TYPE.COMMON);
    entries.set(node.id, {
      node: {
        ...node,
        type: node.type ?? WORKFLOW_NODE_SLOT,
        position: { ...(node.position ?? { x: 0, y: 0 }) },
      },
      dimensions,
      children: [],
      childrenWidth: 0,
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  // 步骤 2：根据 parentNode 建立父子树；Map 保留输入顺序，父节点也可以晚于子节点出现。
  for (const entry of entries.values()) {
    const parentId = entry.node.parentNode;
    if (parentId === undefined) {
      roots.push(entry);
      continue;
    }
    const parent = entries.get(parentId);
    if (!parent) {
      throw new Error(`自动布局失败：节点「${entry.node.id}」的父节点「${parentId}」不存在。`);
    }
    parent.children.push(entry);
  }

  // visiting 记录当前递归路径以检测父子引用环，measured 避免重复测量同一棵子树。
  const visiting = new Set<LayoutNode<TConfig>>();
  const measured = new Set<LayoutNode<TConfig>>();

  // 步骤 3：自底向上测量整棵子树，先确定占用空间，再放置节点，避免嵌套内容重叠。
  const measure = (entry: LayoutNode<TConfig>): void => {
    if (measured.has(entry)) return;
    if (visiting.has(entry)) {
      throw new Error(`自动布局失败：节点「${entry.node.id}」的父子关系存在循环。`);
    }
    visiting.add(entry);

    const isBranch = entry.node.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH;
    if (isBranch) {
      // 普通条件按 conditionIndex 升序排列，未编号的排在已编号的之后，兜底条件始终最后。
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

    let childrenHeight = 0;
    for (const child of entry.children) {
      measure(child);
      if (isBranch) {
        // 并行分支横向展开：宽度相加，高度取最高的子树。
        entry.childrenWidth += child.width;
        childrenHeight = Math.max(childrenHeight, child.height);
      } else {
        // 串行子节点纵向排列：宽度取最宽的子树，高度相加。
        entry.childrenWidth = Math.max(entry.childrenWidth, child.width);
        childrenHeight += child.height;
      }
    }
    if (entry.children.length > 0) {
      // 先补齐子节点之间的间距，再合并父节点自身尺寸及父子之间的纵向间距。
      const gaps = entry.children.length - 1;
      if (isBranch) {
        entry.childrenWidth += gaps * (entry.dimensions.gap ?? NODE_GAP);
      } else {
        childrenHeight += gaps * NODE_GAP;
      }
      entry.width = Math.max(entry.width, entry.childrenWidth);
      entry.height += NODE_GAP + childrenHeight;
      if (entry.node.data?.type === WORKFLOW_NODE_TYPE.LOOP) {
        const { edgeGap, edgeOffsetX, edgeOffsetY } = WORKFLOW_NODE_DIMENSIONS.loop;
        // 对称留白保持节点居中；将回线计入子树宽度，避免侵入相邻分支及外层回线。
        entry.width = Math.max(entry.width + edgeGap * 2, edgeOffsetX * 2);
        entry.height += edgeOffsetY;
      }
    }

    visiting.delete(entry);
    measured.add(entry);
  };

  // 遍历全部节点，确保脱离根节点的父子引用环也会被检测到。
  for (const entry of entries.values()) measure(entry);

  // 步骤 4：以首个根节点原有的中心线和顶部为锚点，其他根节点沿同一中心线向下排列。
  const firstRoot = roots[0];
  if (!firstRoot) return { nodes: [], loopRoutes };
  const centerX = firstRoot.node.position.x + firstRoot.dimensions.width / 2;
  let nextY = firstRoot.node.position.y;

  // 步骤 5：自顶向下放置节点；left/top 是子树区域的绝对坐标，parentPosition 是父节点绝对坐标。
  const place = (
    entry: LayoutNode<TConfig>,
    left: number,
    top: number,
    parentPosition = { x: 0, y: 0 },
  ): void => {
    // 节点自身在子树区域内水平居中，再减去父节点坐标，得到模型的父相对坐标。
    const absolutePosition = {
      x: left + (entry.width - entry.dimensions.width) / 2,
      y: top,
    };
    entry.node.position = {
      x: absolutePosition.x - parentPosition.x,
      y: absolutePosition.y - parentPosition.y,
    };
    if (entry.node.data?.type === WORKFLOW_NODE_TYPE.LOOP && entry.children.length > 0) {
      loopRoutes.set(entry.node.id, {
        right: left + entry.width,
        bottom: top + entry.height,
      });
    }

    const isBranch = entry.node.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH;
    // 子节点区域整体居中，顶部从父节点外框下方一个间距处开始。
    let childLeft = left + (entry.width - entry.childrenWidth) / 2;
    let childTop = top + entry.dimensions.height + NODE_GAP;

    for (const child of entry.children) {
      place(
        child,
        isBranch ? childLeft : left + (entry.width - child.width) / 2,
        childTop,
        absolutePosition,
      );
      // 按完整子树尺寸推进位置：并行分支向右移动，串行子节点向下移动。
      if (isBranch) {
        childLeft += child.width + (entry.dimensions.gap ?? NODE_GAP);
      } else {
        childTop += child.height + NODE_GAP;
      }
    }
  };

  // 步骤 6：依次放置根节点，后续节点避开前一整棵子树，并按输入顺序返回布局结果。
  for (const root of roots) {
    place(root, centerX - root.width / 2, nextY);
    nextY += root.height + NODE_GAP;
  }

  return { nodes: Array.from(entries.values(), (entry) => entry.node), loopRoutes };
};
