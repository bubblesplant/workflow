import { describe, expect, it } from "vite-plus/test";
import type { VueFlowNode, VueFlowNodeProps, WorkflowNodeType } from "../types";
import { layoutWorkflow } from "./auto-layout-node-position";
import { WORKFLOW_NODE_TYPE } from "./constant";
import { getNodeDimensions, WORKFLOW_NODE_DIMENSIONS } from "./node-dimensions";

function node(id: string, type: WorkflowNodeType, parentNode?: string): VueFlowNodeProps {
  return { id, parentNode, data: { type, label: id } };
}

function bounds(
  nodes: VueFlowNode[],
  id: string,
): { right: number; bottom: number; x: number; y: number } {
  const entry = nodes.find((item) => item.id === id)!;
  const parent = entry.parentNode ? bounds(nodes, entry.parentNode) : { x: 0, y: 0 };
  const dimensions = getNodeDimensions(entry.data?.type ?? WORKFLOW_NODE_TYPE.COMMON);
  const x = parent.x + entry.position.x;
  const y = parent.y + entry.position.y;
  return { x, y, right: x + dimensions.width, bottom: y + dimensions.height };
}

describe("循环回线布局", () => {
  it("回线沿完整条件子树外侧绕行，不使用循环卡片的固定水平偏移", () => {
    const input = [
      node("loop", WORKFLOW_NODE_TYPE.LOOP),
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH, "loop"),
      node("left", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("left-add", WORKFLOW_NODE_TYPE.ADD, "left"),
      node("right", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("right-add", WORKFLOW_NODE_TYPE.ADD, "right"),
      node("after-branch", WORKFLOW_NODE_TYPE.ADD, "loop"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ];
    const original = structuredClone(input);
    const { nodes, loopRoutes } = layoutWorkflow(input);
    const route = loopRoutes.get("loop")!;

    expect(route.right).toBeGreaterThan(bounds(nodes, "right").right);
    expect(route.bottom - bounds(nodes, "after-branch").bottom).toBe(
      WORKFLOW_NODE_DIMENSIONS.loop.edgeOffsetY,
    );
    expect(bounds(nodes, "end").y - route.bottom).toBe(WORKFLOW_NODE_DIMENSIONS.gap);
    expect(input).toEqual(original);
    expect(layoutWorkflow(nodes)).toEqual({ nodes, loopRoutes });
  });

  it("循环以不同高度的分支结束时，回线底边位于最长分支下方", () => {
    const { nodes, loopRoutes } = layoutWorkflow([
      node("loop", WORKFLOW_NODE_TYPE.LOOP),
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH, "loop"),
      node("long", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("approval", WORKFLOW_NODE_TYPE.APPROVAL, "long"),
      node("last", WORKFLOW_NODE_TYPE.ADD, "long"),
      node("short", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
    ]);
    const route = loopRoutes.get("loop")!;

    expect(route.bottom - bounds(nodes, "last").bottom).toBe(
      WORKFLOW_NODE_DIMENSIONS.loop.edgeOffsetY,
    );
    expect(route.right).toBeGreaterThan(bounds(nodes, "short").right);
  });

  it("嵌套循环分别预留通道，外层回线位于内层回线之外", () => {
    const { nodes, loopRoutes } = layoutWorkflow([
      node("outer", WORKFLOW_NODE_TYPE.LOOP),
      node("inner", WORKFLOW_NODE_TYPE.LOOP, "outer"),
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH, "inner"),
      node("left", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("right", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("outer-add", WORKFLOW_NODE_TYPE.ADD, "outer"),
    ]);
    const inner = loopRoutes.get("inner")!;
    const outer = loopRoutes.get("outer")!;

    expect(inner.right).toBeGreaterThan(bounds(nodes, "right").right);
    expect(outer.right).toBeGreaterThan(inner.right);
    expect(outer.bottom).toBeGreaterThan(inner.bottom);
  });

  it("并行分支中的循环回线与相邻条件卡片保持间距", () => {
    const { nodes, loopRoutes } = layoutWorkflow([
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
      node("left", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("loop", WORKFLOW_NODE_TYPE.LOOP, "left"),
      node("loop-add", WORKFLOW_NODE_TYPE.ADD, "loop"),
      node("right", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("approval", WORKFLOW_NODE_TYPE.APPROVAL, "right"),
    ]);
    const route = loopRoutes.get("loop")!;

    expect(route.right).toBeGreaterThan(bounds(nodes, "loop").right);
    expect(bounds(nodes, "right").x - route.right).toBeGreaterThanOrEqual(
      WORKFLOW_NODE_DIMENSIONS.branch.gap,
    );
  });

  it("普通循环保留原有回线位置，空循环和空画布不生成通道", () => {
    const { nodes, loopRoutes } = layoutWorkflow([
      { ...node("loop", WORKFLOW_NODE_TYPE.LOOP), position: { x: 75, y: 120 } },
      node("add", WORKFLOW_NODE_TYPE.ADD, "loop"),
      node("empty", WORKFLOW_NODE_TYPE.LOOP),
    ]);
    const loop = bounds(nodes, "loop");

    expect(loopRoutes.get("loop")?.right).toBe(
      loop.x +
        WORKFLOW_NODE_DIMENSIONS.common.width / 2 +
        WORKFLOW_NODE_DIMENSIONS.loop.edgeOffsetX,
    );
    expect(loopRoutes.has("empty")).toBe(false);
    expect(layoutWorkflow([])).toEqual({ nodes: [], loopRoutes: new Map() });
  });
});
