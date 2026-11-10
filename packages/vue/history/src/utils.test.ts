import { describe, expect, it } from "vite-plus/test";
import type { WorkflowHistoryStatus } from "./types";
import { formatFieldValue, getAttachmentUrl, getRecordStatus } from "./utils";

describe("流程记录展示边界", () => {
  it("保留数字零与布尔 false，仅对空值显示占位符", () => {
    expect(formatFieldValue(0)).toBe("0");
    expect(formatFieldValue(false)).toBe("false");
    for (const value of [null, undefined, ""]) expect(formatFieldValue(value)).toBe("—");
  });

  it("缺失或运行时未知状态回退为待处理", () => {
    expect(getRecordStatus()).toMatchObject({ type: "pending", text: "待处理" });
    expect(getRecordStatus("unknown" as WorkflowHistoryStatus).type).toBe("pending");
    expect(getRecordStatus("toString" as WorkflowHistoryStatus).type).toBe("pending");
    expect(getRecordStatus("reject")).toMatchObject({ type: "reject", text: "已拒绝" });
  });

  it("允许文件地址与浏览器 blob，拒绝可执行或无效链接", () => {
    for (const value of ["/files/1", "https://example.com/a.pdf", "blob:https://example.com/1"]) {
      expect(getAttachmentUrl(value)).toBe(value);
    }
    for (const value of [
      undefined,
      "",
      " ",
      "javascript:alert(1)",
      "data:text/html,hi",
      "https://[",
    ]) {
      expect(getAttachmentUrl(value)).toBeUndefined();
    }
  });
});
