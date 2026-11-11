import { useId, useState } from "react";
import type { WorkflowTimelineItemProps } from "../types";
import { getRecordStatus } from "../utils";
import { WorkflowTimelineDot } from "./WorkflowTimelineDot";
import { WorkflowTimelineTag } from "./WorkflowTimelineTag";

export function WorkflowTimelineItem({
  title,
  type,
  collapsible = true,
  defaultExpanded = true,
  expanded,
  onExpandedChange,
  onToggle,
  renderTitle,
  renderStatus,
  renderDot,
  children,
  className = "",
  style,
}: WorkflowTimelineItemProps) {
  const contentId = useId();
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  const status = getRecordStatus(type);
  const isExpanded = !collapsible || (expanded ?? localExpanded);
  function toggle() {
    if (!collapsible) return;
    const next = !isExpanded;
    if (expanded === undefined) setLocalExpanded(next);
    onExpandedChange?.(next);
    onToggle?.(next);
  }
  const scope = { expanded: isExpanded, toggle };
  return (
    <li
      className={`workflow-react-history__item workflow-react-timeline-item workflow-react-history__item--${status.type} ${className}`}
      style={style}
    >
      {renderDot ? renderDot(scope) : <WorkflowTimelineDot type={status.type} />}
      <div className="workflow-react-history__summary">
        <div className="workflow-react-timeline-item__title">
          {renderTitle ? (
            renderTitle(scope)
          ) : (
            <span className="workflow-react-history__record-title">{title}</span>
          )}
        </div>
        <span className="workflow-react-history__summary-end">
          {renderStatus ? renderStatus(scope) : <WorkflowTimelineTag type={status.type} />}
          {collapsible && (
            <button
              className="workflow-react-history__toggle"
              type="button"
              aria-label={`${isExpanded ? "收起" : "展开"}${title || "流程节点"}`}
              aria-expanded={isExpanded}
              aria-controls={contentId}
              onClick={toggle}
            >
              <svg
                className={`workflow-react-history__chevron${isExpanded ? " workflow-react-history__chevron--expanded" : ""}`}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          )}
        </span>
      </div>
      <div id={contentId} className="workflow-react-history__details" hidden={!isExpanded}>
        {typeof children === "function" ? children(scope) : children}
      </div>
    </li>
  );
}
