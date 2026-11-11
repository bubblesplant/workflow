import { describe, expect, it } from "vite-plus/test";
import type { WorkflowNode, WorkflowNodeType } from "../types";
import { insertConditionBranch, insertNode } from "./add-node";
import { autoCalEdge } from "./auto-cal-edge";
import { autoLayoutNodePosition } from "./auto-layout-node-position";
import { WORKFLOW_NODE_DIMENSIONS } from "./node-dimensions";
import { WORKFLOW_NODE_SLOT, WORKFLOW_NODE_TYPE } from "./constant";

function node(id: string, type: WorkflowNodeType, parentNode?: string): WorkflowNode {
  return { id, type: WORKFLOW_NODE_SLOT, parentNode, data: { type, label: id } };
}

function initialNodes(): WorkflowNode[] {
  return [
    { ...node("start", WORKFLOW_NODE_TYPE.START), position: { x: 250, y: 100 } },
    node("add", WORKFLOW_NODE_TYPE.ADD),
    node("end", WORKFLOW_NODE_TYPE.END),
  ];
}

function branchNodes() {
  const nodes = insertNode(initialNodes(), "add", {
    type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
    label: "条件分支",
  });
  const branch = nodes.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH)!;
  return { nodes, branch };
}

describe("insertConditionBranch", () => {
  it("连续增加条件并递增编号，保留唯一兜底分支且不发生重叠", () => {
    const { nodes, branch } = branchNodes();
    const first = insertConditionBranch(nodes, branch.id);
    const result = autoLayoutNodePosition(insertConditionBranch(first, branch.id));
    const conditions = result.filter((entry) => entry.parentNode === branch.id);
    const fallback = nodes.find((entry) => entry.data?.isDefaultCondition)!;

    expect(result).toHaveLength(nodes.length + 4);
    expect(new Set(result.map((entry) => entry.id)).size).toBe(result.length);
    expect(conditions.map((entry) => entry.data?.conditionIndex)).toEqual([1, 2, 3, undefined]);
    expect(conditions.map((entry) => entry.data?.label)).toEqual([
      "条件规则1",
      "条件规则2",
      "条件规则3",
      "其他",
    ]);
    expect(conditions.filter((entry) => entry.data?.isDefaultCondition)).toEqual([
      expect.objectContaining({ id: fallback.id }),
    ]);
    for (let index = 1; index < conditions.length; index++) {
      expect(conditions[index]!.position.x - conditions[index - 1]!.position.x).toBeGreaterThan(
        WORKFLOW_NODE_DIMENSIONS.common.width,
      );
      expect(conditions[index]!.position.y).toBe(conditions[0]!.position.y);
    }
    expect(result[0]?.position).toEqual({ x: 250, y: 100 });
  });

  it("新增条件自带添加入口，连线从分支进入并汇合到原有后续入口", () => {
    const { nodes, branch } = branchNodes();
    const result = insertConditionBranch(nodes, branch.id);
    const condition = result.find((entry) => entry.data?.conditionIndex === 2)!;
    const conditionAdd = result.find((entry) => entry.parentNode === condition.id)!;
    const afterAdd = result.find(
      (entry, index) =>
        index > 1 && !entry.parentNode && entry.data?.type === WORKFLOW_NODE_TYPE.ADD,
    )!;

    expect(condition).toMatchObject({
      parentNode: branch.id,
      data: { type: WORKFLOW_NODE_TYPE.CONDITION },
    });
    expect(conditionAdd.data?.type).toBe(WORKFLOW_NODE_TYPE.ADD);
    expect(autoCalEdge(result)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: branch.id, target: condition.id }),
        expect.objectContaining({ source: condition.id, target: conditionAdd.id }),
        expect.objectContaining({ source: conditionAdd.id, target: afterAdd.id }),
        ...autoCalEdge(nodes),
      ]),
    );
  });

  it("编号接续当前分支的最大值，不受嵌套条件影响", () => {
    const { nodes, branch } = branchNodes();
    const condition = nodes.find((entry) => entry.data?.conditionIndex === 1)!;
    const input = [
      ...nodes.map((entry) =>
        entry.id === condition.id
          ? { ...entry, data: { ...entry.data!, conditionIndex: 4 } }
          : entry,
      ),
      node("nested", WORKFLOW_NODE_TYPE.CONDITION_BRANCH, condition.id),
      {
        ...node("nested-condition", WORKFLOW_NODE_TYPE.CONDITION, "nested"),
        data: { type: WORKFLOW_NODE_TYPE.CONDITION, label: "嵌套条件", conditionIndex: 99 },
      },
    ];
    const result = insertConditionBranch(input, branch.id);

    expect(
      result
        .filter((entry) => entry.parentNode === branch.id)
        .map((entry) => entry.data?.conditionIndex),
    ).toEqual([4, 5, undefined]);
    expect(result.find((entry) => entry.id === "nested-condition")?.data?.conditionIndex).toBe(99);
  });

  it("没有兜底条件的空分支也能增加条件", () => {
    const result = insertConditionBranch(
      [
        ...initialNodes().slice(0, 2),
        node("branch", WORKFLOW_NODE_TYPE.CONDITION_BRANCH),
        node("end", WORKFLOW_NODE_TYPE.END),
      ],
      "branch",
    );
    const condition = result.find((entry) => entry.parentNode === "branch")!;
    const conditionAdd = result.find((entry) => entry.parentNode === condition.id)!;

    expect(condition.data).toMatchObject({ type: WORKFLOW_NODE_TYPE.CONDITION, conditionIndex: 1 });
    expect(autoCalEdge(result)).toContainEqual(
      expect.objectContaining({ source: conditionAdd.id, target: "end" }),
    );
  });

  it("不修改输入节点、业务数据和坐标", () => {
    const { nodes, branch } = branchNodes();
    const original = structuredClone(nodes);
    for (const entry of nodes) {
      Object.freeze(entry.data);
      Object.freeze(entry.position);
      Object.freeze(entry);
    }
    Object.freeze(nodes);

    insertConditionBranch(nodes, branch.id);

    expect(nodes).toEqual(original);
  });
});
