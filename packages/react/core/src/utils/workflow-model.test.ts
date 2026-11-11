import { describe, expect, expectTypeOf, it } from "vite-plus/test";
import type { WorkflowNode } from "../types";
import { insertConditionBranch, insertNode } from "./add-node";
import { autoCalEdge } from "./auto-cal-edge";
import { layoutWorkflow } from "./auto-layout-node-position";
import { createDefaultNodes } from "./defaultNode";
import { canDeleteNode, removeNode } from "./delete-node";
import { WORKFLOW_EDGE_TYPE, WORKFLOW_NODE_TYPE } from "./constant";

interface ApprovalConfig {
  approverIds: string[];
  mode: "all" | "any";
}

describe("React 工作流数据模型", () => {
  it("在循环与条件中编辑，保存恢复后保留业务配置和相同执行关系", () => {
    let nodes = insertNode(createDefaultNodes<ApprovalConfig>(), "2", {
      type: WORKFLOW_NODE_TYPE.LOOP,
      label: "循环",
    });
    const loop = nodes.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.LOOP)!;
    const loopAdd = nodes.find((entry) => entry.parentNode === loop.id)!;
    nodes = insertNode(nodes, loopAdd.id, {
      type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
      label: "分支",
    });
    const branch = nodes.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH)!;
    nodes = insertConditionBranch(nodes, branch.id);
    const condition = nodes.find((entry) => entry.data?.conditionIndex === 2)!;
    const conditionAdd = nodes.find((entry) => entry.parentNode === condition.id)!;
    nodes = insertNode(nodes, conditionAdd.id, {
      type: WORKFLOW_NODE_TYPE.APPROVAL,
      label: "审批",
    });
    const approval = nodes.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.APPROVAL)!;
    nodes = nodes.map((entry) =>
      entry.id === approval.id
        ? {
            ...entry,
            data: { ...entry.data!, config: { approverIds: ["user-1"], mode: "all" } },
          }
        : entry,
    );
    const afterApproval = nodes.find(
      (entry) =>
        entry.parentNode === condition.id &&
        entry.id !== conditionAdd.id &&
        entry.data?.type === WORKFLOW_NODE_TYPE.ADD,
    )!;
    nodes = insertNode(nodes, afterApproval.id, {
      type: WORKFLOW_NODE_TYPE.EXIT_LOOP,
      label: "退出循环",
    });
    const exit = nodes.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.EXIT_LOOP)!;
    const edges = autoCalEdge(nodes);
    expect(edges.filter((edge) => edge.source === exit.id)).toEqual([]);
    expect(edges).toContainEqual(
      expect.objectContaining({ target: loop.id, data: { type: WORKFLOW_EDGE_TYPE.LOOP } }),
    );

    const saved = JSON.stringify(nodes);
    const restored = JSON.parse(saved) as WorkflowNode<ApprovalConfig>[];
    expectTypeOf(restored[0]!.data!.config).toEqualTypeOf<ApprovalConfig | undefined>();
    expect(autoCalEdge(restored)).toEqual(edges);
    expect(layoutWorkflow(restored)).toEqual(layoutWorkflow(nodes));
    expect(restored.find((entry) => entry.id === approval.id)?.data?.config).toEqual({
      approverIds: ["user-1"],
      mode: "all",
    });
    expect(
      restored.every((entry) => entry.position === undefined && !("computedPosition" in entry)),
    ).toBe(true);

    const remaining = removeNode(restored, exit.id);
    expect(remaining.find((entry) => entry.id === approval.id)?.data?.config).toEqual({
      approverIds: ["user-1"],
      mode: "all",
    });
    const branchAfter = remaining.find(
      (entry) =>
        entry.parentNode === loop.id &&
        entry.id !== loopAdd.id &&
        entry.data?.type === WORKFLOW_NODE_TYPE.ADD,
    )!;
    expect(autoCalEdge(remaining)).toContainEqual(
      expect.objectContaining({ source: afterApproval.id, target: branchAfter.id }),
    );
    expect(autoCalEdge(remaining)).toContainEqual(
      expect.objectContaining({
        source: branchAfter.id,
        target: loop.id,
        data: { type: WORKFLOW_EDGE_TYPE.LOOP },
      }),
    );
  });

  it("不可变业务更新刷新渲染数据，不改变结构和连线", () => {
    const nodes = insertNode(createDefaultNodes<ApprovalConfig>(), "2", {
      type: WORKFLOW_NODE_TYPE.APPROVAL,
      label: "审批",
    });
    const approval = nodes.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.APPROVAL)!;
    const updated = nodes.map((entry) =>
      entry.id === approval.id
        ? {
            ...entry,
            data: { ...entry.data!, config: { approverIds: ["user-2"], mode: "any" as const } },
          }
        : entry,
    );
    expect(
      layoutWorkflow(updated).nodes.find((entry) => entry.id === approval.id)?.data?.config,
    ).toEqual({ approverIds: ["user-2"], mode: "any" });
    expect(approval.data?.config).toBeUndefined();
    expect(autoCalEdge(updated)).toEqual(autoCalEdge(nodes));
  });

  it("删除条件达到下限后拒绝继续删除，失败操作不修改模型", () => {
    let nodes = insertNode(createDefaultNodes(), "2", {
      type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
      label: "分支",
    });
    const branch = nodes.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH)!;
    nodes = insertConditionBranch(nodes, branch.id);
    const first = nodes.find((entry) => entry.data?.conditionIndex === 1)!;
    const second = nodes.find((entry) => entry.data?.conditionIndex === 2)!;
    expect(canDeleteNode(nodes, first.id)).toBe(true);
    nodes = removeNode(nodes, second.id);
    expect(canDeleteNode(nodes, first.id)).toBe(false);
    const before = JSON.stringify(nodes);
    expect(() => removeNode(nodes, first.id)).toThrow(/至少保留 2 个条件节点/);
    expect(() =>
      insertNode(nodes, "2", { type: WORKFLOW_NODE_TYPE.EXIT_LOOP, label: "退出循环" }),
    ).toThrow(/循环内部/);
    expect(JSON.stringify(nodes)).toBe(before);
  });

  it("每次初始化得到独立的数据，其他设计器不受编辑影响", () => {
    const first = createDefaultNodes();
    const second = createDefaultNodes();
    first[0]!.data!.label = "已修改";
    first.splice(1, 1);
    expect(second).toHaveLength(3);
    expect(second[0]!.data!.label).toBe("Node 1");
  });
});
