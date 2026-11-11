import type { WorkflowTimelineProps } from "../types";

export function WorkflowTimeline({
  label = "流程流转记录",
  children,
  className = "",
  style,
}: WorkflowTimelineProps) {
  return (
    <ol
      className={`workflow-react-history__list workflow-react-timeline ${className}`}
      style={style}
      aria-label={label}
    >
      {children}
    </ol>
  );
}
