import { describe, expect, it } from "vite-plus/test";
import type { NodeData, VueFlowNodeProps, WorkflowNodeType } from "../types";
import { insertNode } from "./add-node";
import { autoCalEdge } from "./auto-cal-edge";
import { canDeleteNode, removeNode } from "./delete-node";
import { WORKFLOW_EDGE_TYPE, WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "./constant";

function node(
  id: string,
  type: WorkflowNodeType,
  parentNode?: string,
  data: Partial<NodeData> = {},
): VueFlowNodeProps {
  return { id, type: WORKFLOW_NODE_SLOT, parentNode, data: { type, label: id, ...data } };
}

function initialNodes(): VueFlowNodeProps[] {
  return [
    { ...node("start", WORKFLOW_NODE_TYPE.START), position: { x: 250, y: 100 } },
    node("add", WORKFLOW_NODE_TYPE.ADD),
    node("end", WORKFLOW_NODE_TYPE.END),
  ];
}

function branchNodes(): VueFlowNodeProps[] {
  return [
    node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
    node("fallback", WORKFLOW_NODE_TYPE.CONDITION, "branch", { isDefaultCondition: true }),
    node("fallback-add", WORKFLOW_NODE_TYPE.ADD, "fallback"),
    node("third", WORKFLOW_NODE_TYPE.CONDITION, "branch", { conditionIndex: 3 }),
    node("third-add", WORKFLOW_NODE_TYPE.ADD, "third"),
    node("first", WORKFLOW_NODE_TYPE.CONDITION, "branch", { conditionIndex: 1 }),
    node("first-add", WORKFLOW_NODE_TYPE.ADD, "first"),
    node("second", WORKFLOW_NODE_TYPE.CONDITION, "branch", { conditionIndex: 2 }),
    node("second-add", WORKFLOW_NODE_TYPE.ADD, "second"),
    node("end", WORKFLOW_NODE_TYPE.END),
  ];
}

describe("removeNode", () => {
  it.each([
    WORKFLOW_NODE_TYPE.APPROVAL,
    WORKFLOW_NODE_TYPE.FILL,
    WORKFLOW_NODE_TYPE.COPY,
    WORKFLOW_NODE_TYPE.COMMON,
  ] as const)("删除 %s 后合并前后添加入口，保留起点且不写入布局数据", (type) => {
    const input = [
      ...initialNodes().slice(0, 2),
      node("target", type),
      node("after-add", WORKFLOW_NODE_TYPE.ADD),
      node("end", WORKFLOW_NODE_TYPE.END),
    ];

    const result = removeNode(input, "target");

    expect(result.map((entry) => entry.id)).toEqual(["start", "add", "end"]);
    expect(result).toEqual(initialNodes());
    expect(autoCalEdge(result)).toEqual([
      expect.objectContaining({ source: "start", target: "add" }),
      expect.objectContaining({ source: "add", target: "end" }),
    ]);
  });

  it("同层添加入口被子树隔开时仍正确合并，并递归删除嵌套循环和分支", () => {
    const input = insertNode(initialNodes(), "add", {
      type: WORKFLOW_NODE_TYPE.LOOP,
      label: "循环",
    });
    const loop = input.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.LOOP)!;
    const loopAdd = input.find((entry) => entry.parentNode === loop.id)!;
    const nested = insertNode(input, loopAdd.id, {
      type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
      label: "条件分支",
    });

    expect(removeNode(nested, loop.id)).toEqual(initialNodes());
  });

  it("子节点早于父节点时也会删除整棵子树，保留其他分支和其添加入口", () => {
    const input = [
      node("child", WORKFLOW_NODE_TYPE.APPROVAL, "nested"),
      ...branchNodes(),
      node("nested", WORKFLOW_NODE_TYPE.LOOP, "second"),
      node("nested-add", WORKFLOW_NODE_TYPE.ADD, "nested"),
    ];

    const result = removeNode(input, "second");
    const ids = result.map((entry) => entry.id);

    for (const id of ["second", "second-add", "nested", "nested-add", "child"]) {
      expect(ids).not.toContain(id);
    }
    expect(ids).toEqual(expect.arrayContaining(["first-add", "third-add", "fallback-add"]));
    expect(
      autoCalEdge(result).every((edge) => ids.includes(edge.source) && ids.includes(edge.target)),
    ).toBe(true);
  });

  it("删除条件后按显示顺序连续编号，兜底条件和其他节点属性保留", () => {
    const result = removeNode(branchNodes(), "second");

    expect(result.find((entry) => entry.id === "first")?.data).toMatchObject({
      conditionIndex: 1,
      label: "条件规则1",
    });
    expect(result.find((entry) => entry.id === "third")?.data).toMatchObject({
      conditionIndex: 2,
      label: "条件规则2",
    });
    expect(result.find((entry) => entry.id === "fallback")?.data).toEqual({
      type: WORKFLOW_NODE_TYPE.CONDITION,
      label: "fallback",
      isDefaultCondition: true,
    });
  });

  it("条件可从 3 个删至 2 个，普通条件和兜底条件都不能继续删除", () => {
    const three = removeNode(branchNodes(), "second");
    expect(canDeleteNode(three, "first")).toBe(true);
    const two = removeNode(three, "third");

    expect(canDeleteNode(two, "first")).toBe(false);
    expect(() => removeNode(two, "first")).toThrow(/至少保留 2 个条件节点/);
    expect(canDeleteNode(two, "fallback")).toBe(false);
    expect(() => removeNode(two, "fallback")).toThrow(/兜底条件不允许单独删除/);
  });

  it("条件数量充足时仍禁止单独删除兜底条件，其内部业务节点可正常删除", () => {
    const input = [
      ...branchNodes(),
      node("fallback-approval", WORKFLOW_NODE_TYPE.APPROVAL, "fallback"),
      node("fallback-after-add", WORKFLOW_NODE_TYPE.ADD, "fallback"),
    ];

    expect(canDeleteNode(input, "first")).toBe(true);
    expect(canDeleteNode(input, "fallback")).toBe(false);
    expect(() => removeNode(input, "fallback")).toThrow(/兜底条件不允许单独删除/);

    const result = removeNode(input, "fallback-approval");

    expect(result.some((entry) => entry.id === "fallback")).toBe(true);
    expect(result.some((entry) => entry.id === "fallback-add")).toBe(true);
    expect(result.some((entry) => entry.id === "fallback-approval")).toBe(false);
  });

  it("条件最小数量按所属分支校验，其他分支的条件不计入", () => {
    const input = [
      ...branchNodes(),
      node("other", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
      node("other-first", WORKFLOW_NODE_TYPE.CONDITION, "other"),
      node("other-second", WORKFLOW_NODE_TYPE.CONDITION, "other"),
    ];

    expect(canDeleteNode(input, "first")).toBe(true);
    expect(canDeleteNode(input, "other-first")).toBe(false);
    expect(() => removeNode(input, "other-first")).toThrow(/至少保留 2 个条件节点/);
  });

  it("整组删除条件分支不受组内最少 2 个条件的限制", () => {
    const input = insertNode(initialNodes(), "add", {
      type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
      label: "条件分支",
    });
    const branch = input.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH)!;

    expect(removeNode(input, branch.id)).toEqual(initialNodes());
  });

  it("删除循环中的普通节点只合并同层入口，删除退出节点后恢复循环回线", () => {
    const input = [
      node("loop", WORKFLOW_NODE_TYPE.LOOP),
      node("body-add", WORKFLOW_NODE_TYPE.ADD, "loop"),
      node("approval", WORKFLOW_NODE_TYPE.APPROVAL, "loop"),
      node("after-add", WORKFLOW_NODE_TYPE.ADD, "loop"),
      node("exit", WORKFLOW_NODE_TYPE.EXIT_LOOP, "loop"),
      node("root-add", WORKFLOW_NODE_TYPE.ADD),
      node("end", WORKFLOW_NODE_TYPE.END),
    ];
    const withoutApproval = removeNode(input, "approval");
    expect(withoutApproval.map((entry) => entry.id)).toEqual([
      "loop",
      "body-add",
      "exit",
      "root-add",
      "end",
    ]);

    const result = removeNode(withoutApproval, "exit");

    expect(result.map((entry) => entry.id)).toEqual(["loop", "body-add", "root-add", "end"]);
    expect(autoCalEdge(result)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "body-add",
          target: "loop",
          data: { type: WORKFLOW_EDGE_TYPE.LOOP },
        }),
        expect.objectContaining({ source: "body-add", target: "root-add" }),
      ]),
    );
  });

  it("没有前置添加入口时保留后置入口，不清理其他位置的既有入口", () => {
    const result = removeNode(
      [
        node("target", WORKFLOW_NODE_TYPE.APPROVAL),
        node("after-add", WORKFLOW_NODE_TYPE.ADD),
        node("fill", WORKFLOW_NODE_TYPE.FILL),
        node("existing-add", WORKFLOW_NODE_TYPE.ADD),
        node("another-add", WORKFLOW_NODE_TYPE.ADD),
      ],
      "target",
    );

    expect(result.map((entry) => entry.id)).toEqual([
      "after-add",
      "fill",
      "existing-add",
      "another-add",
    ]);
  });

  it("拒绝缺失节点、开始、结束、添加入口以及显式禁止删除的节点", () => {
    const input = [
      ...initialNodes(),
      { ...node("locked", WORKFLOW_NODE_TYPE.APPROVAL), deletable: false },
    ];

    expect(() => removeNode(input, "missing")).toThrow(/不存在/);
    for (const id of ["missing", "start", "end", "add", "locked"]) {
      expect(canDeleteNode(input, id)).toBe(false);
      expect(() => removeNode(input, id)).toThrow();
    }
  });

  it("不修改只读输入及其条件数据", () => {
    const input = branchNodes();
    const original = structuredClone(input);
    for (const entry of input) {
      Object.freeze(entry.data);
      Object.freeze(entry);
    }
    Object.freeze(input);

    const result = removeNode(input, "first");

    expect(input).toEqual(original);
    expect(result.find((entry) => entry.id === "second")?.data?.conditionIndex).toBe(1);
    expect(removeNode(input, "first")).toEqual(result);
  });
});
