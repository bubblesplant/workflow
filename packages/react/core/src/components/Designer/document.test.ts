import { describe, expect, it } from "vite-plus/test";
import type { FlowDocumentJSON, FlowNodeJSON } from "@flowgram.ai/fixed-layout-editor";
import type { NodeData, WorkflowNode, WorkflowNodeType } from "../../types";
import { WORKFLOW_NODE_TYPE } from "../../utils/constant";
import { createDefaultNodes } from "../../utils/defaultNode";
import { fromEngineNodeId, toEngineNodeId, toFlowGramDocument } from "./document";

function node(
  id: string,
  type: WorkflowNodeType,
  parentNode?: string,
  data: Partial<NodeData> = {},
): WorkflowNode {
  return { id, parentNode, data: { type, label: id, ...data } };
}

function flatten(document: FlowDocumentJSON): FlowNodeJSON[] {
  const visit = (nodes: FlowNodeJSON[]): FlowNodeJSON[] =>
    nodes.flatMap((entry) => [entry, ...visit(entry.blocks ?? [])]);
  return visit(document.nodes);
}

function businessIds(nodes: readonly FlowNodeJSON[]): string[] {
  return nodes.map((entry) => fromEngineNodeId(entry.id));
}

function nestedNodes(): WorkflowNode[] {
  return [
    node("start", "start"),
    node("root-add", "add"),
    node("branch", "condition-branch"),
    node("fallback", "condition", "branch", { isDefaultCondition: true }),
    node("fallback-add", "add", "fallback"),
    node("condition", "condition", "branch", { conditionIndex: 1 }),
    node("condition-add", "add", "condition"),
    node("loop", "loop", "condition"),
    node("loop-add", "add", "loop"),
    node("inner-branch", "condition-branch", "loop"),
    node("inner-condition", "condition", "inner-branch", { conditionIndex: 1 }),
    node("approval", "approval", "inner-condition", { config: { approverIds: ["user-1"] } }),
    node("inner-fallback", "condition", "inner-branch", { isDefaultCondition: true }),
    node("exit", "exit-loop", "inner-fallback"),
    node("after-loop", "copy", "condition"),
    node("end", "end"),
  ];
}

describe("FlowGram 文档适配", () => {
  it("完整保留可序列化业务字段，并隔离画布对嵌套配置的修改", () => {
    const config = {
      approverIds: ["user-1"],
      threshold: 0,
      enabled: false,
      extra: { notes: "中文", empty: null },
    };
    const nodes: WorkflowNode<typeof config>[] = [
      {
        id: "approval",
        type: "workflow",
        deletable: false,
        position: { x: 125, y: 40 },
        data: { type: "approval", label: "经理审批", description: "金额达到阈值", config },
      },
    ];
    const before = structuredClone(nodes);
    const document = toFlowGramDocument(nodes);
    const rendered = document.nodes[0]!;
    expect(rendered).toEqual({
      id: toEngineNodeId("approval"),
      type: "approval",
      data: nodes[0]!.data,
      blocks: [],
    });
    expect(rendered.data).not.toBe(nodes[0]!.data);
    expect(rendered.data!.config).not.toBe(config);
    rendered.data!.config.approverIds.push("user-2");
    rendered.data!.config.extra.notes = "画布内部更新";
    expect(nodes).toEqual(before);
  });

  it("冻结输入与坐标后仍可转换，不向业务模型写入布局和引擎字段", () => {
    const nodes = nestedNodes();
    const before = structuredClone(nodes);
    for (const entry of nodes) {
      if (entry.position) Object.freeze(entry.position);
      Object.freeze(entry.data);
      Object.freeze(entry);
    }
    Object.freeze(nodes);
    expect(toFlowGramDocument(nodes)).toEqual(toFlowGramDocument(nodes));
    expect(nodes).toEqual(before);
    expect(nodes.every((entry) => entry.type === undefined && entry.position === undefined)).toBe(
      true,
    );
  });

  it("正确嵌套条件中的循环及循环中的条件，保留退出节点和外层后续节点", () => {
    const nodes = nestedNodes();
    const document = toFlowGramDocument(nodes);
    const branch = document.nodes.find((entry) => entry.id === toEngineNodeId("branch"))!;
    const condition = branch.blocks![0]!;
    const loop = condition.blocks!.find((entry) => entry.id === toEngineNodeId("loop"))!;
    const innerBranch = loop.blocks!.find((entry) => entry.id === toEngineNodeId("inner-branch"))!;
    expect(condition.id).toBe(toEngineNodeId("condition"));
    expect(loop.type).toBe("loop");
    expect(innerBranch.type).toBe("condition-branch");
    expect(businessIds(innerBranch.blocks!)).toEqual(["inner-condition", "inner-fallback"]);
    expect(innerBranch.blocks![0]!.blocks![0]).toMatchObject({
      id: toEngineNodeId("approval"),
      type: "approval",
      data: { config: { approverIds: ["user-1"] } },
    });
    expect(innerBranch.blocks![1]!.blocks![0]).toMatchObject({
      id: toEngineNodeId("exit"),
      type: "exit-loop",
      blocks: [],
    });
    expect(businessIds(condition.blocks!)).toEqual(["condition-add", "loop", "after-loop"]);
    expect(flatten(document)).toHaveLength(nodes.length);
    expect(new Set(flatten(document).map((entry) => entry.id)).size).toBe(nodes.length);
  });

  it("普通条件按编号排序，未编号条件保持顺序，兜底条件始终在最后", () => {
    const nodes = [
      node("branch", "condition-branch"),
      node("fallback", "condition", "branch", { isDefaultCondition: true, conditionIndex: 0 }),
      node("third", "condition", "branch", { conditionIndex: 3 }),
      node("unknown-a", "condition", "branch"),
      node("first", "condition", "branch", { conditionIndex: 1 }),
      node("unknown-b", "condition", "branch"),
    ];
    expect(businessIds(toFlowGramDocument(nodes).nodes[0]!.blocks!)).toEqual([
      "first",
      "third",
      "unknown-a",
      "unknown-b",
      "fallback",
    ]);
    expect(nodes.map((entry) => entry.id)).toEqual([
      "branch",
      "fallback",
      "third",
      "unknown-a",
      "first",
      "unknown-b",
    ]);
  });

  it("只读模式移除所有层级的添加入口，保留空条件和循环的结构", () => {
    const nodes = nestedNodes();
    const document = toFlowGramDocument(nodes, true);
    const rendered = flatten(document);
    expect(rendered.every((entry) => entry.type !== WORKFLOW_NODE_TYPE.ADD)).toBe(true);
    expect(businessIds(rendered).sort()).toEqual(
      nodes
        .filter((entry) => entry.data?.type !== WORKFLOW_NODE_TYPE.ADD)
        .map((entry) => entry.id)
        .sort(),
    );
    expect(rendered.find((entry) => entry.id === toEngineNodeId("fallback"))!.blocks).toEqual([]);
    expect(
      businessIds(rendered.find((entry) => entry.id === toEngineNodeId("loop"))!.blocks!),
    ).toEqual(["inner-branch"]);
    expect(nodes.filter((entry) => entry.data?.type === WORKFLOW_NODE_TYPE.ADD)).toHaveLength(4);
  });

  it("父节点晚于子节点时仍按正确层级输出，根节点和普通子节点保留输入顺序", () => {
    const nodes = [
      node("first-child", "approval", "loop"),
      node("start", "start"),
      node("loop", "loop"),
      node("second-child", "copy", "loop"),
      node("end", "end"),
    ];
    const document = toFlowGramDocument(nodes);
    expect(businessIds(document.nodes)).toEqual(["start", "loop", "end"]);
    expect(businessIds(document.nodes[1]!.blocks!)).toEqual(["first-child", "second-child"]);
  });

  it("拒绝重复 ID、缺失父节点和父子引用环，包括脱离根节点的环", () => {
    expect(() => toFlowGramDocument([node("same", "start"), node("same", "end")])).toThrow(/重复/);
    expect(() => toFlowGramDocument([node("orphan", "approval", "missing")])).toThrow(/不存在/);
    expect(() => toFlowGramDocument([node("a", "loop", "b"), node("b", "loop", "a")])).toThrow(
      /循环/,
    );
    expect(() => toFlowGramDocument([node("start", "start"), node("a", "loop", "a")])).toThrow(
      /循环/,
    );
    expect(() => toFlowGramDocument([node("same", "add"), node("same", "add")], true)).toThrow(
      /重复/,
    );
  });

  it("空输入可用于空画布，缺少 data 时回退普通节点且不改写源数据", () => {
    expect(toFlowGramDocument([])).toEqual({ nodes: [] });
    expect(toFlowGramDocument([], true)).toEqual({ nodes: [] });
    const nodes: WorkflowNode[] = [{ id: "business" }];
    expect(toFlowGramDocument(nodes)).toEqual({
      nodes: [{ id: toEngineNodeId("business"), type: "common", data: {}, blocks: [] }],
    });
    expect(nodes).toEqual([{ id: "business" }]);
  });

  it("切换只读并恢复可编辑时不修改保存数据，默认节点恢复后仍含添加入口", () => {
    const nodes = createDefaultNodes();
    const saved = JSON.stringify(nodes);
    const editable = toFlowGramDocument(nodes);
    expect(toFlowGramDocument(nodes, true).nodes.map((entry) => entry.type)).toEqual([
      "start",
      "end",
    ]);
    expect(toFlowGramDocument(nodes)).toEqual(editable);
    expect(JSON.stringify(nodes)).toBe(saved);
    expect(editable.nodes.map((entry) => entry.type)).toEqual(["start", "add", "end"]);
  });

  it("为 root、SDK辅助格式、冒号、中文和百分号 ID 建立可逆且不冲突的命名空间", () => {
    const ids = [
      "root",
      "$blockIcon$root",
      "$inlineBlocks$root",
      "$blockOrderIcon$条件",
      "workflow:root",
      "审批:负责人",
      "100%",
      "a%3Ab",
      "",
      "a:b",
      "a/b",
      "a?b",
    ];
    const encoded = ids.map(toEngineNodeId);
    expect(new Set(encoded).size).toBe(ids.length);
    expect(
      encoded.every((id) => id.startsWith("workflow:") && id !== "root" && !id.startsWith("$")),
    ).toBe(true);
    expect(encoded).toEqual(ids.map((id) => `workflow:${encodeURIComponent(id)}`));
    expect(encoded.map(fromEngineNodeId)).toEqual(ids);

    const nodes = [
      node("root", "condition-branch"),
      ...ids.slice(1).map((id) => node(id, "condition", "root")),
    ];
    const document = toFlowGramDocument(nodes);
    expect(document.nodes[0]!.id).toBe(toEngineNodeId("root"));
    expect(businessIds(document.nodes[0]!.blocks!)).toEqual(ids.slice(1));
    expect(new Set(flatten(document).map((entry) => entry.id)).size).toBe(nodes.length);
    expect(nodes[0]!.id).toBe("root");
    expect(fromEngineNodeId("root")).toBe("root");
    expect(fromEngineNodeId("$blockIcon$workflow:root")).toBe("$blockIcon$workflow:root");
    expect(fromEngineNodeId("workflow:%malformed")).toBe("workflow:%malformed");
  });
});
