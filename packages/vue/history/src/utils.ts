import type { WorkflowStatus } from "./types";

const statuses = {
  success: { text: "已通过", icon: "✓" },
  processing: { text: "处理中", icon: "" },
  pending: { text: "待处理", icon: "" },
  reject: { text: "已拒绝", icon: "×" },
  info: { text: "通知", icon: "" },
} satisfies Record<WorkflowStatus, { text: string; icon: string }>;

export function getRecordStatus(status?: WorkflowStatus) {
  const type = status && Object.hasOwn(statuses, status) ? status : "pending";
  return { type, ...statuses[type] };
}

export function formatFieldValue(value: string | number | boolean | null | undefined) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

/** 链接只用于打开附件；自定义协议请交给业务预览事件。 */
export function getAttachmentUrl(url?: string) {
  if (!url?.trim()) return undefined;
  try {
    const parsed = new URL(url, "https://workflow.local/");
    return ["http:", "https:", "blob:"].includes(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}
