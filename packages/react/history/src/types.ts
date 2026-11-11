import type { CSSProperties, MouseEvent, ReactNode } from "react";

/** 由业务方将自己的操作码映射为展示状态。 */
export type WorkflowStatus = "success" | "processing" | "pending" | "reject" | "info";
export type WorkflowHistoryStatus = WorkflowStatus;

export interface WorkflowComponentProps {
  className?: string;
  style?: CSSProperties;
}

export interface WorkflowAvatarProps extends WorkflowComponentProps {
  text: string;
  src?: string;
  children?: ReactNode;
}

export interface WorkflowTimelineDotProps extends WorkflowComponentProps {
  type?: WorkflowStatus;
  children?: ReactNode;
}

export interface WorkflowTimelineTagProps extends WorkflowTimelineDotProps {
  text?: string;
}

export interface WorkflowTimelineProps extends WorkflowComponentProps {
  label?: string;
  children?: ReactNode;
}

export interface WorkflowTimelineItemSlotProps {
  expanded: boolean;
  toggle: () => void;
}

export type WorkflowTimelineItemRender = (scope: WorkflowTimelineItemSlotProps) => ReactNode;

export interface WorkflowTimelineItemProps extends WorkflowComponentProps {
  /** 默认标题及折叠按钮的可访问名称。复杂标题使用 renderTitle。 */
  title?: string;
  type?: WorkflowStatus;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  /** 传入后为受控模式，等待父组件回写。 */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onToggle?: (expanded: boolean) => void;
  renderTitle?: WorkflowTimelineItemRender;
  renderStatus?: WorkflowTimelineItemRender;
  renderDot?: WorkflowTimelineItemRender;
  children?: ReactNode | WorkflowTimelineItemRender;
}

export interface WorkflowHistoryUser {
  name: string;
  avatar?: string;
  description?: string;
}

export interface WorkflowHistoryAttachment {
  id: string;
  name: string;
  /** 省略时由 onAttachmentClick 或 renderAttachment 接入业务预览。 */
  url?: string;
  size?: string;
}

export interface WorkflowHistoryField {
  label: string;
  value: string | number | boolean | null | undefined;
}

export interface WorkflowHistoryRecord {
  /** 同一组件内唯一且稳定，用于记录展开状态。 */
  id: string;
  title: string;
  status?: WorkflowHistoryStatus;
  statusText?: string;
  operator?: WorkflowHistoryUser;
  /** 原样展示，由使用方统一时区与格式。 */
  time?: string;
  datetime?: string;
  opinion?: string;
  opinionLabel?: string;
  attachments?: readonly WorkflowHistoryAttachment[];
  attachmentsLabel?: string;
  fields?: readonly WorkflowHistoryField[];
}

export interface WorkflowHistoryToggleEvent {
  record: WorkflowHistoryRecord;
  expanded: boolean;
}

export interface WorkflowHistoryAttachmentEvent {
  record: WorkflowHistoryRecord;
  attachment: WorkflowHistoryAttachment;
  /** 可 preventDefault() 接管链接默认打开行为。 */
  event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>;
}

export interface WorkflowHistoryRenderers {
  renderTitle?: (scope: { record: WorkflowHistoryRecord }) => ReactNode;
  renderStatus?: (scope: {
    record: WorkflowHistoryRecord;
    status: WorkflowHistoryStatus;
  }) => ReactNode;
  renderContent?: (scope: { record: WorkflowHistoryRecord }) => ReactNode;
  renderOperator?: (scope: {
    record: WorkflowHistoryRecord;
    operator: WorkflowHistoryUser;
  }) => ReactNode;
  renderOpinion?: (scope: { record: WorkflowHistoryRecord }) => ReactNode;
  renderAttachment?: (scope: {
    record: WorkflowHistoryRecord;
    attachment: WorkflowHistoryAttachment;
  }) => ReactNode;
}

export interface WorkflowHistoryProps extends WorkflowComponentProps, WorkflowHistoryRenderers {
  records?: readonly WorkflowHistoryRecord[];
  title?: string;
  loading?: boolean;
  emptyText?: string;
  collapsible?: boolean;
  /** 非受控模式下，新记录是否默认展开。 */
  defaultExpanded?: boolean;
  /** 传入后为受控模式，通过 onExpandedKeysChange 回写。 */
  expandedKeys?: readonly string[];
  onExpandedKeysChange?: (keys: string[]) => void;
  onToggle?: (event: WorkflowHistoryToggleEvent) => void;
  onAttachmentClick?: (event: WorkflowHistoryAttachmentEvent) => void;
  renderHeader?: (scope: { title: string; records: readonly WorkflowHistoryRecord[] }) => ReactNode;
  loadingContent?: ReactNode;
  emptyContent?: ReactNode;
  children?: ReactNode;
}
