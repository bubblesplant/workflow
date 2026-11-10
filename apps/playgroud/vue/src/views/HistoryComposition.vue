<template>
  <section class="history-composition" aria-label="流程记录组合示例">
    <header class="history-composition__header">
      <div>
        <h2>采购申请流转记录</h2>
        <p>CG-20261109-001</p>
      </div>
      <label class="history-composition__control">
        <input v-model="financeExpanded" type="checkbox" />
        展开财务详情
      </label>
    </header>

    <WorkflowTimeline label="采购申请流转记录" class="history-composition__timeline">
      <WorkflowTimelineItem type="info" title="发起申请" :collapsible="false">
        <template #title>
          <div class="history-composition__person">
            <WorkflowAvatar text="王晓雨" />
            <div>
              <strong>发起申请</strong>
              <p>王晓雨 <time datetime="2026-11-09T09:12:00+08:00">2026-11-09 09:12</time></p>
            </div>
          </div>
        </template>
        <template #status>
          <WorkflowTimelineTag type="info" text="已提交" />
        </template>
        <p class="history-composition__opinion">
          申请补充项目研发与测试设备，采购预算共 ¥ 18,600.00。
        </p>
      </WorkflowTimelineItem>

      <WorkflowTimelineItem type="success" title="部门负责人审批">
        <template #title>
          <div class="history-composition__person">
            <WorkflowAvatar text="张敏" />
            <div>
              <strong>部门负责人审批</strong>
              <p>张敏 <time datetime="2026-11-09T09:38:00+08:00">2026-11-09 09:38</time></p>
            </div>
          </div>
        </template>
        <template #status>
          <WorkflowTimelineTag type="success">已通过</WorkflowTimelineTag>
        </template>
        <template #default="{ toggle }">
          <div class="history-composition__approval">
            <p>同意，符合本季度采购计划。请财务核对预算后安排采购。</p>
            <button type="button" @click="toggle">收起审批意见</button>
          </div>
        </template>
      </WorkflowTimelineItem>

      <WorkflowTimelineItem v-model:expanded="financeExpanded" type="processing" title="财务审核">
        <template #title>
          <div class="history-composition__person">
            <WorkflowAvatar text="李明" />
            <div>
              <strong>财务审核</strong>
              <p>李明 <span>财务经理</span></p>
            </div>
          </div>
        </template>
        <template #dot>
          <WorkflowTimelineDot type="processing" />
        </template>
        <template #status>
          <WorkflowTimelineTag type="processing" text="待预算确认" />
        </template>
        <div class="history-composition__budget">
          <dl>
            <div>
              <dt>申请金额</dt>
              <dd>¥ 18,600.00</dd>
            </div>
            <div>
              <dt>本季度余额</dt>
              <dd>¥ 42,000.00</dd>
            </div>
            <div>
              <dt>供应商报价</dt>
              <dd>已提供 2 份</dd>
            </div>
          </dl>
          <button type="button" :aria-expanded="showQuotes" @click="showQuotes = !showQuotes">
            {{ showQuotes ? "收起供应商报价" : "查看供应商报价" }}
          </button>
          <ul v-if="showQuotes" class="history-composition__quotes">
            <li><span>办公设备供应商 A</span><strong>¥ 18,600.00</strong></li>
            <li><span>办公设备供应商 B</span><strong>¥ 19,200.00</strong></li>
          </ul>
        </div>
      </WorkflowTimelineItem>

      <WorkflowTimelineItem type="pending" title="通知采购负责人" :default-expanded="false">
        <template #title>
          <div class="history-composition__person">
            <WorkflowAvatar text="陈倩" />
            <div>
              <strong>通知采购负责人</strong>
              <p>陈倩 <span>行政采购</span></p>
            </div>
          </div>
        </template>
        <template #status>
          <WorkflowTimelineTag type="pending" text="待流转" />
        </template>
        <p class="history-composition__opinion">
          财务确认后，将通知采购负责人跟进供应商与交付安排。
        </p>
      </WorkflowTimelineItem>
    </WorkflowTimeline>
    <p class="history-composition__note">
      以上为模拟采购流程，可展开详情、查看报价并收起审批意见。
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  WorkflowAvatar,
  WorkflowTimeline,
  WorkflowTimelineDot,
  WorkflowTimelineItem,
  WorkflowTimelineTag,
} from "@bubblesjs/workflow-vue-history";

const financeExpanded = ref(true);
const showQuotes = ref(false);
</script>

<style scoped>
.history-composition {
  padding: 24px;
  border: 1px solid #e6eaf2;
  border-radius: 8px;
  background: #fff;
}

.history-composition__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 30px;
}

.history-composition__header h2 {
  margin: 0 0 4px;
  color: #36435b;
  font-size: 16px;
  font-weight: 600;
}

.history-composition__header p,
.history-composition__note {
  margin: 0;
  color: #8591a5;
  font-size: 12px;
}

.history-composition__control {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #66768e;
  font-size: 13px;
  cursor: pointer;
}

.history-composition__control input {
  width: 15px;
  height: 15px;
  accent-color: #4269d4;
}

.history-composition__person {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.history-composition__person > div {
  min-width: 0;
}

.history-composition__person strong {
  font-size: 14px;
  font-weight: 600;
}

.history-composition__person p {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  margin: 3px 0 0;
  color: #7b879b;
  font-size: 12px;
  font-weight: 400;
}

.history-composition__opinion,
.history-composition__approval p {
  margin: 0;
  font-size: 13px;
}

.history-composition__approval {
  padding: 14px 16px;
  border-left: 2px solid #93c5af;
  background: #f7faf8;
}

.history-composition button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #4269d4;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.history-composition button:focus-visible,
.history-composition__control input:focus-visible {
  outline: 2px solid #4269d4;
  outline-offset: 3px;
}

.history-composition__approval button {
  margin-top: 8px;
}

.history-composition__budget dl {
  display: grid;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 13px;
}

.history-composition__budget dl > div {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: 12px;
}

.history-composition__budget dt {
  color: #7b879b;
}

.history-composition__budget dd {
  margin: 0;
}

.history-composition__quotes {
  display: grid;
  gap: 10px;
  margin: 14px 0 0;
  padding: 14px 16px;
  background: #f7f9fd;
  font-size: 13px;
  list-style: none;
}

.history-composition__quotes li {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
}

.history-composition__quotes strong {
  font-weight: 500;
}

.history-composition__note {
  margin-top: 24px;
}

@media (max-width: 540px) {
  .history-composition {
    padding: 18px 16px;
  }

  .history-composition__person {
    gap: 8px;
  }

  .history-composition__budget dl > div {
    grid-template-columns: 80px minmax(0, 1fr);
    gap: 8px;
  }
}
</style>
