<template>
  <div class="workflow-home">
    <section class="workflow-hero" aria-labelledby="workflow-heading">
      <a class="workflow-release" :href="withBase('/guide/introduction')">
        <img :src="withBase('/logo.svg')" width="32" height="32" alt="" />
        Vue 3 工作流设计器 <span>v0.1.0</span>
      </a>
      <h1 id="workflow-heading">让流程设计<br />回到业务本身。</h1>
      <p class="workflow-hero-description">
        从一条审批，到复杂的条件与循环。<br class="mobile-break" />用 Vue 组件，把业务连接起来。
      </p>
      <p class="workflow-hero-note">数据驱动，类型完整，业务配置由你掌握。</p>
      <div class="workflow-actions">
        <a class="workflow-button primary" :href="withBase('/guide/getting-started')"
          >开始使用 <span aria-hidden="true">↗</span></a
        >
        <a class="workflow-button" :href="withBase('/examples/')">体验设计器</a>
        <a class="workflow-text-link" :href="withBase('/api/designer')"
          >阅读 API <span aria-hidden="true">↗</span></a
        >
      </div>
    </section>
    <section class="workflow-showcase" aria-label="工作流设计器预览">
      <div class="workflow-preview-window">
        <div class="workflow-window-header">
          <span class="workflow-window-dots" aria-hidden="true"><i /><i /><i /></span
          ><span>Workflow / 费用审批</span><span class="workflow-window-status">示例预览</span>
        </div>
        <div class="workflow-preview-body">
          <div class="workflow-code-pane">
            <span class="workflow-file-label">ApprovalFlow.vue</span>
            <pre><code><span class="code-purple">&lt;script setup lang="ts"&gt;</span>
<span class="code-purple">import</span> { ref } <span class="code-purple">from</span> <span class="code-green">"vue"</span>;
<span class="code-purple">import</span> {
  Designer,
  createDefaultNodes,
} <span class="code-purple">from</span> <span class="code-green">"@workflow/vue-core"</span>;

<span class="code-purple">const</span> nodes = <span class="code-blue">ref</span>(<span class="code-blue">createDefaultNodes</span>());
<span class="code-purple">&lt;/script&gt;</span>

<span class="code-purple">&lt;template&gt;</span>
  <span class="code-blue">&lt;Designer</span>
    id=<span class="code-green">"approval"</span>
    v-model:nodes=<span class="code-green">"nodes"</span>
  <span class="code-blue">/&gt;</span>
<span class="code-purple">&lt;/template&gt;</span></code></pre>
            <a :href="withBase('/guide/getting-started')"
              >查看完整接入代码 <span aria-hidden="true">↗</span></a
            >
          </div>
          <div class="workflow-diagram" aria-label="发起申请，主管审批，财务确认，流程结束">
            <span class="workflow-diagram-caption">费用审批流程</span>
            <div class="workflow-mini-terminal"><span class="workflow-start-dot" />发起申请</div>
            <div class="workflow-mini-line"><span>+</span></div>
            <div class="workflow-mini-node">
              <div>
                <span class="workflow-mini-icon">✓</span>主管审批<span
                  class="workflow-mini-ellipsis"
                  >···</span
                >
              </div>
              <p>由直属主管审批费用申请<span>›</span></p>
            </div>
            <div class="workflow-mini-line"><span>+</span></div>
            <div class="workflow-mini-node finance">
              <div>
                <span class="workflow-mini-icon">≡</span>财务确认<span
                  class="workflow-mini-ellipsis"
                  >···</span
                >
              </div>
              <p>确认金额与报销凭证<span>›</span></p>
            </div>
            <div class="workflow-mini-line"><span>+</span></div>
            <div class="workflow-mini-terminal"><span class="workflow-end-dot" />流程结束</div>
            <a class="workflow-diagram-link" :href="withBase('/examples/')"
              >打开交互示例 <span aria-hidden="true">↗</span></a
            >
          </div>
        </div>
      </div>
    </section>
    <section class="workflow-get-started" aria-labelledby="workflow-start-heading">
      <div>
        <h2 id="workflow-start-heading">从一个组件开始</h2>
        <p>绑定节点数据，导入样式，<br />接下来专注于你的业务。</p>
      </div>
      <div class="workflow-install">
        <span>安装组件</span
        ><button
          type="button"
          @click="copyInstall"
          :aria-label="copied ? '安装命令已复制' : '复制安装命令'"
        >
          <code><span>$</span> pnpm add @workflow/vue-core</code
          ><span>{{ copied ? "已复制" : "复制" }}</span></button
        ><a :href="withBase('/guide/getting-started#安装')"
          >查看安装与环境要求 <span aria-hidden="true">↗</span></a
        >
        <p v-if="copyError" role="status">{{ copyError }}</p>
      </div>
    </section>
    <section class="workflow-capabilities" aria-labelledby="workflow-features-heading">
      <h2 id="workflow-features-heading">流程有结构，业务有自由。</h2>
      <p>画布处理流程编排，你的应用处理业务规则。</p>
      <div class="workflow-feature-grid">
        <a :href="withBase('/guide/nodes')"
          ><svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 6v7m0 0H6v9m10-9h10v9" stroke="currentColor" stroke-width="1.5" />
            <rect x="11" y="2" width="10" height="6" rx="2" fill="currentColor" />
            <rect
              x="2"
              y="22"
              width="8"
              height="7"
              rx="2"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <rect
              x="22"
              y="22"
              width="8"
              height="7"
              rx="2"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
          <h3>分支与循环，自然展开</h3>
          <p>审批、填写、抄送、条件分支与嵌套循环。节点和连线自动布局。</p>
          <span>了解流程结构 ↗</span></a
        >
        <a :href="withBase('/guide/configuration')"
          ><svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="4"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <path
              d="M10 11h12M10 16h7M10 21h10"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <h3>你的表单，你的业务</h3>
          <p>监听节点点击，用自己的表单编辑配置。审批人、条件和规则由你定义。</p>
          <span>接入业务配置 ↗</span></a
        >
        <a :href="withBase('/guide/persistence')"
          ><svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="m10 8-7 8 7 8m12-16 7 8-7 8M18 5l-4 22"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <h3>一份数据，连接始终</h3>
          <p>用 TypeScript 描述业务配置，用 JSON 保存流程，恢复后继续编辑。</p>
          <span>保存与恢复流程 ↗</span></a
        >
      </div>
    </section>
    <section class="workflow-home-bottom">
      <img :src="withBase('/logo.svg')" width="40" height="40" alt="" />
      <h2>把下一条流程，交给 Workflow。</h2>
      <a class="workflow-button primary" :href="withBase('/guide/getting-started')"
        >开始构建 <span aria-hidden="true">↗</span></a
      >
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { withBase } from "vitepress";

const copied = ref(false);
const copyError = ref("");

async function copyInstall() {
  try {
    await navigator.clipboard.writeText("pnpm add @workflow/vue-core");
    copied.value = true;
    copyError.value = "";
  } catch {
    copyError.value = "请选中上方命令手动复制。";
  }
}
</script>
