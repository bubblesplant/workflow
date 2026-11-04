import { computed, ref } from "vue";
import { describe, expect, expectTypeOf, it } from "vite-plus/test";
import type { VueFlowNodeProps } from "../types";
import { insertConditionBranch, insertNode } from "./add-node";
import { autoCalEdge } from "./auto-cal-edge";
import { autoLayoutNodePosition } from "./auto-layout-node-position";
import { createDefaultNodes } from "./defaultNode";
import { canDeleteNode, removeNode } from "./delete-node";
import { WORKFLOW_EDGE_TYPE, WORKFLOW_NODE_TYPE } from "./constant";

interface ApprovalConfig {
  approverIds: string[];
  mode: "all" | "any";
}

describe("工作流数据模型", () => {
  it("连续在循环和条件内插入节点，连线随源数据计算且不把位置写回模型", () => {
    const nodes = ref<VueFlowNodeProps[]>(createDefaultNodes());
    const rendered = computed(() => autoLayoutNodePosition(nodes.value));
    const edges = computed(() => autoCalEdge(nodes.value));
    nodes.value = insertNode(nodes.value, "2", { type: WORKFLOW_NODE_TYPE.LOOP, label: "循环" });
    const loop = nodes.value.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.LOOP)!;
    const loopAdd = nodes.value.find((entry) => entry.parentNode === loop.id)!;
    nodes.value = insertNode(nodes.value, loopAdd.id, {
      type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
      label: "分支",
    });
    const branch = nodes.value.find(
      (entry) => entry.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
    )!;
    nodes.value = insertConditionBranch(nodes.value, branch.id);
    const condition = nodes.value.find((entry) => entry.data?.conditionIndex === 2)!;
    const conditionAdd = nodes.value.find((entry) => entry.parentNode === condition.id)!;
    nodes.value = insertNode(nodes.value, conditionAdd.id, {
      type: WORKFLOW_NODE_TYPE.APPROVAL,
      label: "审批",
    });
    const approval = nodes.value.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.APPROVAL)!;
    const afterApproval = nodes.value.find(
      (entry) =>
        entry.parentNode === condition.id &&
        entry.id !== conditionAdd.id &&
        entry.data?.type === WORKFLOW_NODE_TYPE.ADD,
    )!;
    nodes.value = insertNode(nodes.value, afterApproval.id, {
      type: WORKFLOW_NODE_TYPE.EXIT_LOOP,
      label: "退出循环",
    });
    const exit = nodes.value.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.EXIT_LOOP)!;
    const afterLoop = nodes.value.find(
      (entry) =>
        entry.id !== "2" && !entry.parentNode && entry.data?.type === WORKFLOW_NODE_TYPE.ADD,
    )!;

    expect(approval.parentNode).toBe(condition.id);
    expect(edges.value).toContainEqual(
      expect.objectContaining({ source: conditionAdd.id, target: approval.id }),
    );
    expect(edges.value.filter((edge) => edge.source === exit.id)).toEqual([
      expect.objectContaining({ target: afterLoop.id }),
    ]);
    expect(edges.value).toContainEqual(
      expect.objectContaining({ target: loop.id, data: { type: WORKFLOW_EDGE_TYPE.LOOP } }),
    );
    expect(
      rendered.value.every(
        (entry) => Number.isFinite(entry.position.x) && Number.isFinite(entry.position.y),
      ),
    ).toBe(true);
    expect(nodes.value.every((entry) => entry.position === undefined)).toBe(true);

    nodes.value = removeNode(nodes.value, loop.id);
    expect(nodes.value).toEqual(createDefaultNodes());
    expect(edges.value).toHaveLength(2);
    expect(rendered.value).toHaveLength(3);
  });

  it("业务配置可修改和序列化，增删节点后保留，并能从草稿还原画布", () => {
    const nodes = ref<VueFlowNodeProps<ApprovalConfig>[]>(createDefaultNodes<ApprovalConfig>());
    const rendered = computed(() => autoLayoutNodePosition(nodes.value));
    nodes.value = insertNode(nodes.value, "2", {
      type: WORKFLOW_NODE_TYPE.APPROVAL,
      label: "审批",
    });
    const approvalId = nodes.value.find(
      (entry) => entry.data?.type === WORKFLOW_NODE_TYPE.APPROVAL,
    )!.id;
    nodes.value = nodes.value.map((entry) =>
      entry.id === approvalId
        ? {
            ...entry,
            data: {
              ...entry.data!,
              description: "主管审批",
              config: { approverIds: ["user-1"], mode: "all" },
            },
          }
        : entry,
    );
    const originalEdges = autoCalEdge(nodes.value);
    nodes.value = insertNode(nodes.value, "2", { type: WORKFLOW_NODE_TYPE.FILL, label: "填写" });
    const fillId = nodes.value.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.FILL)!.id;
    nodes.value = removeNode(nodes.value, fillId);

    expect(nodes.value.find((entry) => entry.id === approvalId)?.data).toMatchObject({
      description: "主管审批",
      config: { approverIds: ["user-1"], mode: "all" },
    });
    expectTypeOf(nodes.value[0]!.data!.config).toEqualTypeOf<ApprovalConfig | undefined>();
    const restored = JSON.parse(JSON.stringify(nodes.value)) as VueFlowNodeProps<ApprovalConfig>[];
    expect(autoCalEdge(restored)).toEqual(originalEdges);
    expect(autoLayoutNodePosition(restored)).toEqual(rendered.value);
    expect(
      restored.every((entry) => entry.position === undefined && !("computedPosition" in entry)),
    ).toBe(true);
  });

  it("深层业务字段修改能更新渲染数据，不影响流程关系", () => {
    const nodes = ref<VueFlowNodeProps<ApprovalConfig>[]>(createDefaultNodes<ApprovalConfig>());
    nodes.value = insertNode(nodes.value, "2", {
      type: WORKFLOW_NODE_TYPE.APPROVAL,
      label: "审批",
    });
    const approval = nodes.value.find((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.APPROVAL)!;
    approval.data!.config = { approverIds: [], mode: "any" };
    const rendered = computed(() => autoLayoutNodePosition(nodes.value));
    const edges = autoCalEdge(nodes.value);
    expect(rendered.value.find((entry) => entry.id === approval.id)?.data?.config).toEqual({
      approverIds: [],
      mode: "any",
    });
    approval.data!.config.approverIds.push("user-2");
    expect(rendered.value.find((entry) => entry.id === approval.id)?.data?.config).toEqual({
      approverIds: ["user-2"],
      mode: "any",
    });
    expect(autoCalEdge(nodes.value)).toEqual(edges);
  });

  it("删除权限随条件数量变化，失败操作不修改源数据", () => {
    const nodes = ref<VueFlowNodeProps[]>(
      insertNode(createDefaultNodes(), "2", {
        type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
        label: "分支",
      }),
    );
    const branch = nodes.value.find(
      (entry) => entry.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
    )!;
    nodes.value = insertConditionBranch(nodes.value, branch.id);
    const first = nodes.value.find((entry) => entry.data?.conditionIndex === 1)!;
    const second = nodes.value.find((entry) => entry.data?.conditionIndex === 2)!;
    const deletable = computed(() => canDeleteNode(nodes.value, first.id));
    expect(deletable.value).toBe(true);
    nodes.value = removeNode(nodes.value, second.id);
    expect(deletable.value).toBe(false);
    const before = JSON.stringify(nodes.value);
    expect(() => removeNode(nodes.value, first.id)).toThrow(/至少保留 2 个条件节点/);
    expect(() =>
      insertNode(nodes.value, "2", { type: WORKFLOW_NODE_TYPE.EXIT_LOOP, label: "退出循环" }),
    ).toThrow(/循环内部/);
    expect(JSON.stringify(nodes.value)).toBe(before);
  });

  it("不同设计器的初始数组和节点数据相互独立", () => {
    const first = createDefaultNodes();
    const second = createDefaultNodes();
    first[0]!.data!.label = "已修改";
    first.splice(1, 1);
    expect(second).toHaveLength(3);
    expect(second[0]!.data!.label).toBe("Node 1");
  });
});
