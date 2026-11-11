import type { FlowDocumentJSON, FlowNodeJSON } from "@flowgram.ai/fixed-layout-editor";
import type { WorkflowNode } from "../../types";
import { layoutWorkflow } from "../../utils/auto-layout-node-position";
import { WORKFLOW_NODE_TYPE } from "../../utils/constant";

const ENGINE_NODE_PREFIX = "workflow:";

/** 将业务 ID 放入独立命名空间，避免与 FlowGram root 及容器辅助节点冲突。 */
export function toEngineNodeId(id: string): string {
  return `${ENGINE_NODE_PREFIX}${encodeURIComponent(id)}`;
}

/** SDK 辅助 ID 或格式不合法的外部 ID 原样返回，避免渲染时抛出解码错误。 */
export function fromEngineNodeId(id: string): string {
  if (!id.startsWith(ENGINE_NODE_PREFIX)) return id;
  try {
    return decodeURIComponent(id.slice(ENGINE_NODE_PREFIX.length));
  } catch {
    return id;
  }
}

/** 源数据始终是 Vue/React 通用的平铺数组，树结构仅提供给画布引擎。 */
export function toFlowGramDocument<TConfig>(
  nodes: readonly WorkflowNode<TConfig>[],
  readonly = false,
): FlowDocumentJSON {
  // 统一验证重复 ID、缺失父节点、父子引用环，并取得稳定的条件顺序。
  const validated = layoutWorkflow(nodes).nodes;
  const entries = new Map(validated.map((node) => [node.id, node]));
  const children = new Map<string | undefined, WorkflowNode<TConfig>[]>();
  for (const node of validated) {
    const siblings = children.get(node.parentNode) ?? [];
    siblings.push(node);
    children.set(node.parentNode, siblings);
  }
  const convert = (parent?: string): FlowNodeJSON[] => {
    let siblings = children.get(parent) ?? [];
    if (
      parent !== undefined &&
      entries.get(parent)?.data?.type === WORKFLOW_NODE_TYPE.CONDITION_BRANCH
    ) {
      siblings = [...siblings].sort(
        (a, b) =>
          Number(Boolean(a.data?.isDefaultCondition)) -
            Number(Boolean(b.data?.isDefaultCondition)) ||
          (a.data?.conditionIndex ?? Number.MAX_SAFE_INTEGER) -
            (b.data?.conditionIndex ?? Number.MAX_SAFE_INTEGER),
      );
    }
    return siblings
      .filter((node) => !readonly || node.data?.type !== WORKFLOW_NODE_TYPE.ADD)
      .map((node) => ({
        id: toEngineNodeId(node.id),
        type: node.data?.type ?? WORKFLOW_NODE_TYPE.COMMON,
        // 画布拥有自己的业务数据副本，避免 SDK 的 extInfo 更新修改受控输入。
        data: structuredClone(node.data ?? {}),
        blocks: convert(node.id),
      }));
  };
  return { nodes: convert() };
}
