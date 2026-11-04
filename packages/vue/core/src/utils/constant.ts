export const WORKFLOW_NODE_TYPE = {
  START: "start",
  ADD: "add",
  COMMON: "common",
  END: "end",
  APPROVAL: "approval",
  CONDITION: "condition",
  FILL: "fill",
  COPY: "copy",
  CONDITION_BRANCH: "condition-branch",
  LOOP: "loop",
  EXIT_LOOP: "exit-loop",
} as const satisfies Record<string, string>;

export const WORKFLOW_EDGE_TYPE = {
  LOOP: "loop",
} as const satisfies Record<string, string>;

export const WORKFLOW_NODE_SLOT = "workflow";
