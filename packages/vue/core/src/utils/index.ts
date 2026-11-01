export const WORKFLOW_NODE_TYPE = {
  START: "start",
  ADD: "add",
  COMMON: "common",
} as const satisfies Record<string, string>;

export const WORKFLOW_NODE_SLOT = "workflow";
