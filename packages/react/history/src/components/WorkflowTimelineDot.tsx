import type { WorkflowTimelineDotProps } from "../types";
import { getRecordStatus } from "../utils";

export function WorkflowTimelineDot({
  type,
  children,
  className = "",
  style,
}: WorkflowTimelineDotProps) {
  const status = getRecordStatus(type);
  return (
    <span
      className={`workflow-react-history__dot workflow-react-timeline-dot workflow-react-history__dot--${status.type} ${className}`}
      style={style}
      aria-hidden="true"
    >
      {children ?? status.icon}
    </span>
  );
}
