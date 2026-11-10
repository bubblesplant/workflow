import {
  createRenderer,
  defineComponent,
  h,
  nextTick,
  shallowReactive,
  type App,
  type Slots,
} from "vue";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import type {
  WorkflowHistoryAttachmentEvent,
  WorkflowHistoryProps,
  WorkflowHistoryRecord,
} from "../../types";
import WorkflowHistory from "./index.vue";

interface HostNode {
  type: string;
  text: string;
  props: Record<string, unknown>;
  children: HostNode[];
  parent: HostNode | null;
  style: { display?: string };
}

function createNode(type: string, text = ""): HostNode {
  return { type, text, props: {}, children: [], parent: null, style: {} };
}

// 以最小宿主树挂载真实组件，检查事件、响应式更新和 v-show，不依赖浏览器环境。
const renderer = createRenderer<HostNode, HostNode>({
  createElement: (type) => createNode(type),
  createText: (text) => createNode("#text", text),
  createComment: (text) => createNode("#comment", text),
  insert(node, parent, anchor) {
    if (node.parent) {
      const previousIndex = node.parent.children.indexOf(node);
      if (previousIndex >= 0) node.parent.children.splice(previousIndex, 1);
    }
    const anchorIndex = anchor ? parent.children.indexOf(anchor) : -1;
    parent.children.splice(anchorIndex < 0 ? parent.children.length : anchorIndex, 0, node);
    node.parent = parent;
  },
  remove(node) {
    const index = node.parent?.children.indexOf(node) ?? -1;
    if (index >= 0) node.parent!.children.splice(index, 1);
    node.parent = null;
  },
  setText(node, text) {
    node.text = text;
  },
  setElementText(node, text) {
    node.text = text;
    node.children = [];
  },
  parentNode: (node) => node.parent,
  nextSibling(node) {
    if (!node.parent) return null;
    return node.parent.children[node.parent.children.indexOf(node) + 1] ?? null;
  },
  patchProp(node, key, _previous, value) {
    node.props[key] = value;
  },
});

const mountedApps: App[] = [];
afterEach(() => {
  for (const app of mountedApps.splice(0)) app.unmount();
});

function findAll(root: HostNode, className: string): HostNode[] {
  return [root, ...root.children.flatMap((child) => findAll(child, className))].filter((node) => {
    const value = node.props.class;
    return typeof value === "string" && value.split(/\s+/).includes(className);
  });
}

function content(root: HostNode): string {
  return root.text + root.children.map(content).join("");
}

function click(node: HostNode, event: unknown = {}) {
  (node.props.onClick as (event: unknown) => void)(event);
}

function mountHistory(
  initial: WorkflowHistoryProps = {},
  slots: Slots = {},
  attachmentHandler?: (payload: WorkflowHistoryAttachmentEvent) => void,
) {
  const props = shallowReactive<WorkflowHistoryProps>({ ...initial });
  const onUpdate = vi.fn<(keys: string[]) => void>();
  const onToggle = vi.fn();
  const onAttachmentClick = vi.fn(attachmentHandler);
  const root = createNode("root");
  const app = renderer.createApp(
    defineComponent({
      setup: () => () =>
        h(
          WorkflowHistory,
          Object.assign({}, props, {
            "onUpdate:expandedKeys": onUpdate,
            onToggle,
            onAttachmentClick,
          }),
          slots,
        ),
    }),
  );
  app.mount(root);
  mountedApps.push(app);
  return {
    props,
    root,
    onUpdate,
    onToggle,
    onAttachmentClick,
    toggles: () => findAll(root, "workflow-history__toggle"),
    details: () => findAll(root, "workflow-history__details"),
  };
}

const records: readonly WorkflowHistoryRecord[] = Object.freeze([
  Object.freeze({
    id: "submit",
    title: "发起申请",
    status: "info",
    operator: { name: "张小明" },
    opinion: "申请已提交。",
  }),
  Object.freeze({
    id: "approve",
    title: "主管审批",
    status: "success",
    operator: { name: "李华" },
    opinion: "同意。",
  }),
]);

describe("WorkflowHistory", () => {
  it("默认展开，单条和全部展开切换不修改传入记录", async () => {
    const before = JSON.stringify(records);
    const mounted = mountHistory({ records });
    expect(mounted.toggles().map((node) => node.props["aria-expanded"])).toEqual([true, true]);
    expect(mounted.details().every((node) => node.style.display !== "none")).toBe(true);
    expect(content(mounted.root)).toContain("小明");

    click(mounted.toggles()[0]!);
    await nextTick();
    expect(mounted.toggles().map((node) => node.props["aria-expanded"])).toEqual([false, true]);
    expect(mounted.details()[0]!.style.display).toBe("none");
    expect(mounted.onUpdate).toHaveBeenLastCalledWith(["approve"]);
    expect(mounted.onToggle).toHaveBeenLastCalledWith({ record: records[0], expanded: false });

    click(findAll(mounted.root, "workflow-history__toggle-all")[0]!);
    await nextTick();
    expect(mounted.toggles().every((node) => node.props["aria-expanded"] === true)).toBe(true);
    click(findAll(mounted.root, "workflow-history__toggle-all")[0]!);
    await nextTick();
    expect(mounted.details().every((node) => node.style.display === "none")).toBe(true);
    expect(mounted.onUpdate).toHaveBeenLastCalledWith([]);
    expect(JSON.stringify(records)).toBe(before);
  });

  it("受控展开只发出更新请求，等待父组件回写后再展示", async () => {
    const mounted = mountHistory({ records, expandedKeys: Object.freeze(["approve"]) });
    click(mounted.toggles()[0]!);
    await nextTick();
    expect(mounted.onUpdate).toHaveBeenLastCalledWith(["submit", "approve"]);
    expect(mounted.toggles()[0]!.props["aria-expanded"]).toBe(false);
    expect(mounted.details()[0]!.style.display).toBe("none");

    mounted.props.expandedKeys = ["submit", "approve"];
    await nextTick();
    expect(mounted.toggles()[0]!.props["aria-expanded"]).toBe(true);
    expect(mounted.details()[0]!.style.display).not.toBe("none");
  });

  it("按稳定 id 保留展开状态，新增记录沿用默认收起配置", async () => {
    const mounted = mountHistory({ records, defaultExpanded: false });
    click(mounted.toggles()[0]!);
    await nextTick();
    mounted.props.records = [records[1]!, records[0]!, { id: "new", title: "财务审核" }];
    await nextTick();
    expect(mounted.toggles().map((node) => node.props["aria-expanded"])).toEqual([
      false,
      true,
      false,
    ]);
    expect(mounted.details()[1]!.props.id).toBe(mounted.toggles()[1]!.props["aria-controls"]);
  });

  it("加载优先于记录列表，空态和自定义内容插槽均可渲染", async () => {
    const mounted = mountHistory(
      { records, loading: true },
      {
        loading: () => [h("p", "正在读取审批日志")],
        empty: () => [h("p", "请先发起流程")],
        default: () => [h("small", "来自业务系统")],
      },
    );
    expect(findAll(mounted.root, "workflow-history__list")).toHaveLength(0);
    expect(content(mounted.root)).toContain("正在读取审批日志");
    expect(content(mounted.root)).toContain("来自业务系统");
    expect(findAll(mounted.root, "workflow-history")[0]!.props["aria-busy"]).toBe(true);
    mounted.props.loading = false;
    mounted.props.records = [];
    await nextTick();
    expect(content(mounted.root)).toContain("请先发起流程");

    const custom = mountHistory(
      { records },
      {
        content: ({ record }: { record: WorkflowHistoryRecord }) => [
          h("p", `自定义详情：${record.title}`),
        ],
      },
    );
    expect(content(custom.root)).toContain("自定义详情：主管审批");
    expect(findAll(custom.root, "workflow-history__fields")).toHaveLength(0);
  });

  it("附件链接传递原始点击事件，业务方可以接管默认预览", () => {
    const attachment = { id: "file", name: "报价单.pdf", url: "/files/quote.pdf" };
    const record = { id: "submit", title: "发起申请", attachments: [attachment] };
    const mounted = mountHistory({ records: [record] }, {}, ({ event }) => event.preventDefault());
    const link = findAll(mounted.root, "workflow-history__attachment")[0]!;
    expect(link.type).toBe("a");
    expect(link.props.href).toBe("/files/quote.pdf");
    expect(link.props.rel).toBe("noopener noreferrer");
    const event = { preventDefault: vi.fn() };
    click(link, event);
    expect(mounted.onAttachmentClick).toHaveBeenCalledWith({ record, attachment, event });
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(mounted.onToggle).not.toHaveBeenCalled();
  });

  it("标题和状态插槽的业务链接、按钮独立于折叠按钮", () => {
    const onTitleClick = vi.fn();
    const onStatusClick = vi.fn();
    const mounted = mountHistory(
      { records },
      {
        title: ({ record }: { record: WorkflowHistoryRecord }) => [
          h(
            "a",
            { href: `/records/${record.id}`, class: "business-title-link", onClick: onTitleClick },
            record.title,
          ),
        ],
        status: () => [
          h(
            "button",
            { type: "button", class: "business-status-action", onClick: onStatusClick },
            "查看处理详情",
          ),
        ],
      },
    );
    const titleLink = findAll(mounted.root, "business-title-link")[0]!;
    const statusAction = findAll(mounted.root, "business-status-action")[0]!;
    for (const node of [titleLink, statusAction]) {
      let ancestor = node.parent;
      while (ancestor) {
        expect(ancestor.type).not.toBe("button");
        ancestor = ancestor.parent;
      }
    }
    expect(mounted.toggles()).toHaveLength(records.length);
    click(titleLink);
    click(statusAction);
    expect(onTitleClick).toHaveBeenCalledOnce();
    expect(onStatusClick).toHaveBeenCalledOnce();
    expect(mounted.onToggle).not.toHaveBeenCalled();
  });

  it("禁用折叠时始终展示详情，不输出折叠控件或更新事件", () => {
    const mounted = mountHistory({
      records,
      collapsible: false,
      expandedKeys: [],
      defaultExpanded: false,
    });
    expect(findAll(mounted.root, "workflow-history__toggle-all")).toHaveLength(0);
    expect(mounted.toggles()).toHaveLength(0);
    expect(
      findAll(mounted.root, "workflow-history__summary").every((node) => node.type === "div"),
    ).toBe(true);
    expect(
      findAll(mounted.root, "workflow-history__summary").every(
        (node) => node.props["aria-expanded"] === undefined,
      ),
    ).toBe(true);
    expect(mounted.details().every((node) => node.style.display !== "none")).toBe(true);
    expect(mounted.onToggle).not.toHaveBeenCalled();
    expect(mounted.onUpdate).not.toHaveBeenCalled();
  });
});
