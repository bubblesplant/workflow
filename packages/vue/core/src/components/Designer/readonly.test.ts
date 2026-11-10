import { createRenderer, defineComponent, h, nextTick, shallowReactive } from "vue";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import type { NodeData, VueFlowEdge, VueFlowNode, VueFlowNodeProps } from "../../types";
import { insertNode } from "../../utils/add-node";
import { WORKFLOW_NODE_DIMENSIONS, getNodeDimensions } from "../../utils/node-dimensions";
import { createDefaultNodes } from "../../utils/defaultNode";
import { WORKFLOW_EDGE_TYPE, WORKFLOW_NODE_TYPE } from "../../utils/constant";
import Designer from "./index.vue";

type NodeEmit = (event: string, ...args: unknown[]) => void;
interface FlowState {
  nodes: VueFlowNode[];
  edges: VueFlowEdge[];
  elementsSelectable: boolean;
  nodesFocusable: boolean;
  edgesFocusable: boolean;
  panOnDrag?: boolean;
  zoomOnScroll?: boolean;
}

const { renderFlow, nodeEvents } = vi.hoisted(() => ({
  renderFlow: vi.fn(),
  nodeEvents: new Map<NodeData, NodeEmit>(),
}));

vi.mock("@vue-flow/core", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    VueFlow: defineComponent({
      props: [
        "nodes",
        "edges",
        "elementsSelectable",
        "nodesFocusable",
        "edgesFocusable",
        "panOnDrag",
        "zoomOnScroll",
      ],
      setup(props, { slots }) {
        return () => {
          renderFlow({ ...props });
          return h(
            "div",
            props.nodes.flatMap((node: VueFlowNode) => slots["node-workflow"]?.(node)),
          );
        };
      },
    }),
  };
});

vi.mock("../Node/index.vue", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    default: defineComponent({
      props: ["data", "readonly", "deletable", "allowExitLoop"],
      emits: ["addNode", "addBranch", "delete", "click"],
      setup(props, { emit }) {
        return () => {
          nodeEvents.set(props.data, emit as NodeEmit);
          return h("span");
        };
      },
    }),
  };
});

vi.mock("../Edge/index.vue", () => ({ default: { render: () => null } }));

// 只需要挂载组件与响应式更新；画布和节点由上面的桩组件记录输入及事件。
const renderer = createRenderer<object, object>({
  createElement: () => ({}),
  createText: () => ({}),
  createComment: () => ({}),
  insert() {},
  remove() {},
  setText() {},
  setElementText() {},
  parentNode: () => null,
  nextSibling: () => null,
  patchProp() {},
});
const mountedRoots: object[] = [];

afterEach(() => {
  for (const root of mountedRoots.splice(0)) renderer.render(null, root);
  nodeEvents.clear();
  vi.clearAllMocks();
});

function mountDesigner(nodes: VueFlowNodeProps[], readonly?: boolean) {
  const props = shallowReactive({ nodes, ...(readonly === undefined ? {} : { readonly }) });
  const onUpdate = vi.fn((value: VueFlowNodeProps[]) => {
    props.nodes = value;
  });
  const onNodeClick = vi.fn();
  const root = {};
  mountedRoots.push(root);
  renderer.render(
    h(
      defineComponent({
        setup: () => () =>
          h(Designer, {
            id: "readonly-test",
            nodes: props.nodes,
            readonly: props.readonly,
            "onUpdate:nodes": onUpdate,
            onNodeClick,
          }),
      }),
    ),
    root,
  );
  return { props, onUpdate, onNodeClick };
}

const flow = () => renderFlow.mock.lastCall![0] as FlowState;
const findNode = (nodes: VueFlowNodeProps[], type: string) =>
  nodes.find((node) => node.data?.type === type)!;
const emitFrom = (node: VueFlowNodeProps) => nodeEvents.get(node.data!)!;

function nestedNodes() {
  let nodes = insertNode(createDefaultNodes(), "2", {
    type: WORKFLOW_NODE_TYPE.LOOP,
    label: "循环",
  });
  const loop = findNode(nodes, WORKFLOW_NODE_TYPE.LOOP);
  const loopAdd = nodes.find((node) => node.parentNode === loop.id)!;
  nodes = insertNode(nodes, loopAdd.id, {
    type: WORKFLOW_NODE_TYPE.CONDITION_BRANCH,
    label: "分支",
  });
  const condition = findNode(nodes, WORKFLOW_NODE_TYPE.CONDITION);
  const conditionAdd = nodes.find((node) => node.parentNode === condition.id)!;
  nodes = insertNode(nodes, conditionAdd.id, { type: WORKFLOW_NODE_TYPE.APPROVAL, label: "审批" });
  return nodes;
}

describe("Designer 只读模式", () => {
  it("移除添加入口后重新布局和连线，保留条件、循环与空分支路径", () => {
    const nodes = nestedNodes();
    const before = JSON.stringify(nodes);
    const { onUpdate } = mountDesigner(nodes, true);
    const state = flow();
    const visibleIds = new Set(state.nodes.map((node) => node.id));
    const start = findNode(state.nodes, WORKFLOW_NODE_TYPE.START) as VueFlowNode;
    const loop = findNode(state.nodes, WORKFLOW_NODE_TYPE.LOOP) as VueFlowNode;
    const branch = findNode(state.nodes, WORKFLOW_NODE_TYPE.CONDITION_BRANCH);
    const conditions = state.nodes.filter(
      (node) => node.data?.type === WORKFLOW_NODE_TYPE.CONDITION,
    );
    const approval = findNode(state.nodes, WORKFLOW_NODE_TYPE.APPROVAL) as VueFlowNode;
    const end = findNode(state.nodes, WORKFLOW_NODE_TYPE.END);

    expect(state.nodes.some((node) => node.data?.type === WORKFLOW_NODE_TYPE.ADD)).toBe(false);
    expect(conditions).toHaveLength(2);
    expect(loop.position.y - start.position.y).toBe(
      getNodeDimensions(WORKFLOW_NODE_TYPE.START).height + WORKFLOW_NODE_DIMENSIONS.gap,
    );
    expect(approval.position.y).toBe(
      getNodeDimensions(WORKFLOW_NODE_TYPE.CONDITION).height + WORKFLOW_NODE_DIMENSIONS.gap,
    );
    expect(
      state.edges.every((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)),
    ).toBe(true);
    for (const condition of conditions) {
      expect(state.edges).toContainEqual(
        expect.objectContaining({ source: branch.id, target: condition.id }),
      );
    }
    const fallback = conditions.find((node) => node.data?.isDefaultCondition)!;
    expect(state.edges).toContainEqual(
      expect.objectContaining({ source: fallback.id, target: end.id }),
    );
    expect(state.edges).toContainEqual(
      expect.objectContaining({
        source: approval.id,
        target: loop.id,
        data: { type: WORKFLOW_EDGE_TYPE.LOOP },
      }),
    );
    expect(JSON.stringify(nodes)).toBe(before);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(state).toMatchObject({
      elementsSelectable: false,
      nodesFocusable: false,
      edgesFocusable: false,
    });
    expect(state.panOnDrag).not.toBe(false);
    expect(state.zoomOnScroll).not.toBe(false);
  });

  it("切为只读后忽略排队的编辑与节点点击，并响应外部数据刷新", async () => {
    const nodes = nestedNodes();
    const before = JSON.stringify(nodes);
    const { props, onUpdate, onNodeClick } = mountDesigner(nodes);
    const add = emitFrom(findNode(nodes, WORKFLOW_NODE_TYPE.ADD));
    const branch = emitFrom(findNode(nodes, WORKFLOW_NODE_TYPE.CONDITION_BRANCH));
    const approvalNode = findNode(nodes, WORKFLOW_NODE_TYPE.APPROVAL);
    const approval = emitFrom(approvalNode);
    props.readonly = true;
    await nextTick();

    add("addNode", { type: WORKFLOW_NODE_TYPE.FILL, label: "填写" });
    branch("addBranch");
    branch("delete");
    approval("delete");
    approval("click");
    await nextTick();
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onNodeClick).not.toHaveBeenCalled();
    expect(props.nodes).toBe(nodes);
    expect(JSON.stringify(nodes)).toBe(before);

    props.nodes = nodes.map((node) =>
      node.id === approvalNode.id ? { ...node, data: { ...node.data!, label: "外部更新" } } : node,
    );
    await nextTick();
    expect(findNode(flow().nodes, WORKFLOW_NODE_TYPE.APPROVAL).data?.label).toBe("外部更新");
    expect(flow().nodes.some((node) => node.data?.type === WORKFLOW_NODE_TYPE.ADD)).toBe(false);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("默认可编辑，往返切换不改变模型，恢复后可以点击和增删", async () => {
    const nodes = nestedNodes();
    const { props, onUpdate, onNodeClick } = mountDesigner(nodes);
    expect(flow()).toMatchObject({
      elementsSelectable: true,
      nodesFocusable: true,
      edgesFocusable: true,
    });
    expect(flow().nodes).toHaveLength(nodes.length);
    props.readonly = true;
    await nextTick();
    props.readonly = false;
    await nextTick();
    expect(props.nodes).toBe(nodes);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(flow().nodes).toHaveLength(nodes.length);

    const approval = findNode(props.nodes, WORKFLOW_NODE_TYPE.APPROVAL);
    emitFrom(approval)("click");
    expect(onNodeClick).toHaveBeenCalledWith({
      id: approval.id,
      type: WORKFLOW_NODE_TYPE.APPROVAL,
    });
    emitFrom(findNode(props.nodes, WORKFLOW_NODE_TYPE.CONDITION_BRANCH))("addBranch");
    await nextTick();
    expect(
      props.nodes.filter((node) => node.data?.type === WORKFLOW_NODE_TYPE.CONDITION),
    ).toHaveLength(3);
    emitFrom(approval)("delete");
    await nextTick();
    expect(props.nodes.some((node) => node.id === approval.id)).toBe(false);
    emitFrom(findNode(props.nodes, WORKFLOW_NODE_TYPE.ADD))("addNode", {
      type: WORKFLOW_NODE_TYPE.FILL,
      label: "填写",
    });
    await nextTick();
    expect(findNode(props.nodes, WORKFLOW_NODE_TYPE.FILL).data?.label).toBe("填写");
    expect(onUpdate).toHaveBeenCalledTimes(3);
  });
});
