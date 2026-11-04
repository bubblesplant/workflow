import { describe, expect, it } from "vite-plus/test";
import type { VueFlowNodeProps, WorkflowNodeType } from "../types";
import { insertNode, isInsideLoop } from "./add-node";
import { autoCalEdge } from "./auto-cal-edge";
import { autoLayoutNodePosition } from "./auto-layout-node-position";
import { WORKFLOW_EDGE_TYPE, WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "./constant";

function node(id: string, type: WorkflowNodeType, parentNode?: string): VueFlowNodeProps {
  return { id, type: WORKFLOW_NODE_SLOT, parentNode, data: { type, label: id } };
}

function initialNodes(): VueFlowNodeProps[] {
  return [
    { ...node("start", WORKFLOW_NODE_TYPE.START), position: { x: 250, y: 100 } },
    node("add", WORKFLOW_NODE_TYPE.ADD),
    node("end", WORKFLOW_NODE_TYPE.END),
  ];
}

describe("insertNode", () => {
  it.each([WORKFLOW_NODE_TYPE.APPROVAL, WORKFLOW_NODE_TYPE.FILL, WORKFLOW_NODE_TYPE.COPY] as const)(
    "在指定入口后插入 %s，保留前后的添加入口",
    (type) => {
      const nodes = insertNode(initialNodes(), "add", { type, label: "新节点" });
      expect(nodes[2]?.position).toBeUndefined();
      const result = autoLayoutNodePosition(nodes);

      expect(result.map((entry) => entry.data?.type)).toEqual([
        WORKFLOW_NODE_TYPE.START,
        WORKFLOW_NODE_TYPE.ADD,
        type,
        WORKFLOW_NODE_TYPE.ADD,
        WORKFLOW_NODE_TYPE.END,
      ]);
      expect(result[1]?.id).toBe("add");
      expect(result[2]).toMatchObject({
        type: WORKFLOW_NODE_SLOT,
        data: { type, label: "新节点" },
      });
      expect(result[2]?.parentNode).toBeUndefined();
      expect(result[3]?.parentNode).toBeUndefined();
      expect(result[0]?.position).toEqual({ x: 250, y: 100 });
      expect(result[4]?.position.y).toBeGreaterThan(result[2]?.position.y ?? 0);
    },
  );

  it("条件分支自带普通条件和兜底条件，各有内部入口并汇入分支后的入口", () => {
    const result = insertNode(initialNodes(), "add", {
      type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
      label: "条件分支",
    });
    const [branch, condition, conditionAdd, fallback, fallbackAdd, afterAdd] = result.slice(2, 8);

    expect(branch?.data?.type).toBe(WORKFLOW_NODE_TYPE.CONDITION_BRANCH);
    expect(condition).toMatchObject({
      parentNode: branch?.id,
      data: { type: WORKFLOW_NODE_TYPE.CONDITION, conditionIndex: 1 },
    });
    expect(fallback).toMatchObject({
      parentNode: branch?.id,
      data: { type: WORKFLOW_NODE_TYPE.CONDITION, isDefaultCondition: true },
    });
    expect(conditionAdd).toMatchObject({
      parentNode: condition?.id,
      data: { type: WORKFLOW_NODE_TYPE.ADD },
    });
    expect(fallbackAdd).toMatchObject({
      parentNode: fallback?.id,
      data: { type: WORKFLOW_NODE_TYPE.ADD },
    });
    expect(afterAdd?.parentNode).toBeUndefined();
    expect(autoCalEdge(result)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: branch?.id, target: condition?.id }),
        expect.objectContaining({ source: branch?.id, target: fallback?.id }),
        expect.objectContaining({ source: conditionAdd?.id, target: afterAdd?.id }),
        expect.objectContaining({ source: fallbackAdd?.id, target: afterAdd?.id }),
        expect.objectContaining({ source: afterAdd?.id, target: "end" }),
      ]),
    );
  });

  it("循环自带内部添加入口和循环后的入口，回线只从循环内部生成", () => {
    const result = insertNode(initialNodes(), "add", {
      type: WORKFLOW_NODE_TYPE.LOOP,
      label: "循环",
    });
    const [loop, bodyAdd, afterAdd] = result.slice(2, 5);

    expect(loop?.data?.type).toBe(WORKFLOW_NODE_TYPE.LOOP);
    expect(bodyAdd).toMatchObject({ parentNode: loop?.id, data: { type: WORKFLOW_NODE_TYPE.ADD } });
    expect(afterAdd?.parentNode).toBeUndefined();
    const edges = autoCalEdge(result);
    expect(edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: loop?.id, target: bodyAdd?.id }),
        expect.objectContaining({
          source: bodyAdd?.id,
          target: loop?.id,
          data: { type: WORKFLOW_EDGE_TYPE.LOOP },
        }),
        expect.objectContaining({ source: bodyAdd?.id, target: afterAdd?.id }),
      ]),
    );
    expect(edges.filter((edge) => edge.data?.type === WORKFLOW_EDGE_TYPE.LOOP)).toHaveLength(1);
  });

  it("在条件内部添加循环时，新循环和后续入口继承该条件的 parentNode", () => {
    const result = insertNode(
      [
        node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
        node("condition", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
        node("add", WORKFLOW_NODE_TYPE.ADD, "condition"),
        node("other", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
        node("other-add", WORKFLOW_NODE_TYPE.ADD, "other"),
        node("end", WORKFLOW_NODE_TYPE.END),
      ],
      "add",
      { type: WORKFLOW_NODE_TYPE.LOOP, label: "循环" },
    );
    const [loop, bodyAdd, afterAdd] = result.slice(3, 6);

    expect(loop?.parentNode).toBe("condition");
    expect(bodyAdd?.parentNode).toBe(loop?.id);
    expect(afterAdd?.parentNode).toBe("condition");
    expect(result.find((entry) => entry.id === "other-add")?.parentNode).toBe("other");
    expect(autoCalEdge(result)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ source: afterAdd?.id, target: "other" })]),
    );
  });

  it("循环内的分支可以添加退出节点，不生成出边或追加入口", () => {
    const result = insertNode(
      [
        node("loop", WORKFLOW_NODE_TYPE.LOOP),
        node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH, "loop"),
        node("condition", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
        node("add", WORKFLOW_NODE_TYPE.ADD, "condition"),
        node("end", WORKFLOW_NODE_TYPE.END),
      ],
      "add",
      { type: WORKFLOW_NODE_TYPE.EXIT_LOOP, label: "退出循环" },
    );
    const exit = result[4];

    expect(result).toHaveLength(6);
    expect(exit).toMatchObject({
      parentNode: "condition",
      data: { type: WORKFLOW_NODE_TYPE.EXIT_LOOP },
    });
    const edges = autoCalEdge(result);
    expect(edges).toContainEqual(expect.objectContaining({ source: "add", target: exit?.id }));
    expect(edges.filter((edge) => edge.source === exit?.id)).toEqual([]);
  });

  it("拒绝不存在或类型错误的入口，并拒绝在循环外添加退出循环", () => {
    expect(() =>
      insertNode(initialNodes(), "missing", { type: WORKFLOW_NODE_TYPE.APPROVAL, label: "审批" }),
    ).toThrow(/入口/);
    expect(() =>
      insertNode(initialNodes(), "start", { type: WORKFLOW_NODE_TYPE.APPROVAL, label: "审批" }),
    ).toThrow(/入口/);
    expect(() =>
      insertNode(initialNodes(), "add", { type: WORKFLOW_NODE_TYPE.EXIT_LOOP, label: "退出循环" }),
    ).toThrow(/循环内部/);
  });

  it("重复添加及已有同名 ID 时，新增 ID 仍然唯一", () => {
    const input = [
      ...initialNodes(),
      node("approval-1", WORKFLOW_NODE_TYPE.APPROVAL),
      node("add-2", WORKFLOW_NODE_TYPE.ADD),
    ];
    const first = insertNode(input, "add", { type: WORKFLOW_NODE_TYPE.APPROVAL, label: "审批1" });
    const second = insertNode(first, "add", { type: WORKFLOW_NODE_TYPE.APPROVAL, label: "审批2" });

    expect(new Set(second.map((entry) => entry.id)).size).toBe(second.length);
    expect(second.filter((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.APPROVAL)).toHaveLength(
      3,
    );
    expect(second.find((entry) => entry.id === "approval-1")?.data?.label).toBe("approval-1");
  });

  it("不修改只读输入及节点属性，重复插入得到相同结果", () => {
    const input = initialNodes();
    const original = structuredClone(input);
    for (const entry of input) {
      if (entry.position) Object.freeze(entry.position);
      Object.freeze(entry.data);
      Object.freeze(entry);
    }
    Object.freeze(input);

    const result = insertNode(input, "add", {
      type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
      label: "条件分支",
    });

    expect(input).toEqual(original);
    expect(
      insertNode(input, "add", { type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH, label: "条件分支" }),
    ).toEqual(result);
  });
});

describe("isInsideLoop", () => {
  it("识别直接、嵌套条件和嵌套循环内的入口，循环外和缺失节点返回 false", () => {
    const input = [
      node("root-add", WORKFLOW_NODE_TYPE.ADD),
      node("loop", WORKFLOW_NODE_TYPE.LOOP),
      node("loop-add", WORKFLOW_NODE_TYPE.ADD, "loop"),
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH, "loop"),
      node("condition", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("branch-add", WORKFLOW_NODE_TYPE.ADD, "condition"),
      node("inner", WORKFLOW_NODE_TYPE.LOOP, "condition"),
      node("inner-add", WORKFLOW_NODE_TYPE.ADD, "inner"),
    ];

    expect(isInsideLoop(input, "root-add")).toBe(false);
    expect(isInsideLoop(input, "missing")).toBe(false);
    expect(isInsideLoop(input, "loop-add")).toBe(true);
    expect(isInsideLoop(input, "branch-add")).toBe(true);
    expect(isInsideLoop(input, "inner-add")).toBe(true);
  });

  it("异常父子循环不会导致无限遍历", () => {
    expect(
      isInsideLoop(
        [node("a", WORKFLOW_NODE_TYPE.COMMON, "b"), node("b", WORKFLOW_NODE_TYPE.COMMON, "a")],
        "a",
      ),
    ).toBe(false);
  });
});
