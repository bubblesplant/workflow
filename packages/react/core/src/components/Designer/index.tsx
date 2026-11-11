import { lazy, Suspense, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { WorkflowNode, WorkflowNodeClickEvent } from "../../types";
import "../../style.css";

const FlowGramCanvas = lazy(
  () => import("./FlowGramCanvas"),
) as typeof import("./FlowGramCanvas").default;

export interface DesignerProps<TConfig = unknown> {
  id: string;
  nodes: WorkflowNode<TConfig>[];
  onNodesChange?: (nodes: WorkflowNode<TConfig>[]) => void;
  readonly?: boolean;
  onNodeClick?: (event: WorkflowNodeClickEvent) => void;
  className?: string;
  style?: CSSProperties;
}

/** 受控设计器；引擎只在浏览器挂载，服务端可安全渲染占位容器。 */
export function Designer<TConfig = unknown>(props: DesignerProps<TConfig>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div
      id={props.id}
      className={`workflow-react-designer ${props.className ?? ""}`}
      style={props.style}
    >
      {mounted && (
        <Suspense
          fallback={
            <div className="workflow-react-designer__loading" role="status">
              正在加载流程画布…
            </div>
          }
        >
          <FlowGramCanvas<TConfig> {...props} />
        </Suspense>
      )}
    </div>
  );
}
