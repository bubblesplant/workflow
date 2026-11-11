import { useState } from "react";
import { AppstoreOutlined, BarsOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Modal, Select } from "antd";
import {
  WorkflowHistory,
  type WorkflowHistoryAttachmentEvent,
} from "@bubblesjs/workflow-react-history";
import { historyRecords } from "../data/history";
import { HistoryComposition } from "./HistoryComposition";

export function HistoryPlayground() {
  const [mode, setMode] = useState<"records" | "composition">("records");
  const [displayState, setDisplayState] = useState<"records" | "loading" | "empty">("records");
  const [preview, setPreview] = useState<{ name: string; recordTitle: string } | null>(null);

  function previewAttachment({ attachment, record, event }: WorkflowHistoryAttachmentEvent) {
    event.preventDefault();
    setPreview({ name: attachment.name, recordTitle: record.title });
  }

  return (
    <main className="history-playground">
      <div className="history-playground__container">
        <header className="history-playground__intro">
          <h1>流程记录</h1>
          <p>查看每个环节的处理人、审批意见与附件。</p>
        </header>
        <nav className="history-playground__modes" aria-label="流程记录示例">
          <Button
            type={mode === "records" ? "primary" : "text"}
            icon={<BarsOutlined aria-hidden="true" />}
            aria-pressed={mode === "records"}
            onClick={() => setMode("records")}
          >
            记录列表
          </Button>
          <Button
            type={mode === "composition" ? "primary" : "text"}
            icon={<AppstoreOutlined aria-hidden="true" />}
            aria-pressed={mode === "composition"}
            onClick={() => setMode("composition")}
          >
            组合示例
          </Button>
        </nav>
        <div hidden={mode !== "composition"}>
          <HistoryComposition />
        </div>
        <div hidden={mode !== "records"}>
          <div className="history-playground__state">
            <span id="history-display-state-label">展示状态</span>
            <Select<typeof displayState>
              aria-labelledby="history-display-state-label"
              value={displayState}
              onChange={setDisplayState}
              options={[
                { value: "records", label: "流程记录" },
                { value: "loading", label: "加载中" },
                { value: "empty", label: "空记录" },
              ]}
            />
          </div>
          <section className="history-playground__instance" aria-label="流程信息">
            <div>
              <h2>办公设备采购申请</h2>
              <p>CG-20261109-001</p>
            </div>
            <span>发起人：王晓雨</span>
            <span>申请部门：产品研发部</span>
          </section>
          <WorkflowHistory
            className="history-playground__records"
            title="审批记录"
            records={displayState === "empty" ? [] : historyRecords}
            loading={displayState === "loading"}
            onAttachmentClick={previewAttachment}
          />
          <Modal
            open={preview !== null}
            title={preview ? `附件预览：${preview.name}` : "附件预览"}
            width={640}
            onCancel={() => setPreview(null)}
            footer={
              <Button icon={<CloseOutlined aria-hidden="true" />} onClick={() => setPreview(null)}>
                关闭预览
              </Button>
            }
          >
            <section className="history-playground__preview">
              <p className="history-playground__preview-source">来自：{preview?.recordTitle}</p>
              <div className="history-playground__document">
                <h3>办公设备采购明细</h3>
                <dl>
                  <div>
                    <dt>申请部门</dt>
                    <dd>产品研发部</dd>
                  </div>
                  <div>
                    <dt>采购用途</dt>
                    <dd>补充项目研发与测试设备</dd>
                  </div>
                  <div>
                    <dt>预算总额</dt>
                    <dd>¥ 18,600.00</dd>
                  </div>
                </dl>
                <p>采购清单及预算已由部门负责人核对，请财务继续审核。</p>
              </div>
            </section>
          </Modal>
          <p className="history-playground__note">
            以上为静态流程记录与模拟附件，可点击记录右侧箭头展开、收起详情。
          </p>
        </div>
      </div>
    </main>
  );
}
