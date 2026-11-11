import { describe, expect, it } from "vite-plus/test";
import type { NodeData, WorkflowRenderEdge, WorkflowNode, WorkflowNodeType } from "../types";
import { autoCalEdge } from "./auto-cal-edge";
import { WORKFLOW_EDGE_TYPE, WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "./constant";

function node(
  id: string,
  type: WorkflowNodeType,
  parentNode?: string,
  data: Partial<NodeData> = {},
): WorkflowNode {
  return { id, type: WORKFLOW_NODE_SLOT, parentNode, data: { label: id, type, ...data } };
}

function connections(edges: WorkflowRenderEdge[]): string[] {
  return edges.map(
    (edge) =>
      `${edge.source}->${edge.target}${edge.data?.type === WORKFLOW_EDGE_TYPE.LOOP ? "(loop)" : ""}`,
  );
}

describe("autoCalEdge", () => {
  it("空数组和单个节点不生成边", () => {
    expect(autoCalEdge([])).toEqual([]);
    expect(autoCalEdge([node("start", WORKFLOW_NODE_TYPE.START)])).toEqual([]);
  });

  it("无须 position，按数组顺序串联同层节点，并使用工作流边插槽", () => {
    expect(
      autoCalEdge([
        node("1", WORKFLOW_NODE_TYPE.START),
        node("2", WORKFLOW_NODE_TYPE.ADD),
        node("3", WORKFLOW_NODE_TYPE.END),
      ]),
    ).toEqual([
      { id: "e1-2", source: "1", target: "2", type: WORKFLOW_NODE_SLOT },
      { id: "e2-3", source: "2", target: "3", type: WORKFLOW_NODE_SLOT },
    ]);
  });

  it("父节点晚于子节点出现时仍按层级连接，串行子节点末尾接回后续节点", () => {
    const result = autoCalEdge([
      node("child", WORKFLOW_NODE_TYPE.APPROVAL, "parent"),
      node("start", WORKFLOW_NODE_TYPE.START),
      node("parent", WORKFLOW_NODE_TYPE.COMMON),
      node("add", WORKFLOW_NODE_TYPE.ADD, "parent"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result)).toEqual([
      "start->parent",
      "parent->child",
      "child->add",
      "add->end",
    ]);
  });

  it("条件按编号展开且兜底条件最后，各分支末尾汇入后续节点", () => {
    const result = autoCalEdge([
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
      node("fallback", WORKFLOW_NODE_TYPE.CONDITION, "branch", {
        isDefaultCondition: true,
        conditionIndex: 0,
      }),
      node("second", WORKFLOW_NODE_TYPE.CONDITION, "branch", { conditionIndex: 2 }),
      node("first", WORKFLOW_NODE_TYPE.CONDITION, "branch", { conditionIndex: 1 }),
      node("approval", WORKFLOW_NODE_TYPE.APPROVAL, "first"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result)).toEqual([
      "branch->first",
      "first->approval",
      "approval->end",
      "branch->second",
      "second->end",
      "branch->fallback",
      "fallback->end",
    ]);
  });

  it("嵌套分支从所有叶节点汇合，再连接外层分支的后续节点", () => {
    const result = autoCalEdge([
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
      node("left", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("nested", WORKFLOW_NODE_TYPE.CONDITION_BRANCH, "left"),
      node("nested-left", WORKFLOW_NODE_TYPE.CONDITION, "nested"),
      node("nested-right", WORKFLOW_NODE_TYPE.CONDITION, "nested"),
      node("after-nested", WORKFLOW_NODE_TYPE.APPROVAL, "left"),
      node("right", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result)).toEqual([
      "branch->left",
      "left->nested",
      "nested->nested-left",
      "nested-left->after-nested",
      "nested->nested-right",
      "nested-right->after-nested",
      "after-nested->end",
      "branch->right",
      "right->end",
    ]);
  });

  it("循环体末尾同时连接循环后的节点并生成带 loop 类型的回线", () => {
    const result = autoCalEdge([
      node("start", WORKFLOW_NODE_TYPE.START),
      node("loop", WORKFLOW_NODE_TYPE.LOOP),
      node("approval", WORKFLOW_NODE_TYPE.APPROVAL, "loop"),
      node("add", WORKFLOW_NODE_TYPE.ADD, "loop"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result)).toEqual([
      "start->loop",
      "loop->approval",
      "approval->add",
      "add->end",
      "add->loop(loop)",
    ]);
    expect(result.at(-1)).toMatchObject({
      type: WORKFLOW_NODE_SLOT,
      data: { type: WORKFLOW_EDGE_TYPE.LOOP },
    });
  });

  it("循环末尾是条件分支时，分别从各分支末尾生成回线", () => {
    const result = autoCalEdge([
      node("loop", WORKFLOW_NODE_TYPE.LOOP),
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH, "loop"),
      node("left", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("right", WORKFLOW_NODE_TYPE.CONDITION, "branch"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result)).toEqual([
      "loop->branch",
      "branch->left",
      "left->end",
      "left->loop(loop)",
      "branch->right",
      "right->end",
      "right->loop(loop)",
    ]);
  });

  it("循环条件分支中的退出节点不向下汇合，其他分支仍连接后续节点和循环回线", () => {
    const result = autoCalEdge([
      node("loop", WORKFLOW_NODE_TYPE.LOOP),
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH, "loop"),
      node("left", WORKFLOW_NODE_TYPE.CONDITION, "branch", { conditionIndex: 1 }),
      node("left-add", WORKFLOW_NODE_TYPE.ADD, "left"),
      node("right", WORKFLOW_NODE_TYPE.CONDITION, "branch", { isDefaultCondition: true }),
      node("right-add", WORKFLOW_NODE_TYPE.ADD, "right"),
      node("exit", WORKFLOW_NODE_TYPE.EXIT_LOOP, "right"),
      node("after-branch", WORKFLOW_NODE_TYPE.ADD, "loop"),
      node("after-loop", WORKFLOW_NODE_TYPE.ADD),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result)).toEqual([
      "loop->branch",
      "branch->left",
      "left->left-add",
      "left-add->after-branch",
      "branch->right",
      "right->right-add",
      "right-add->exit",
      "after-branch->after-loop",
      "after-branch->loop(loop)",
      "after-loop->end",
    ]);
  });

  it("嵌套循环分别生成回线，内层完成后继续外层剩余节点", () => {
    const result = autoCalEdge([
      node("outer", WORKFLOW_NODE_TYPE.LOOP),
      node("inner", WORKFLOW_NODE_TYPE.LOOP, "outer"),
      node("body", WORKFLOW_NODE_TYPE.APPROVAL, "inner"),
      node("after-inner", WORKFLOW_NODE_TYPE.ADD, "outer"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result)).toEqual([
      "outer->inner",
      "inner->body",
      "body->after-inner",
      "body->inner(loop)",
      "after-inner->end",
      "after-inner->outer(loop)",
    ]);
  });

  it("退出循环不连接循环体剩余节点、循环后续节点或回线", () => {
    const result = autoCalEdge([
      node("outer", WORKFLOW_NODE_TYPE.LOOP),
      node("inner", WORKFLOW_NODE_TYPE.LOOP, "outer"),
      node("exit", WORKFLOW_NODE_TYPE.EXIT_LOOP, "inner"),
      node("skipped", WORKFLOW_NODE_TYPE.ADD, "inner"),
      node("after-inner", WORKFLOW_NODE_TYPE.APPROVAL, "outer"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result).filter((edge) => edge.startsWith("exit->"))).toEqual([]);
    expect(connections(result)).toContain("inner->exit");
    expect(connections(result)).toContain("after-inner->outer(loop)");
  });

  it("内层位于外层末尾时，退出节点也不连接外层循环或结束节点", () => {
    const result = autoCalEdge([
      node("outer", WORKFLOW_NODE_TYPE.LOOP),
      node("inner", WORKFLOW_NODE_TYPE.LOOP, "outer"),
      node("exit", WORKFLOW_NODE_TYPE.EXIT_LOOP, "inner"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result)).toEqual(["outer->inner", "inner->exit"]);
  });

  it("循环没有后续节点时，退出节点不生成回线", () => {
    expect(
      connections(
        autoCalEdge([
          node("loop", WORKFLOW_NODE_TYPE.LOOP),
          node("exit", WORKFLOW_NODE_TYPE.EXIT_LOOP, "loop"),
        ]),
      ),
    ).toEqual(["loop->exit"]);
  });

  it("空循环和空分支直接串联，结束节点不生成出边", () => {
    const result = autoCalEdge([
      node("loop", WORKFLOW_NODE_TYPE.LOOP),
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
      node("end", WORKFLOW_NODE_TYPE.END),
      node("after-end", WORKFLOW_NODE_TYPE.APPROVAL),
    ]);

    expect(connections(result)).toEqual(["loop->branch", "branch->end"]);
  });

  it("循环中的结束节点不连接循环后的节点或生成回线", () => {
    const result = autoCalEdge([
      node("loop", WORKFLOW_NODE_TYPE.LOOP),
      node("stop", WORKFLOW_NODE_TYPE.END, "loop"),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result)).toEqual(["loop->stop"]);
  });

  it("缺少 data 的节点按普通节点连接，循环外的 exit-loop 仍不生成出边", () => {
    const result = autoCalEdge([
      { id: "unknown" },
      node("exit", WORKFLOW_NODE_TYPE.EXIT_LOOP),
      node("end", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(connections(result)).toEqual(["unknown->exit"]);
  });

  it("不修改只读输入，忽略坐标并保持结果和边 ID 稳定", () => {
    const input = [
      node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
      node("fallback", WORKFLOW_NODE_TYPE.CONDITION, "branch", { isDefaultCondition: true }),
      node("first", WORKFLOW_NODE_TYPE.CONDITION, "branch", { conditionIndex: 1 }),
      node("end", WORKFLOW_NODE_TYPE.END),
    ];
    const original = structuredClone(input);
    for (const entry of input) {
      Object.freeze(entry.data);
      Object.freeze(entry);
    }
    Object.freeze(input);

    const result = autoCalEdge(input);

    expect(input).toEqual(original);
    expect(autoCalEdge(input)).toEqual(result);
    expect(
      autoCalEdge(input.map((entry) => ({ ...entry, position: { x: 100, y: -200 } }))),
    ).toEqual(result);
  });

  it("节点 ID 含连字符时，不同连接的边 ID 仍然唯一", () => {
    const result = autoCalEdge([
      node("a-b", WORKFLOW_NODE_TYPE.START),
      node("c", WORKFLOW_NODE_TYPE.ADD),
      node("a", WORKFLOW_NODE_TYPE.APPROVAL),
      node("b-c", WORKFLOW_NODE_TYPE.END),
    ]);

    expect(new Set(result.map((edge) => edge.id)).size).toBe(result.length);
    expect(connections(result)).toEqual(["a-b->c", "c->a", "a->b-c"]);
  });

  it("拒绝重复 ID、不存在的父节点和循环父子关系，包括脱离根节点的循环", () => {
    expect(() =>
      autoCalEdge([node("same", WORKFLOW_NODE_TYPE.START), node("same", WORKFLOW_NODE_TYPE.END)]),
    ).toThrow(/重复/);
    expect(() => autoCalEdge([node("child", WORKFLOW_NODE_TYPE.APPROVAL, "missing")])).toThrow(
      /不存在/,
    );
    expect(() => autoCalEdge([node("self", WORKFLOW_NODE_TYPE.LOOP, "self")])).toThrow(/循环/);
    expect(() =>
      autoCalEdge([
        node("start", WORKFLOW_NODE_TYPE.START),
        node("a", WORKFLOW_NODE_TYPE.LOOP, "b"),
        node("b", WORKFLOW_NODE_TYPE.LOOP, "a"),
      ]),
    ).toThrow(/循环/);
  });
});
