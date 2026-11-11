import { WORKFLOW_NODE_TYPE, type WorkflowNode } from "@bubblesjs/workflow-react-core";
import type { BusinessConfig } from "../data/designer";

export const DRAFT_STORAGE_KEY = "workflow-react-playground-draft";

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** 恢复本地草稿前校验保存格式和父子关系，避免损坏数据进入画布。 */
export function parseWorkflowDraft(raw: string): WorkflowNode<BusinessConfig>[] {
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error("草稿格式不正确，需要节点数组。");
  const types = new Set<string>(Object.values(WORKFLOW_NODE_TYPE));
  const ids = new Map<string, Record<string, unknown>>();
  for (const node of value) {
    if (!isObject(node) || typeof node.id !== "string" || !node.id || ids.has(node.id)) {
      throw new Error("草稿包含无效或重复的节点编号。");
    }
    if (node.parentNode !== undefined && typeof node.parentNode !== "string") {
      throw new Error("草稿包含无效的父节点编号。");
    }
    if (
      !isObject(node.data) ||
      typeof node.data.type !== "string" ||
      !types.has(node.data.type) ||
      typeof node.data.label !== "string"
    ) {
      throw new Error("草稿包含无效的节点类型或名称。");
    }
    if (node.data.config !== undefined && !isObject(node.data.config)) {
      throw new Error("草稿中的业务配置应为 JSON 对象。");
    }
    ids.set(node.id, node);
  }
  for (const node of ids.values()) {
    const visited = new Set<string>();
    let current: Record<string, unknown> | undefined = node;
    while (current && typeof current.parentNode === "string") {
      if (visited.has(current.parentNode)) throw new Error("草稿包含循环的父子关系。");
      visited.add(current.parentNode);
      current = ids.get(current.parentNode);
      if (!current) throw new Error("草稿中的父节点不存在。");
    }
  }
  return value as WorkflowNode<BusinessConfig>[];
}
