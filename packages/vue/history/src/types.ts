/** 通用时间轴展示状态，由业务方映射实际操作码。 */
export type WorkflowStatus = "success" | "processing" | "pending" | "reject" | "info";

/** 流程记录沿用通用时间轴状态。 */
export type WorkflowHistoryStatus = WorkflowStatus;

export interface WorkflowAvatarProps {
  text: string;
  src?: string;
}

export interface WorkflowTimelineDotProps {
  type?: WorkflowStatus;
}

export interface WorkflowTimelineTagProps {
  type?: WorkflowStatus;
  text?: string;
}

export interface WorkflowTimelineProps {
  label?: string;
}

export interface WorkflowTimelineItemProps {
  /** 默认标题及折叠按钮的可访问名称；复杂标题使用 title 插槽。 */
  title?: string;
  type?: WorkflowStatus;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  /** 传入后成为受控组件，支持 v-model:expanded。 */
  expanded?: boolean;
}

export interface WorkflowTimelineItemSlotProps {
  expanded: boolean;
  toggle: () => void;
}

export interface WorkflowHistoryUser {
  name: string;
  /** 头像地址；省略时使用姓名最后两个字。 */
  avatar?: string;
  description?: string;
}

export interface WorkflowHistoryAttachment {
  id: string;
  name: string;
  /** 可省略，由 attachment-click 或 attachment 插槽接入业务文件预览。 */
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
  /** 自定义状态文案，例如“已提交”“已转交”。 */
  statusText?: string;
  operator?: WorkflowHistoryUser;
  /** 原样展示，由使用方统一时区与格式。 */
  time?: string;
  /** 可选的机器可读 ISO 时间，写入 time 元素的 datetime。 */
  datetime?: string;
  opinion?: string;
  opinionLabel?: string;
  attachments?: readonly WorkflowHistoryAttachment[];
  attachmentsLabel?: string;
  fields?: readonly WorkflowHistoryField[];
}

export interface WorkflowHistoryProps {
  records?: readonly WorkflowHistoryRecord[];
  title?: string;
  loading?: boolean;
  emptyText?: string;
  collapsible?: boolean;
  /** 非受控模式下，新记录是否默认展开。 */
  defaultExpanded?: boolean;
  /** 传入后成为受控组件，可使用 v-model:expanded-keys。 */
  expandedKeys?: readonly string[];
}

export interface WorkflowHistoryToggleEvent {
  record: WorkflowHistoryRecord;
  expanded: boolean;
}

export interface WorkflowHistoryAttachmentEvent {
  record: WorkflowHistoryRecord;
  attachment: WorkflowHistoryAttachment;
  /** 可以 preventDefault() 接管链接的默认打开行为。 */
  event: MouseEvent;
}
