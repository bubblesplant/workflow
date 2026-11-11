import type { FlowNodeRegistry } from "@flowgram.ai/fixed-layout-editor";
import { WORKFLOW_NODE_TYPE } from "../../utils/constant";
import { getNodeDimensions } from "../../utils/node-dimensions";

export const nodeRegistries: FlowNodeRegistry[] = Object.values(WORKFLOW_NODE_TYPE).map((type) => ({
  type,
  ...(type === "condition-branch" ? { extend: "dynamicSplit" } : {}),
  ...(type === "condition" ? { extend: "block" } : {}),
  ...(type === "exit-loop" ? { extend: "end" } : {}),
  meta: {
    draggable: false,
    selectable: false,
    deleteDisable: true,
    copyDisable: true,
    addDisable: true,
    expandable: false,
    defaultExpanded: true,
    size: getNodeDimensions(type),
    // 容器本身隐藏，由引擎的 blockIcon / blockOrderIcon 渲染业务卡片。
    ...(type === "condition-branch" || type === "condition" || type === "loop"
      ? { hidden: true }
      : {}),
  },
}));
