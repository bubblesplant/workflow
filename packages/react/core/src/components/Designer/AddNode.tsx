import { useEffect, useRef, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import { isInsideLoop } from "../../utils/add-node";
import { WORKFLOW_NODE_GROUPS } from "../../utils/node-config";
import { useWorkflow } from "./context";
import { NodeIcon } from "./NodeIcon";

export function AddNode({ id }: { id: string }) {
  const workflow = useWorkflow();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (workflow.readonly) setOpen(false);
  }, [workflow.readonly]);
  if (workflow.readonly) return null;
  return (
    <div
      className="workflow-react-add"
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <Popover
        trigger="click"
        placement="bottom"
        destroyOnHidden
        open={open}
        onOpenChange={setOpen}
        content={
          <div className="workflow-react-add__menu" role="group" aria-label="选择节点类型">
            {WORKFLOW_NODE_GROUPS.map((group) => (
              <div key={group.label}>
                <p>{group.label}</p>
                <div className="workflow-react-add__options">
                  {group.options
                    .filter(
                      (option) => option.type !== "exit-loop" || isInsideLoop(workflow.nodes, id),
                    )
                    .map((option) => (
                      <button
                        key={option.type}
                        type="button"
                        onClick={() => {
                          workflow.insert(id, option);
                          setOpen(false);
                        }}
                      >
                        <span style={{ background: option.color }} aria-hidden="true">
                          <NodeIcon type={option.type} />
                        </span>
                        {option.label}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        }
      >
        <button
          ref={trigger}
          type="button"
          className="workflow-react-add__trigger"
          aria-label="添加节点"
          aria-expanded={open}
        >
          <PlusOutlined aria-hidden="true" />
        </button>
      </Popover>
    </div>
  );
}
