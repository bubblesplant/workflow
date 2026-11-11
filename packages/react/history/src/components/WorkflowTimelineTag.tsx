import type { WorkflowTimelineTagProps } from "../types";
import { getRecordStatus } from "../utils";

export function WorkflowTimelineTag({
  type,
  text,
  children,
  className = "",
  style,
}: WorkflowTimelineTagProps) {
  const status = getRecordStatus(type);
  return (
    <span
      className={`workflow-react-history__status workflow-react-timeline-tag workflow-react-history__status--${status.type} ${className}`}
      style={style}
    >
      {children ?? (text || status.text)}
    </span>
  );
}
