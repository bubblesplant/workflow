import { describe, expect, it } from "vite-plus/test";
import type { NodeData, WorkflowRenderNode, WorkflowNode, WorkflowNodeType } from "../types";
import { autoLayoutNodePosition } from "./auto-layout-node-position";
import { getNodeDimensions, WORKFLOW_NODE_DIMENSIONS } from "./node-dimensions";
import { WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "./constant";

function node(
  id: string,
  type: WorkflowNodeType,
  parentNode?: string,
  data: Partial<NodeData> = {},
): WorkflowRenderNode {
  return {
    id,
    type: WORKFLOW_NODE_SLOT,
    parentNode,
    data: { label: id, type, ...data },
    position: { x: 250, y: 0 },
  };
}

function bounds(
  nodes: WorkflowRenderNode[],
  id: string,
): { x: number; y: number; right: number; bottom: number; centerX: number } {
  const entry = nodes.find((item) => item.id === id);
  if (!entry) throw new Error(`找不到节点 ${id}`);
  const parent = entry.parentNode ? bounds(nodes, entry.parentNode) : { x: 0, y: 0 };
  const dimensions = getNodeDimensions(entry.data?.type ?? WORKFLOW_NODE_TYPE.COMMON);
  const x = parent.x + entry.position.x;
  const y = parent.y + entry.position.y;
  return {
    x,
    y,
    right: x + dimensions.width,
    bottom: y + dimensions.height,
    centerX: x + dimensions.width / 2,
  };
}

describe("autoLayoutNodePosition", () => {
  it("空数组返回空数组", () => {
    expect(autoLayoutNodePosition([])).toEqual([]);
  });

  it("省略 type 和 position 时补齐根节点及子节点的渲染类型和坐标", () => {
    const input: readonly WorkflowNode[] = [
      { id: "start", data: { type: WORKFLOW_NODE_TYPE.START, label: "发起" } },
      { id: "loop", type: undefined, data: { type: WORKFLOW_NODE_TYPE.LOOP, label: "循环" } },
      { id: "add", parentNode: "loop", data: { type: WORKFLOW_NODE_TYPE.ADD, label: "添加" } },
      { id: "end", data: { type: WORKFLOW_NODE_TYPE.END, label: "结束" } },
    ];
    const original = structuredClone(input);

    const result = autoLayoutNodePosition(input);

    expect(result.map((entry) => entry.position)).toEqual([
      { x: 0, y: 0 },
      { x: -128, y: 80 },
      { x: 160, y: 164 },
      { x: 0, y: 374 },
    ]);
    expect(result.every((entry) => entry.type === WORKFLOW_NODE_SLOT)).toBe(true);
    expect(input).toEqual(original);
  });

  it("保留显式传入的自定义渲染类型", () => {
    const input = { ...node("custom", WORKFLOW_NODE_TYPE.APPROVAL), type: "custom-renderer" };

    expect(autoLayoutNodePosition([input])[0]?.type).toBe("custom-renderer");
  });

  it("允许混合传入有无 position 的节点，保留首个根节点的锚点", () => {
    const input: WorkflowNode[] = [
      { ...node("start", WORKFLOW_NODE_TYPE.START), position: { x: 75, y: 120 } },
      { id: "approval", data: { type: WORKFLOW_NODE_TYPE.APPROVAL, label: "审批" } },
      node("end", WORKFLOW_NODE_TYPE.END),
    ];

    const result = autoLayoutNodePosition(input);

    expect(result.map((entry) => entry.position)).toEqual([
      { x: 75, y: 120 },
      { x: -53, y: 200 },
      { x: 75, y: 364 },
    ]);
  });

  it("读取 data.type，以首节点为锚点让不同尺寸的串行节点居中", () => {
    const input = [
      node("start", WORKFLOW_NODE_TYPE.START),
      node("approval", WORKFLOW_NODE_TYPE.APPROVAL),
      node("add", WORKFLOW_NODE_TYPE.ADD),
      node("end", WORKFLOW_NODE_TYPE.END),
    ];
    const result = autoLayoutNodePosition(input);

    expect(result.map((entry) => entry.position)).toEqual([
      { x: 250, y: 0 },
      { x: 122, y: 80 },
      { x: 282, y: 244 },
      { x: 250, y: 324 },
    ]);
  });

  it("并行条件按编号排列，兜底条件始终位于最后，间距读取 branch.gap", () => {
    const input = [
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
      node("default", WORKFLOW_NODE_TYPE.CONDITION, "branch", { isDefaultCondition: true }),
      node("second", WORKFLOW_NODE_TYPE.CONDITION, "branch", { conditionIndex: 2 }),
      node("first", WORKFLOW_NODE_TYPE.CONDITION, "branch", { conditionIndex: 1 }),
    ];
    const result = autoLayoutNodePosition(input);
    const first = bounds(result, "first");
    const second = bounds(result, "second");
    const fallback = bounds(result, "default");

    expect(second.x - first.right).toBe(WORKFLOW_NODE_DIMENSIONS.branch.gap);
    expect(fallback.x - second.right).toBe(WORKFLOW_NODE_DIMENSIONS.branch.gap);
    expect(first.y).toBe(96);
    expect(second.y).toBe(first.y);
    expect(fallback.y).toBe(first.y);
    expect(bounds(result, "branch").centerX).toBe((first.x + fallback.right) / 2);
    expect(result.map((entry) => entry.id)).toEqual(input.map((entry) => entry.id));
  });

  it("后续节点排在最长分支之后，分支内的串行节点保持居中", () => {
    const result = autoLayoutNodePosition([
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
      node("long", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("approval", WORKFLOW_NODE_TYPE.APPROVAL, "long"),
      node("add", WORKFLOW_NODE_TYPE.ADD, "long"),
      node("short", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(bounds(result, "approval").centerX).toBe(bounds(result, "long").centerX);
    expect(bounds(result, "add").centerX).toBe(bounds(result, "long").centerX);
    expect(bounds(result, "add").y - bounds(result, "approval").bottom).toBe(40);
    expect(bounds(result, "end").y - bounds(result, "add").bottom).toBe(
      WORKFLOW_NODE_DIMENSIONS.gap,
    );
    expect(bounds(result, "short").y).toBe(bounds(result, "long").y);
  });

  it("按嵌套分支的完整宽度留出空间，避免与相邻分支重叠", () => {
    const result = autoLayoutNodePosition([
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
      node("left", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("nested", WORKFLOW_NODE_TYPE.CONDITION_BRANCH, "left"),
      node("nested-left", WORKFLOW_NODE_TYPE.CONDITION, "nested"),
      node("nested-right", WORKFLOW_NODE_TYPE.CONDITION, "nested"),
      node("right", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("right-approval", WORKFLOW_NODE_TYPE.APPROVAL, "right"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(bounds(result, "right").x - bounds(result, "nested-right").right).toBe(
      WORKFLOW_NODE_DIMENSIONS.branch.gap,
    );
    expect(bounds(result, "end").y).toBeGreaterThan(bounds(result, "nested-right").bottom);
    expect(bounds(result, "right-approval").x).toBe(bounds(result, "right").x);
  });

  it("循环内容使用父节点相对坐标，后续根节点避开底部回线", () => {
    const result = autoLayoutNodePosition([
      node("start", WORKFLOW_NODE_TYPE.START),
      node("loop", WORKFLOW_NODE_TYPE.LOOP),
      node("add", WORKFLOW_NODE_TYPE.ADD, "loop"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(result.find((entry) => entry.id === "add")?.position).toEqual({ x: 160, y: 164 });
    expect(bounds(result, "end").y - bounds(result, "add").bottom).toBe(
      WORKFLOW_NODE_DIMENSIONS.loop.edgeOffsetY + WORKFLOW_NODE_DIMENSIONS.gap,
    );
  });

  it("嵌套循环各自预留回线空间，空循环不预留回线空间", () => {
    const result = autoLayoutNodePosition([
      node("outer", WORKFLOW_NODE_TYPE.LOOP),
      node("inner", WORKFLOW_NODE_TYPE.LOOP, "outer"),
      node("inner-add", WORKFLOW_NODE_TYPE.ADD, "inner"),
      node("outer-add", WORKFLOW_NODE_TYPE.ADD, "outer"),
      node("empty", WORKFLOW_NODE_TYPE.LOOP),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);
    const loopGap = WORKFLOW_NODE_DIMENSIONS.loop.edgeOffsetY + WORKFLOW_NODE_DIMENSIONS.gap;

    expect(bounds(result, "outer-add").y - bounds(result, "inner-add").bottom).toBe(loopGap);
    expect(bounds(result, "empty").y - bounds(result, "outer-add").bottom).toBe(loopGap);
    expect(bounds(result, "end").y - bounds(result, "empty").bottom).toBe(
      WORKFLOW_NODE_DIMENSIONS.gap,
    );
  });

  it("父节点晚于子节点出现时仍可识别层级", () => {
    const result = autoLayoutNodePosition([
      node("child", WORKFLOW_NODE_TYPE.ADD, "parent"),
      node("parent", WORKFLOW_NODE_TYPE.LOOP),
    ]);

    expect(bounds(result, "child").centerX).toBe(bounds(result, "parent").centerX);
    expect(bounds(result, "child").y - bounds(result, "parent").bottom).toBe(40);
  });

  it("不修改输入和其他节点属性，重复布局保持位置稳定", () => {
    const start = {
      ...node("start", WORKFLOW_NODE_TYPE.START),
      position: { x: 75, y: 120 },
      draggable: false,
    };
    const input = [
      start,
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
      node("child", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
    ];
    const original = structuredClone(input);
    for (const entry of input) {
      Object.freeze(entry.position);
      Object.freeze(entry.data);
      Object.freeze(entry);
    }
    Object.freeze(input);

    const result = autoLayoutNodePosition(input);

    expect(input).toEqual(original);
    expect(result[0]).toMatchObject(start);
    expect(result[0]).not.toBe(start);
    expect(autoLayoutNodePosition(result)).toEqual(result);
  });

  it("缺少 data 时按普通节点尺寸布局", () => {
    const result = autoLayoutNodePosition([
      { id: "unknown", type: WORKFLOW_NODE_SLOT, position: { x: 0, y: 0 } },
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(bounds(result, "end").y).toBe(WORKFLOW_NODE_DIMENSIONS.common.height + 40);
  });

  it("拒绝重复 ID、不存在的父节点和循环父子关系", () => {
    expect(() =>
      autoLayoutNodePosition([
        node("same", WORKFLOW_NODE_TYPE.START),
        node("same", WORKFLOW_NODE_TYPE.END),
      ]),
    ).toThrow(/重复/);
    expect(() =>
      autoLayoutNodePosition([node("child", WORKFLOW_NODE_TYPE.APPROVAL, "missing")]),
    ).toThrow(/不存在/);
    expect(() =>
      autoLayoutNodePosition([
        node("a", WORKFLOW_NODE_TYPE.LOOP, "b"),
        node("b", WORKFLOW_NODE_TYPE.LOOP, "a"),
      ]),
    ).toThrow(/循环/);
    expect(() => autoLayoutNodePosition([node("self", WORKFLOW_NODE_TYPE.LOOP, "self")])).toThrow(
      /循环/,
    );
  });
});
