import { useNodeRender } from "@flowgram.ai/fixed-layout-editor";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { CommonCard, EndCard, StartCard } from "../Card";
import { canDeleteNode } from "../../utils/delete-node";
import { WORKFLOW_NODE_CONFIG } from "../../utils/node-config";
import { AddNode } from "./AddNode";
import { useWorkflow } from "./context";
import { fromEngineNodeId } from "./document";
import { NodeIcon } from "./NodeIcon";

export function WorkflowNodeRenderer() {
  const rendered = useNodeRender();
  const workflow = useWorkflow();
  const source = workflow.nodes.find((node) => node.id === fromEngineNodeId(rendered.node.id));
  const data = source?.data;
  if (!source || !data) return null;
  const readonly = workflow.readonly;
  const deletable = canDeleteNode(workflow.nodes, source.id);
  if (data.type === "start") return <StartCard />;
  if (data.type === "end") return <EndCard />;
  if (data.type === "add") return <AddNode id={source.id} />;
  if (data.type === "condition-branch") {
    return (
      <div className="workflow-react-branch" onPointerDown={(event) => event.stopPropagation()}>
        {readonly ? (
          <span className="workflow-react-branch__title">
            <NodeIcon type="condition-branch" /> 条件分支
          </span>
        ) : (
          <button
            type="button"
            className="workflow-react-branch__title"
            onClick={() => workflow.select(source.id)}
          >
            <NodeIcon type="condition-branch" /> 条件分支
          </button>
        )}
        {!readonly && (
          <Tooltip title="添加分支">
            <button
              type="button"
              aria-label="添加分支"
              onClick={() => workflow.addBranch(source.id)}
            >
              <PlusOutlined aria-hidden="true" />
            </button>
          </Tooltip>
        )}
        {!readonly && deletable && (
          <Tooltip title="删除条件分支">
            <button
              type="button"
              aria-label="删除条件分支"
              onClick={() => workflow.remove(source.id)}
            >
              <DeleteOutlined aria-hidden="true" />
            </button>
          </Tooltip>
        )}
      </div>
    );
  }
  const config = WORKFLOW_NODE_CONFIG[data.type];
  const title = data.isDefaultCondition
    ? "其他"
    : data.type === "condition" && data.conditionIndex
      ? `条件规则${data.conditionIndex}`
      : data.label || config.label;
  const description =
    data.description ??
    (data.isDefaultCondition ? "未满足其他条件时进入此分支" : `请设置${config.label}`);
  return (
    <div onPointerDown={(event) => event.stopPropagation()}>
      <CommonCard
        title={title}
        description={description}
        color={config.color}
        icon={<NodeIcon type={data.type} />}
        readonly={readonly}
        selected={workflow.selectedId === source.id}
        deletable={deletable}
        showArrow={!data.isDefaultCondition}
        onClick={() => workflow.select(source.id)}
        onDelete={() => workflow.remove(source.id)}
      />
    </div>
  );
}
