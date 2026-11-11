import { useState } from "react";
import type { WorkflowHistoryProps, WorkflowHistoryRecord } from "../types";
import { getRecordStatus, resolveRecordExpanded } from "../utils";
import { WorkflowAvatar } from "./WorkflowAvatar";
import { WorkflowHistoryDetails } from "./WorkflowHistoryDetails";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { WorkflowTimelineItem } from "./WorkflowTimelineItem";
import { WorkflowTimelineTag } from "./WorkflowTimelineTag";

export function WorkflowHistory({
  records = [],
  title = "流程记录",
  loading = false,
  emptyText = "暂无流程记录",
  collapsible = true,
  defaultExpanded = true,
  expandedKeys,
  onExpandedKeysChange,
  onToggle,
  onAttachmentClick,
  renderHeader,
  renderTitle,
  renderStatus,
  renderContent,
  renderOperator,
  renderOpinion,
  renderAttachment,
  loadingContent,
  emptyContent,
  children,
  className = "",
  style,
}: WorkflowHistoryProps) {
  const [expansion, setExpansion] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  const isExpanded = (record: WorkflowHistoryRecord) =>
    resolveRecordExpanded(record.id, collapsible, expandedKeys, expansion, defaultExpanded);
  const allExpanded = records.every(isExpanded);
  function setExpanded(keys: string[]) {
    const selected = new Set(keys);
    setExpansion(new Map(records.map((record) => [record.id, selected.has(record.id)])));
    onExpandedKeysChange?.(keys);
  }
  function setRecordExpanded(record: WorkflowHistoryRecord, expanded: boolean) {
    if (!collapsible) return;
    setExpanded(
      records
        .filter((item) => (item.id === record.id ? expanded : isExpanded(item)))
        .map((item) => item.id),
    );
    onToggle?.({ record, expanded });
  }
  return (
    <div className={`workflow-react-history ${className}`} style={style} aria-busy={loading}>
      {(title || renderHeader) && (
        <header className="workflow-react-history__header">
          {renderHeader ? (
            renderHeader({ title, records })
          ) : (
            <h2 className="workflow-react-history__heading">{title}</h2>
          )}
          {collapsible && !loading && !!records.length && (
            <button
              className="workflow-react-history__toggle-all"
              type="button"
              onClick={() => setExpanded(allExpanded ? [] : records.map((record) => record.id))}
            >
              {allExpanded ? "全部收起" : "全部展开"}
            </button>
          )}
        </header>
      )}
      {loading ? (
        <div className="workflow-react-history__placeholder" role="status" aria-live="polite">
          {loadingContent ?? "正在加载流程记录…"}
        </div>
      ) : !records.length ? (
        <div className="workflow-react-history__placeholder" role="status">
          {emptyContent ?? emptyText}
        </div>
      ) : (
        <WorkflowTimeline>
          {records.map((record) => (
            <WorkflowTimelineItem
              key={record.id}
              title={record.title}
              type={getRecordStatus(record.status).type}
              collapsible={collapsible}
              expanded={isExpanded(record)}
              onExpandedChange={(expanded) => setRecordExpanded(record, expanded)}
              renderTitle={() => (
                <span className="workflow-react-history__identity">
                  {record.operator && (
                    <WorkflowAvatar text={record.operator.name} src={record.operator.avatar} />
                  )}
                  <span className="workflow-react-history__summary-main">
                    <span className="workflow-react-history__record-title">
                      {renderTitle ? renderTitle({ record }) : record.title}
                    </span>
                    {(record.operator || record.time) && (
                      <span className="workflow-react-history__meta">
                        {record.operator && <span>{record.operator.name}</span>}
                        {record.time && <time dateTime={record.datetime}>{record.time}</time>}
                      </span>
                    )}
                  </span>
                </span>
              )}
              renderStatus={() =>
                renderStatus ? (
                  renderStatus({ record, status: getRecordStatus(record.status).type })
                ) : (
                  <WorkflowTimelineTag type={record.status} text={record.statusText} />
                )
              }
            >
              {renderContent ? (
                renderContent({ record })
              ) : (
                <WorkflowHistoryDetails
                  record={record}
                  renderOperator={renderOperator}
                  renderOpinion={renderOpinion}
                  renderAttachment={renderAttachment}
                  onAttachmentClick={onAttachmentClick}
                />
              )}
            </WorkflowTimelineItem>
          ))}
        </WorkflowTimeline>
      )}
      {children}
    </div>
  );
}
