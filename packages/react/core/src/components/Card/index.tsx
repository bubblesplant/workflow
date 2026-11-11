import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { CaretRightOutlined, DeleteOutlined, RightOutlined, StopOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

export interface TerminalCardProps {
  label?: string;
  children?: ReactNode;
  className?: string;
}

export function StartCard({ label = "开始", children, className = "" }: TerminalCardProps) {
  return (
    <div className={`workflow-react-terminal workflow-react-terminal--start ${className}`}>
      <CaretRightOutlined aria-hidden="true" />
      {children ?? label}
    </div>
  );
}

export function EndCard({ label = "结束", children, className = "" }: TerminalCardProps) {
  return (
    <div className={`workflow-react-terminal workflow-react-terminal--end ${className}`}>
      <StopOutlined aria-hidden="true" />
      {children ?? label}
    </div>
  );
}

export interface CommonCardProps {
  title?: ReactNode;
  description?: string;
  icon?: ReactNode;
  color?: string;
  selected?: boolean;
  readonly?: boolean;
  deletable?: boolean;
  showArrow?: boolean;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onDelete?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function CommonCard({
  title,
  description = "",
  icon,
  color = "#5075dc",
  selected = false,
  readonly = false,
  deletable = true,
  showArrow = true,
  children,
  onClick,
  onDelete,
  className = "",
}: CommonCardProps) {
  const content = (
    <>
      <span className="workflow-react-card__header">
        {icon && <span aria-hidden="true">{icon}</span>}
        <span className="workflow-react-card__title">{title}</span>
      </span>
      <span className="workflow-react-card__body">
        <span title={description}>{children ?? description}</span>
        {showArrow && !readonly && <RightOutlined aria-hidden="true" />}
      </span>
    </>
  );
  return (
    <div
      className={`workflow-react-card ${selected && !readonly ? "is-selected" : ""} ${readonly ? "is-readonly" : ""} ${className}`}
      style={{ "--workflow-react-card-color": color } as CSSProperties}
    >
      {readonly ? (
        <div className="workflow-react-card__trigger">{content}</div>
      ) : (
        <button
          className="workflow-react-card__trigger"
          type="button"
          aria-pressed={selected}
          onClick={onClick}
        >
          {content}
        </button>
      )}
      {!readonly && deletable && onDelete && (
        <Tooltip title="删除节点">
          <button
            type="button"
            className="workflow-react-card__delete"
            aria-label={`删除${typeof title === "string" ? title : "节点"}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(event);
            }}
          >
            <DeleteOutlined aria-hidden="true" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
