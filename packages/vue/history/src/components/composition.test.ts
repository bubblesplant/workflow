import {
  createRenderer,
  defineComponent,
  h,
  nextTick,
  shallowReactive,
  type App,
  type VNode,
} from "vue";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
  WorkflowAvatar,
  WorkflowTimeline,
  WorkflowTimelineDot,
  WorkflowTimelineItem,
  WorkflowTimelineTag,
} from "../index";
import type { WorkflowStatus, WorkflowTimelineItemProps } from "../types";

interface HostNode {
  type: string;
  text: string;
  props: Record<string, unknown>;
  children: HostNode[];
  parent: HostNode | null;
  style: { display?: string };
}

const createNode = (type: string, text = ""): HostNode => ({
  type,
  text,
  props: {},
  children: [],
  parent: null,
  style: {},
});

const renderer = createRenderer<HostNode, HostNode>({
  createElement: (type) => createNode(type),
  createText: (text) => createNode("#text", text),
  createComment: (text) => createNode("#comment", text),
  insert(node, parent, anchor) {
    if (node.parent) {
      const oldIndex = node.parent.children.indexOf(node);
      if (oldIndex >= 0) node.parent.children.splice(oldIndex, 1);
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
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
  patchProp(node, key, _previous, value) {
    node.props[key] = value;
  },
});

const mountedApps: App[] = [];
afterEach(() => {
  for (const app of mountedApps.splice(0)) app.unmount();
});

function mount(render: () => VNode) {
  const root = createNode("root");
  const app = renderer.createApp(defineComponent({ setup: () => render }));
  app.mount(root);
  mountedApps.push(app);
  return root;
}

function nodes(root: HostNode, predicate: (node: HostNode) => boolean): HostNode[] {
  return [root, ...root.children.flatMap((child) => nodes(child, predicate))].filter(predicate);
}

function byClass(root: HostNode, className: string) {
  return nodes(
    root,
    (node) =>
      typeof node.props.class === "string" && node.props.class.split(/\s+/).includes(className),
  );
}

function textContent(root: HostNode): string {
  return root.text + root.children.map(textContent).join("");
}

const click = (node: HostNode) => (node.props.onClick as () => void)();
const toggles = (root: HostNode) => byClass(root, "workflow-history__toggle");
const details = (root: HostNode) => byClass(root, "workflow-history__details");
type ItemScope = { expanded: boolean; toggle: () => void };

describe("Workflow 组合组件", () => {
  it("可独立组合列表和条目，下方内容全部来自业务插槽", () => {
    const root = mount(() =>
      h(
        WorkflowTimeline,
        { label: "项目审批过程" },
        {
          default: () => [
            h(
              WorkflowTimelineItem,
              { title: "项目立项", type: "info" },
              {
                default: () => [
                  h("article", { class: "business-detail" }, [
                    h("h3", "项目编号 PRJ-001"),
                    h("p", "业务自定义表单，不依赖标准记录对象。"),
                  ]),
                ],
              },
            ),
          ],
        },
      ),
    );
    const timeline = byClass(root, "workflow-timeline")[0]!;
    const item = byClass(root, "workflow-timeline-item")[0]!;
    expect(timeline.type).toBe("ol");
    expect(timeline.props["aria-label"]).toBe("项目审批过程");
    expect(item.type).toBe("li");
    expect(item.parent).toBe(timeline);
    expect(textContent(root)).toContain("业务自定义表单，不依赖标准记录对象。");
    expect(byClass(root, "workflow-history__fields")).toHaveLength(0);
    expect(textContent(root)).not.toContain("未填写审批意见");
    expect(textContent(root)).not.toContain("等待处理，暂无审批意见");
    const defaultTimeline = mount(() => h(WorkflowTimeline));
    expect(byClass(defaultTimeline, "workflow-timeline")[0]!.props["aria-label"]).toBe(
      "流程流转记录",
    );
  });

  it("完整替换标题、状态、圆点和内容，业务交互不嵌套在折叠按钮内", async () => {
    const root = mount(() =>
      h(
        WorkflowTimelineItem,
        { type: "success" },
        {
          title: ({ expanded }: ItemScope) => [
            h("a", { href: "/business/1", class: "business-title" }, `自定义审批 ${expanded}`),
          ],
          status: ({ toggle }: ItemScope) => [
            h("button", { type: "button", class: "business-action", onClick: toggle }, "切换详情"),
          ],
          dot: () => [h("span", { class: "business-dot" }, "★")],
          default: ({ expanded }: ItemScope) => [h("section", `自定义内容 ${expanded}`)],
        },
      ),
    );
    expect(byClass(root, "business-dot")).toHaveLength(1);
    expect(textContent(root)).toContain("自定义审批 true");
    expect(textContent(root)).toContain("自定义内容 true");
    expect(byClass(root, "workflow-timeline-tag")).toHaveLength(0);
    expect(byClass(root, "workflow-timeline-dot")).toHaveLength(0);
    for (const node of [...byClass(root, "business-title"), ...byClass(root, "business-action")]) {
      let ancestor = node.parent;
      while (ancestor) {
        expect(ancestor.type).not.toBe("button");
        ancestor = ancestor.parent;
      }
    }
    click(byClass(root, "business-action")[0]!);
    await nextTick();
    expect(textContent(root)).toContain("自定义审批 false");
    expect(details(root)[0]!.style.display).toBe("none");
  });

  it("各条目展开互不干扰，提供独立 aria 关联及双向绑定事件", async () => {
    const onUpdate = vi.fn();
    const onToggle = vi.fn();
    const root = mount(() =>
      h(WorkflowTimeline, null, {
        default: () => [
          h(
            WorkflowTimelineItem,
            { title: "第一步", "onUpdate:expanded": onUpdate, onToggle },
            { default: () => [h("p", "第一步详情")] },
          ),
          h(
            WorkflowTimelineItem,
            { title: "第二步", defaultExpanded: false },
            { default: () => [h("p", "第二步详情")] },
          ),
        ],
      }),
    );
    expect(toggles(root).map((node) => node.props["aria-expanded"])).toEqual([true, false]);
    const ids = details(root).map((node) => node.props.id);
    expect(new Set(ids).size).toBe(2);
    expect(toggles(root).map((node) => node.props["aria-controls"])).toEqual(ids);
    click(toggles(root)[0]!);
    await nextTick();
    expect(toggles(root).map((node) => node.props["aria-expanded"])).toEqual([false, false]);
    expect(onUpdate).toHaveBeenLastCalledWith(false);
    expect(onToggle).toHaveBeenLastCalledWith(false);
    click(toggles(root)[1]!);
    await nextTick();
    expect(toggles(root).map((node) => node.props["aria-expanded"])).toEqual([false, true]);
  });

  it("受控条目等待父组件更新 expanded", async () => {
    const props = shallowReactive<WorkflowTimelineItemProps>({
      title: "主管审批",
      expanded: false,
    });
    const onUpdate = vi.fn();
    const root = mount(() =>
      h(WorkflowTimelineItem, Object.assign({}, props, { "onUpdate:expanded": onUpdate }), {
        default: () => [h("p", "待审批内容")],
      }),
    );
    click(toggles(root)[0]!);
    await nextTick();
    expect(onUpdate).toHaveBeenCalledWith(true);
    expect(toggles(root)[0]!.props["aria-expanded"]).toBe(false);
    expect(details(root)[0]!.style.display).toBe("none");
    props.expanded = true;
    await nextTick();
    expect(toggles(root)[0]!.props["aria-expanded"]).toBe(true);
    expect(details(root)[0]!.style.display).not.toBe("none");
  });

  it("禁用折叠时始终显示业务内容且不响应插槽中的 toggle", () => {
    const onUpdate = vi.fn();
    const root = mount(() =>
      h(
        WorkflowTimelineItem,
        { collapsible: false, expanded: false, "onUpdate:expanded": onUpdate },
        {
          title: ({ toggle }: ItemScope) => [
            h("button", { class: "business-toggle", type: "button", onClick: toggle }, "业务操作"),
          ],
          default: () => [h("p", "始终可见")],
        },
      ),
    );
    expect(toggles(root)).toHaveLength(0);
    expect(details(root)[0]!.style.display).not.toBe("none");
    click(byClass(root, "business-toggle")[0]!);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("头像支持姓名、图片和业务插槽", () => {
    const root = mount(() =>
      h("div", [
        h(WorkflowAvatar, { text: "张😀明" }),
        h(WorkflowAvatar, { text: "李华", src: "/avatar.png" }),
        h(WorkflowAvatar, { text: "系统" }, { default: () => [h("b", "机器人")] }),
      ]),
    );
    const avatars = byClass(root, "workflow-avatar");
    expect(textContent(avatars[0]!)).toBe("😀明");
    expect(nodes(avatars[1]!, (node) => node.type === "img")[0]!.props.src).toBe("/avatar.png");
    expect(textContent(avatars[2]!)).toBe("机器人");
  });

  it("状态文案可以覆盖，未知状态在独立圆点和标签中回退", () => {
    const unknown = "custom-action" as WorkflowStatus;
    const root = mount(() =>
      h("div", [
        h(WorkflowTimelineTag, { type: "success", text: "已转交" }),
        h(
          WorkflowTimelineTag,
          { type: "success", text: "将被替换" },
          { default: () => [h("b", "人工确认")] },
        ),
        h(WorkflowTimelineTag, { type: unknown }),
        h(WorkflowTimelineDot, { type: unknown }),
      ]),
    );
    const tags = byClass(root, "workflow-timeline-tag");
    expect(textContent(tags[0]!)).toBe("已转交");
    expect(textContent(tags[1]!)).toBe("人工确认");
    expect(textContent(tags[2]!)).toBe("待处理");
    expect(byClass(root, "workflow-history__status--pending")).toHaveLength(1);
    expect(byClass(root, "workflow-history__dot--pending")).toHaveLength(1);
    const unknownItem = mount(() =>
      h(WorkflowTimelineItem, { type: unknown, title: "未知业务状态" }),
    );
    expect(byClass(unknownItem, "workflow-history__item--pending")).toHaveLength(1);
  });
});
