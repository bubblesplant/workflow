import { useState } from "react";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Switch } from "antd";
import {
  WorkflowAvatar,
  WorkflowTimeline,
  WorkflowTimelineDot,
  WorkflowTimelineItem,
  WorkflowTimelineTag,
} from "@bubblesjs/workflow-react-history";
import { supplierQuotes } from "../data/history";

function Person({
  name,
  title,
  description,
}: {
  name: string;
  title: string;
  description: string;
}) {
  return (
    <div className="history-composition__person">
      <WorkflowAvatar text={name} />
      <div>
        <strong>{title}</strong>
        <p>
          {name}
          <span>{description}</span>
        </p>
      </div>
    </div>
  );
}

export function HistoryComposition() {
  const [financeExpanded, setFinanceExpanded] = useState(true);
  const [showQuotes, setShowQuotes] = useState(false);
  return (
    <section className="history-composition" aria-label="流程记录组合示例">
      <header className="history-composition__header">
        <div>
          <h2>采购申请流转记录</h2>
          <p>CG-20261109-001</p>
        </div>
        <div className="history-composition__control">
          <Switch
            id="history-finance-expanded"
            size="small"
            checked={financeExpanded}
            onChange={setFinanceExpanded}
          />
          <label htmlFor="history-finance-expanded">展开财务详情</label>
        </div>
      </header>
      <WorkflowTimeline label="采购申请流转记录">
        <WorkflowTimelineItem
          type="info"
          title="发起申请"
          collapsible={false}
          renderTitle={() => (
            <Person name="王晓雨" title="发起申请" description="2026-11-09 09:12" />
          )}
          renderStatus={() => <WorkflowTimelineTag type="info" text="已提交" />}
        >
          <p className="history-composition__opinion">
            申请补充项目研发与测试设备，采购预算共 ¥ 18,600.00。
          </p>
        </WorkflowTimelineItem>
        <WorkflowTimelineItem
          type="success"
          title="部门负责人审批"
          renderTitle={() => (
            <Person name="张敏" title="部门负责人审批" description="2026-11-09 09:38" />
          )}
          renderStatus={() => <WorkflowTimelineTag type="success">已通过</WorkflowTimelineTag>}
        >
          {({ toggle }) => (
            <div className="history-composition__approval">
              <p>同意，符合本季度采购计划。请财务核对预算后安排采购。</p>
              <Button
                type="link"
                size="small"
                icon={<UpOutlined aria-hidden="true" />}
                className="history-composition__collapse"
                onClick={toggle}
              >
                收起审批意见
              </Button>
            </div>
          )}
        </WorkflowTimelineItem>
        <WorkflowTimelineItem
          type="processing"
          title="财务审核"
          expanded={financeExpanded}
          onExpandedChange={setFinanceExpanded}
          renderTitle={() => <Person name="李明" title="财务审核" description="财务经理" />}
          renderDot={() => <WorkflowTimelineDot type="processing" />}
          renderStatus={() => <WorkflowTimelineTag type="processing" text="待预算确认" />}
        >
          <div className="history-composition__budget">
            <dl>
              <div>
                <dt>申请金额</dt>
                <dd>¥ 18,600.00</dd>
              </div>
              <div>
                <dt>本季度余额</dt>
                <dd>¥ 42,000.00</dd>
              </div>
              <div>
                <dt>供应商报价</dt>
                <dd>已提供 2 份</dd>
              </div>
            </dl>
            <Button
              type="link"
              size="small"
              className="history-composition__quotes-toggle"
              icon={
                showQuotes ? <UpOutlined aria-hidden="true" /> : <DownOutlined aria-hidden="true" />
              }
              aria-expanded={showQuotes}
              onClick={() => setShowQuotes((value) => !value)}
            >
              {showQuotes ? "收起供应商报价" : "查看供应商报价"}
            </Button>
            {showQuotes && (
              <ul className="history-composition__quotes">
                {supplierQuotes.map((quote) => (
                  <li key={quote.name}>
                    <span>{quote.name}</span>
                    <strong>{quote.amount}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </WorkflowTimelineItem>
        <WorkflowTimelineItem
          type="pending"
          title="通知采购负责人"
          defaultExpanded={false}
          renderTitle={() => <Person name="陈倩" title="通知采购负责人" description="行政采购" />}
          renderStatus={() => <WorkflowTimelineTag type="pending" text="待流转" />}
        >
          <p className="history-composition__opinion">
            财务确认后，将通知采购负责人跟进供应商与交付安排。
          </p>
        </WorkflowTimelineItem>
      </WorkflowTimeline>
      <p className="history-composition__note">
        以上为模拟采购流程，可展开详情、查看报价并收起审批意见。
      </p>
    </section>
  );
}
