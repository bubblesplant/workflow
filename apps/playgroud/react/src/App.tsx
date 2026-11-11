import { useState } from "react";
import { ApartmentOutlined, HistoryOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { DesignerPlayground } from "./views/DesignerPlayground";
import { HistoryPlayground } from "./views/HistoryPlayground";

export function App() {
  const [activeView, setActiveView] = useState<"designer" | "history">("designer");
  return (
    <div className="playground-shell">
      <header className="playground-header">
        <span className="playground-title">React 工作流组件</span>
        <nav className="playground-menu" aria-label="组件演示">
          <Button
            type={activeView === "designer" ? "primary" : "text"}
            icon={<ApartmentOutlined aria-hidden="true" />}
            aria-pressed={activeView === "designer"}
            onClick={() => setActiveView("designer")}
          >
            流程设计器
          </Button>
          <Button
            type={activeView === "history" ? "primary" : "text"}
            icon={<HistoryOutlined aria-hidden="true" />}
            aria-pressed={activeView === "history"}
            onClick={() => setActiveView("history")}
          >
            流程记录
          </Button>
        </nav>
      </header>
      <div className="playground-content">
        <div className="playground-view" hidden={activeView !== "designer"}>
          <DesignerPlayground />
        </div>
        <div className="playground-view" hidden={activeView !== "history"}>
          <HistoryPlayground />
        </div>
      </div>
    </div>
  );
}
