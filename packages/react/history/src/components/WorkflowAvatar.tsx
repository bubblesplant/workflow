import type { WorkflowAvatarProps } from "../types";

export function WorkflowAvatar({
  text,
  src,
  children,
  className = "",
  style,
}: WorkflowAvatarProps) {
  return (
    <span
      className={`workflow-react-history__avatar workflow-react-avatar ${className}`}
      style={style}
    >
      {src ? <img src={src} alt="" /> : (children ?? (Array.from(text).slice(-2).join("") || "—"))}
    </span>
  );
}
