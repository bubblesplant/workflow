<template>
  <main class="history-playground">
    <div class="history-playground__container">
      <header class="history-playground__intro">
        <div>
          <h1>流程记录1</h1>
          <p>查看每个环节的处理人、审批意见与附件。</p>
        </div>
      </header>

      <nav class="history-playground__modes" aria-label="流程记录示例">
        <button type="button" :aria-pressed="mode === 'records'" @click="mode = 'records'">
          记录列表
        </button>
        <button type="button" :aria-pressed="mode === 'composition'" @click="mode = 'composition'">
          组合示例
        </button>
      </nav>

      <HistoryComposition v-if="mode === 'composition'" />
      <template v-else>
        <section class="history-playground__instance" aria-label="流程信息">
          <div>
            <h2>办公设备采购申请</h2>
            <p>CG-20261109-001</p>
          </div>
          <span>发起人：王晓雨</span>
          <span>申请部门：产品研发部</span>
        </section>

        <WorkflowHistory
          class="history-playground__records"
          title="审批记录1"
          :records="records"
          @attachment-click="previewAttachment"
        />

        <section
          v-if="preview"
          class="history-playground__preview"
          aria-label="附件预览"
          aria-live="polite"
        >
          <header>
            <div>
              <h2>{{ preview.name }}</h2>
              <p>来自：{{ preview.recordTitle }}</p>
            </div>
            <button type="button" @click="preview = null">关闭预览</button>
          </header>
          <div class="history-playground__document">
            <h3>办公设备采购明细</h3>
            <dl>
              <div>
                <dt>申请部门</dt>
                <dd>产品研发部</dd>
              </div>
              <div>
                <dt>采购用途</dt>
                <dd>补充项目研发与测试设备</dd>
              </div>
              <div>
                <dt>预算总额</dt>
                <dd>¥ 18,600.00</dd>
              </div>
            </dl>
            <p>采购清单及预算已由部门负责人核对，请财务继续审核。</p>
          </div>
        </section>
        <p class="history-playground__note">
          以上为静态流程记录与模拟附件，可点击记录右侧箭头展开、收起详情。
        </p>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  WorkflowHistory,
  type WorkflowHistoryAttachmentEvent,
  type WorkflowHistoryRecord,
} from "@bubblesjs/workflow-vue-history";
import HistoryComposition from "./HistoryComposition.vue";

const mode = ref<"records" | "composition">("records");
const preview = ref<{ name: string; recordTitle: string } | null>(null);

const records: WorkflowHistoryRecord[] = [
  {
    id: "submitted",
    title: "发起申请",
    status: "info",
    statusText: "已提交",
    operator: { name: "王晓雨", description: "产品研发部" },
    time: "2026-11-09 09:12",
    datetime: "2026-11-09T09:12:00+08:00",
    opinionLabel: "申请说明",
    opinion: "因新项目研发需要，申请采购办公及测试设备，明细见附件。",
    fields: [
      { label: "预算金额", value: "¥ 18,600.00" },
      { label: "补充次数", value: 0 },
      { label: "紧急采购", value: false },
    ],
    attachments: [{ id: "purchase-list", name: "办公设备采购明细.pdf", size: "128 KB" }],
  },
  {
    id: "manager",
    title: "部门负责人审批",
    status: "success",
    operator: { name: "张敏", description: "部门负责人" },
    time: "2026-11-09 09:38",
    datetime: "2026-11-09T09:38:00+08:00",
    opinion: "同意，符合本季度采购计划。\n请财务核对预算后安排采购。",
  },
  {
    id: "finance",
    title: "财务审核",
    status: "processing",
    operator: { name: "李明", description: "财务经理" },
    time: "2026-11-09 09:38 到达",
    datetime: "2026-11-09T09:38:00+08:00",
  },
  {
    id: "notification",
    title: "通知采购负责人",
    status: "pending",
    operator: { name: "陈倩", description: "行政采购" },
    statusText: "待流转",
  },
];

function previewAttachment({ attachment, record, event }: WorkflowHistoryAttachmentEvent) {
  event.preventDefault();
  preview.value = { name: attachment.name, recordTitle: record.title };
}
</script>

<style scoped>
.history-playground {
  min-height: 100%;
  padding: 32px;
  background: #f6f8fc;
  color: #36435b;
  font:
    14px/1.65 "Segoe UI",
    "Microsoft YaHei",
    system-ui,
    sans-serif;
}

.history-playground__container {
  max-width: 980px;
  margin-inline: auto;
}

.history-playground__intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.history-playground__intro h1 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 600;
}

.history-playground__modes {
  display: flex;
  gap: 4px;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e1e6f0;
}

.history-playground__modes button {
  padding: 7px 16px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #748098;
  font: inherit;
  cursor: pointer;
}

.history-playground__modes button[aria-pressed="true"] {
  background: #eaf0ff;
  color: #4269d4;
}

.history-playground__modes button:focus-visible {
  outline: 2px solid #4269d4;
  outline-offset: 3px;
}

.history-playground__intro p,
.history-playground__instance p,
.history-playground__preview header p {
  margin: 0;
  color: #7b879b;
  font-size: 13px;
}

.history-playground__instance {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 28px;
  padding: 20px 24px;
  border: 1px solid #e6eaf2;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: #fff;
}

.history-playground__instance > div {
  margin-right: auto;
}

.history-playground__instance h2,
.history-playground__preview header h2 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
}

.history-playground__instance > span {
  color: #748098;
  font-size: 12px;
}

.history-playground__records {
  border: 1px solid #e6eaf2;
  border-radius: 0 0 8px 8px;
}

.history-playground__note {
  margin: 16px 0 0;
  color: #8591a5;
  font-size: 12px;
}

.history-playground__preview {
  margin-top: 20px;
  padding: 20px 24px;
  border: 1px solid #dce4f6;
  border-radius: 8px;
  background: #fff;
}

.history-playground__preview header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.history-playground__preview header > div {
  min-width: 0;
  overflow-wrap: anywhere;
}

.history-playground__preview button {
  flex: none;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: #4269d4;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.history-playground__preview button:focus-visible {
  outline: 2px solid #4269d4;
  outline-offset: 3px;
}

.history-playground__document {
  margin-top: 20px;
  padding: 24px;
  background: #f8faff;
}

.history-playground__document h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.history-playground__document dl {
  display: grid;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 13px;
}

.history-playground__document dl > div {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 12px;
}

.history-playground__document dt {
  color: #7b879b;
}

.history-playground__document dd,
.history-playground__document p {
  margin: 0;
}

@media (max-width: 640px) {
  .history-playground {
    padding: 20px 12px;
  }

  .history-playground__intro {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
  }

  .history-playground__intro h1 {
    font-size: 22px;
  }

  .history-playground__instance,
  .history-playground__preview {
    padding: 16px;
  }

  .history-playground__instance > div {
    width: 100%;
  }

  .history-playground__document {
    padding: 16px;
  }
}
</style>
