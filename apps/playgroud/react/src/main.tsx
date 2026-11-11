import { createRoot } from "react-dom/client";
import { App as AntdApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import "@bubblesjs/workflow-react-core/style.css";
import "@bubblesjs/workflow-react-history/style.css";
import { App } from "./App";
import "./style.css";

const container = document.getElementById("app");
if (!container) throw new Error("找不到应用挂载点。");
createRoot(container).render(
  <ConfigProvider
    locale={zhCN}
    theme={{
      token: {
        colorPrimary: "#5075dc",
        colorText: "#465675",
        borderRadius: 6,
        fontFamily: '"Segoe UI", "Microsoft YaHei", system-ui, sans-serif',
      },
    }}
  >
    <AntdApp className="playground-provider">
      <App />
    </AntdApp>
  </ConfigProvider>,
);
