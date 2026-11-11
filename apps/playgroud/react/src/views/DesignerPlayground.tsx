import { useState } from "react";
import {
  ExperimentOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  RollbackOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Alert, App as AntdApp, Button, Form, Input, Modal, Switch } from "antd";
import {
  Designer,
  createDefaultNodes,
  type WorkflowNode,
  type WorkflowNodeClickEvent,
} from "@bubblesjs/workflow-react-core";
import { createDesignerNodes, type BusinessConfig } from "../data/designer";
import { DRAFT_STORAGE_KEY, parseWorkflowDraft } from "../utils/draft";

export function DesignerPlayground() {
  const { message } = AntdApp.useApp();
  const [modal, modalContextHolder] = Modal.useModal();
  const [nodes, setNodes] = useState(createDesignerNodes);
  const [canvasVersion, setCanvasVersion] = useState(0);
  const [readonly, setReadonly] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftConfig, setDraftConfig] = useState("{}");
  const [configError, setConfigError] = useState("");
  const [draftFeedback, setDraftFeedback] = useState<{
    type: "info" | "success" | "warning" | "error";
    text: string;
  }>({
    type: "info",
    text: "当前展示采购审批示例。点击节点查看配置，或新建空流程从头设计。",
  });
  const selectedNode = nodes.find((node) => node.id === selectedId);

  function showFeedback(text: string, type: "info" | "success" | "warning" | "error" = "success") {
    setDraftFeedback({ text, type });
    void message[type](text);
  }

  function updateNodes(next: WorkflowNode<BusinessConfig>[]) {
    if (readonly) return;
    setNodes(next);
    if (!next.some((node) => node.id === selectedId)) setSelectedId("");
  }

  function selectNode({ id }: WorkflowNodeClickEvent) {
    if (readonly) return;
    const node = nodes.find((entry) => entry.id === id);
    if (!node?.data) return;
    setSelectedId(id);
    setDraftLabel(node.data.label);
    setDraftDescription(node.data.description ?? "");
    setDraftConfig(JSON.stringify(node.data.config ?? {}, null, 2));
    setConfigError("");
  }

  function saveNodeConfig() {
    if (readonly || !selectedNode?.data) return;
    let config: unknown;
    try {
      config = JSON.parse(draftConfig);
    } catch {
      setConfigError("请输入有效的 JSON 对象。");
      return;
    }
    if (config === null || typeof config !== "object" || Array.isArray(config)) {
      setConfigError("业务配置应为 JSON 对象。");
      return;
    }
    const label = draftLabel.trim();
    if (!label) {
      setConfigError("请输入节点名称。");
      return;
    }
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedId && node.data
          ? {
              ...node,
              data: {
                ...node.data,
                label,
                description: draftDescription,
                config: config as BusinessConfig,
              },
            }
          : node,
      ),
    );
    setConfigError("");
    showFeedback("节点配置已保存，预览已同步。");
  }

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nodes));
      showFeedback("草稿已保存到此浏览器。");
    } catch {
      showFeedback("草稿保存失败，浏览器存储不可用或空间不足。", "error");
    }
  }

  function restoreDraft() {
    if (readonly) return;
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        showFeedback("此浏览器还没有保存草稿。", "warning");
        return;
      }
      const restored = parseWorkflowDraft(raw);
      setNodes(restored);
      setCanvasVersion((current) => current + 1);
      setSelectedId("");
      setConfigError("");
      showFeedback("草稿已恢复。");
    } catch (error) {
      showFeedback(
        error instanceof Error
          ? `无法恢复草稿：${error.message}`
          : "无法恢复草稿，浏览器存储不可用。",
        "error",
      );
    }
  }

  function replaceWorkflow(mode: "example" | "empty") {
    if (readonly) return;
    const action = mode === "example" ? "加载审批示例" : "新建空流程";
    modal.confirm({
      title: `${action}并替换当前流程？`,
      icon: <ExclamationCircleOutlined aria-hidden="true" />,
      content: "当前未保存的修改会被替换，已保存的浏览器草稿仍可恢复。",
      okText: "确认替换",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk() {
        setNodes(mode === "example" ? createDesignerNodes() : createDefaultNodes<BusinessConfig>());
        setCanvasVersion((current) => current + 1);
        setSelectedId("");
        setConfigError("");
        showFeedback(
          mode === "example" ? "已加载采购审批示例。" : "已新建空流程，点击橙色加号添加节点。",
        );
      },
    });
  }

  return (
    <main className="designer-playground">
      {modalContextHolder}
      <div className="workflow-views">
        <section className="workflow-panel" aria-label="流程编辑">
          <header className="workflow-panel__header">
            <h2>流程编辑</h2>
            <p>{readonly ? "已开启只读模式" : "添加节点或点击卡片编辑配置"}</p>
          </header>
          <div className="workflow-panel__canvas">
            <Designer
              key={canvasVersion}
              id="react-workflow-designer"
              nodes={nodes}
              onNodesChange={updateNodes}
              readonly={readonly}
              onNodeClick={selectNode}
            />
          </div>
        </section>
        <section className="workflow-panel" aria-label="只读预览">
          <header className="workflow-panel__header">
            <h2>只读预览</h2>
            <p>实时同步流程结构与节点配置</p>
          </header>
          <div className="workflow-panel__canvas">
            <Designer key={canvasVersion} id="react-workflow-preview" nodes={nodes} readonly />
          </div>
        </section>
      </div>
      <aside className="configuration" aria-label="节点业务配置">
        <h1>节点业务配置</h1>
        <label className="readonly-toggle">
          <Switch checked={readonly} onChange={setReadonly} aria-label="只读模式" />
          只读模式
        </label>
        <div className="scenario-actions" role="group" aria-label="切换演示流程">
          <Button
            size="small"
            icon={<ExperimentOutlined aria-hidden="true" />}
            disabled={readonly}
            onClick={() => replaceWorkflow("example")}
          >
            加载审批示例
          </Button>
          <Button
            size="small"
            icon={<PlusOutlined aria-hidden="true" />}
            disabled={readonly}
            onClick={() => replaceWorkflow("empty")}
          >
            新建空流程
          </Button>
        </div>
        <div className="draft-actions">
          <Button size="small" icon={<SaveOutlined aria-hidden="true" />} onClick={saveDraft}>
            保存草稿
          </Button>
          <Button
            size="small"
            icon={<RollbackOutlined aria-hidden="true" />}
            disabled={readonly}
            onClick={restoreDraft}
          >
            恢复草稿
          </Button>
        </div>
        <Alert
          className="configuration__feedback"
          type={draftFeedback.type}
          title={draftFeedback.text}
          showIcon
          role="status"
          aria-live="polite"
        />
        {selectedNode && !readonly ? (
          <Form layout="vertical" onFinish={saveNodeConfig}>
            <p className="configuration__node-id">
              {selectedNode.id} · {selectedNode.data?.type}
            </p>
            <Form.Item label="节点名称" htmlFor="workflow-node-label" required>
              <Input
                id="workflow-node-label"
                value={draftLabel}
                required
                onChange={(event) => setDraftLabel(event.target.value)}
              />
            </Form.Item>
            <Form.Item label="节点说明" htmlFor="workflow-node-description">
              <Input
                id="workflow-node-description"
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
              />
            </Form.Item>
            <Form.Item label="业务配置（JSON）" htmlFor="workflow-node-config">
              <Input.TextArea
                id="workflow-node-config"
                value={draftConfig}
                rows={10}
                spellCheck={false}
                onChange={(event) => setDraftConfig(event.target.value)}
              />
            </Form.Item>
            {configError && <Alert type="error" title={configError} showIcon role="alert" />}
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined aria-hidden="true" />}
              block
            >
              保存节点配置
            </Button>
          </Form>
        ) : (
          <p>{readonly ? "当前仅可查看流程。" : "添加并点击业务节点，在这里编辑配置。"}</p>
        )}
        <details>
          <summary>查看 nodes 数据（{nodes.length} 个节点）</summary>
          <pre>{JSON.stringify(nodes, null, 2)}</pre>
        </details>
      </aside>
    </main>
  );
}
