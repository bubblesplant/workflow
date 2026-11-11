import {
  ApartmentOutlined,
  AuditOutlined,
  BranchesOutlined,
  EditOutlined,
  LogoutOutlined,
  SendOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import type { WorkflowNodeType } from "../../types";

const icons = {
  common: AuditOutlined,
  approval: AuditOutlined,
  fill: EditOutlined,
  copy: SendOutlined,
  "condition-branch": BranchesOutlined,
  condition: ApartmentOutlined,
  loop: SyncOutlined,
  "exit-loop": LogoutOutlined,
} as const;

export function NodeIcon({ type }: { type: WorkflowNodeType }) {
  if (!(type in icons)) return null;
  const Icon = icons[type as keyof typeof icons];
  return <Icon aria-hidden="true" />;
}
