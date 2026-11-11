import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal, Tooltip } from "antd";
import { FullscreenOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import "@flowgram.ai/fixed-layout-editor/index.css";
import {
  ConstantKeys,
  EditorRenderer,
  FixedLayoutEditorProvider,
  FlowLayoutDefault,
  FlowRendererKey,
  type FixedLayoutPluginContext,
  type FixedLayoutProps,
} from "@flowgram.ai/fixed-layout-editor";
import type { DesignerProps } from "./index";
import { canDeleteNode, removeNode } from "../../utils/delete-node";
import { insertConditionBranch, insertNode } from "../../utils/add-node";
import { toFlowGramDocument } from "./document";
import { nodeRegistries } from "./registries";
import { WorkflowContext, type WorkflowController } from "./context";
import { WorkflowNodeRenderer } from "./NodeRenderer";

const EmptyMaterial = () => null;

export default function FlowGramCanvas<TConfig>(props: DesignerProps<TConfig>) {
  const latest = useRef(props);
  latest.current = props;
  const context = useRef<FixedLayoutPluginContext | null>(null);
  const [modal, modalContextHolder] = Modal.useModal();
  const [selectedId, setSelectedId] = useState("");
  const document = useMemo(
    () => toFlowGramDocument(props.nodes, props.readonly),
    [props.nodes, props.readonly],
  );
  const initialDocument = useRef(document);
  const initialFit = useRef(false);
  const initialFitFrame = useRef<number | null>(null);
  const options = useMemo<FixedLayoutProps>(
    () => ({
      initialData: initialDocument.current,
      nodeRegistries,
      defaultLayout: FlowLayoutDefault.VERTICAL_FIXED_LAYOUT,
      background: true,
      readonly: true,
      history: { enable: false, disableShortcuts: true },
      nodeEngine: { enable: false },
      variableEngine: { enable: false },
      scroll: { enableScrollLimit: true },
      constants: {
        [ConstantKeys.NODE_SPACING]: 40,
        [ConstantKeys.BRANCH_SPACING]: 60,
        [ConstantKeys.BASE_COLOR]: "#b7c3d5",
        [ConstantKeys.BASE_ACTIVATED_COLOR]: "#5075dc",
      },
      materials: {
        renderDefaultNode: WorkflowNodeRenderer,
        components: {
          [FlowRendererKey.DRAG_NODE]: EmptyMaterial,
          [FlowRendererKey.DRAGGABLE_ADDER]: EmptyMaterial,
          [FlowRendererKey.DRAG_HIGHLIGHT_ADDER]: EmptyMaterial,
          [FlowRendererKey.DRAG_BRANCH_HIGHLIGHT_ADDER]: EmptyMaterial,
          [FlowRendererKey.ADDER]: EmptyMaterial,
          [FlowRendererKey.BRANCH_ADDER]: EmptyMaterial,
          [FlowRendererKey.COLLAPSE]: EmptyMaterial,
          [FlowRendererKey.SELECTOR_BOX_POPOVER]: EmptyMaterial,
        },
        renderTexts: {
          "loop-end-text": "循环结束",
          "loop-traverse-text": "循环",
          "loop-while-text": "满足循环条件",
        },
      },
      onInit: (ctx) => {
        context.current = ctx;
        ctx.document.fromJSON(toFlowGramDocument(latest.current.nodes, latest.current.readonly));
      },
      onAllLayersRendered: (ctx) => {
        if (initialFit.current || initialFitFrame.current !== null) return;
        // 图层首次挂载后，节点 Portal 才会写入实测尺寸；下一帧刷新布局再计算视口。
        initialFitFrame.current = requestAnimationFrame(() => {
          initialFitFrame.current = null;
          if (context.current !== ctx || ctx.document.disposed || ctx.playground.disposed) return;
          ctx.document.transformer.refresh();
          initialFit.current = true;
          void ctx.tools.fitView(false);
        });
      },
      onDispose: () => {
        if (initialFitFrame.current !== null) {
          cancelAnimationFrame(initialFitFrame.current);
          initialFitFrame.current = null;
        }
        context.current = null;
      },
    }),
    [],
  );

  useEffect(() => {
    const ctx = context.current;
    if (ctx && !ctx.document.disposed) ctx.document.fromJSON(document);
  }, [document]);

  useEffect(
    () => () => {
      if (initialFitFrame.current !== null) {
        cancelAnimationFrame(initialFitFrame.current);
        initialFitFrame.current = null;
      }
    },
    [],
  );

  const controller: WorkflowController = {
    nodes: props.nodes,
    readonly: Boolean(props.readonly),
    selectedId,
    select(id) {
      if (latest.current.readonly) return;
      const type = latest.current.nodes.find((node) => node.id === id)?.data?.type;
      if (!type || type === "start" || type === "end" || type === "add") return;
      setSelectedId(id);
      latest.current.onNodeClick?.({ id, type });
    },
    insert(id, option) {
      const current = latest.current;
      if (!current.readonly) current.onNodesChange?.(insertNode(current.nodes, id, option));
    },
    addBranch(id) {
      const current = latest.current;
      if (!current.readonly) current.onNodesChange?.(insertConditionBranch(current.nodes, id));
    },
    remove(id) {
      const current = latest.current;
      if (current.readonly || !canDeleteNode(current.nodes, id)) return;
      const node = current.nodes.find((entry) => entry.id === id);
      modal.confirm({
        title: `删除“${node?.data?.label ?? "节点"}”？`,
        content: "该节点及其内部节点会一并删除，请确认后继续。",
        centered: true,
        okText: "删除",
        cancelText: "取消",
        okButtonProps: { danger: true },
        onOk() {
          const fresh = latest.current;
          if (!fresh.readonly && canDeleteNode(fresh.nodes, id)) {
            fresh.onNodesChange?.(removeNode(fresh.nodes, id));
            setSelectedId("");
          }
        },
      });
    },
  };
  return (
    <WorkflowContext.Provider value={controller}>
      {modalContextHolder}
      <FixedLayoutEditorProvider {...options}>
        <EditorRenderer />
        <div className="workflow-react-designer__tools" role="toolbar" aria-label="画布工具">
          <Tooltip title="缩小">
            <Button
              type="text"
              icon={<ZoomOutOutlined aria-hidden="true" />}
              onClick={() => {
                const config = context.current?.playground.config;
                if (config) config.updateConfig({ zoom: config.zoom / 1.2 });
              }}
              aria-label="缩小"
            />
          </Tooltip>
          <Button
            type="text"
            icon={<FullscreenOutlined aria-hidden="true" />}
            onClick={() => void context.current?.tools.fitView(false)}
          >
            适应画布
          </Button>
          <Tooltip title="放大">
            <Button
              type="text"
              icon={<ZoomInOutlined aria-hidden="true" />}
              onClick={() => {
                const config = context.current?.playground.config;
                if (config) config.updateConfig({ zoom: config.zoom * 1.2 });
              }}
              aria-label="放大"
            />
          </Tooltip>
        </div>
        {props.nodes.length === 0 && (
          <div className="workflow-react-designer__empty">
            暂无流程节点，请传入节点数据或使用 createDefaultNodes() 初始化。
          </div>
        )}
      </FixedLayoutEditorProvider>
    </WorkflowContext.Provider>
  );
}
