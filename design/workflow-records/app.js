const historyPreview = new URLSearchParams(location.search).get("preview") === "history";
if (historyPreview) document.body.classList.add("history-preview");
const $ = (selector) => document.querySelector(selector);
const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  records: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  document:
    '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 12h6M9 16h6"/>',
  flow: '<rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><path d="M12 7v5M5.5 17v-5h13v5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 1.5-2.5 3.5M12 17h.01"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  refresh: '<path d="M20 10a8 8 0 0 0-14-5L3 8m0-5v5h5M4 14a8 8 0 0 0 14 5l3-3m0 5v-5h-5"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M7 3v4m10-4v4M8 14h2m4 0h2m-8 4h2"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-right": '<path d="m9 5 7 7-7 7"/>',
  sort: '<path d="M8 4v16m-4-4 4 4 4-4M14 5h6m-6 5h4m-4 5h2"/>',
  link: '<path d="m10 14 4-4M8 16l-1 1a3.5 3.5 0 0 1-5-5l5-5a3.5 3.5 0 0 1 5 0m0 10a3.5 3.5 0 0 0 5 0l5-5a3.5 3.5 0 0 0-5-5l-1 1"/>',
  history: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  fit: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
  locate:
    '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1.5"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
  mouse: '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 6v4"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4 10-10"/>',
  person: '<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
  approval: '<path d="m5 12 4.5 4.5L19 7"/>',
  fill: '<path d="m14.5 5.5 4 4M5 15l-.8 4.8L9 19 19 9a2.8 2.8 0 0 0-4-4L5 15Z"/><path d="m5 15 4 4"/>',
  branch: '<path d="m12 2 9 10-9 10L3 12z"/><path d="M9 10h6m-6 4h4"/>',
  copy: '<path d="m20 4-6 16-3.5-6.5L4 10l16-6Z"/><path d="m10.5 13.5 5-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
};
const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.document}</svg>`;
const hydrateIcons = (root = document) =>
  root.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
const statusNames = { running: "进行中", done: "已完成", rejected: "已拒绝", withdrawn: "已撤回" };
const badge = (status) => `<span class="status ${status}">${statusNames[status]}</span>`;
const avatar = (name, color = "blue") =>
  `<span class="avatar avatar-${color}">${name.slice(-1)}</span>`;
const records = [
  {
    id: "WF-20261106-0086",
    title: "产品研发设备采购申请",
    short: "产品研发设备采购申请",
    person: "林晓",
    department: "产品研发部",
    date: "11-06 09:12",
    start: "2026-11-06 09:12",
    status: "running",
    amount: "28,600.00",
    node: "财务审核",
    color: "blue",
    subject: "研发工作站及配套显示器采购",
    purpose: "新增研发工作站 2 台、专业显示器 2 台，用于产品设计与开发。",
  },
  {
    id: "WF-20261106-0085",
    title: "华东客户拜访出差申请",
    short: "华东客户拜访出差申请",
    person: "陈思",
    department: "市场部",
    date: "11-06 08:45",
    start: "2026-11-06 08:45",
    status: "running",
    amount: "8,500.00",
    node: "财务审核",
    color: "purple",
    subject: "华东区域客户拜访及差旅预算",
    purpose: "前往上海、杭州拜访合作客户，预计行程 3 天。",
  },
  {
    id: "WF-20261105-0084",
    title: "设计团队软件订阅申请",
    short: "设计团队软件订阅申请",
    person: "周悦",
    department: "设计部",
    date: "11-05 16:20",
    start: "2026-11-05 16:20",
    status: "done",
    amount: "6,800.00",
    node: "流程已结束",
    color: "orange",
    subject: "设计协作软件年度订阅",
    purpose: "续订设计团队年度协作软件，支持团队日常设计交付。",
  },
  {
    id: "WF-20261105-0083",
    title: "办公设备采购申请",
    short: "办公设备采购申请",
    person: "王凯",
    department: "行政部",
    date: "11-05 14:36",
    start: "2026-11-05 14:36",
    status: "rejected",
    amount: "15,200.00",
    node: "财务审核未通过",
    color: "green",
    subject: "办公打印设备更新",
    purpose: "更换办公区打印及扫描设备。",
  },
  {
    id: "WF-20261105-0082",
    title: "十月项目费用报销",
    short: "十月项目费用报销",
    person: "林晓",
    department: "产品研发部",
    date: "11-05 10:08",
    start: "2026-11-05 10:08",
    status: "done",
    amount: "3,260.00",
    node: "流程已结束",
    color: "blue",
    subject: "十月项目测试及物料费用",
    purpose: "报销项目测试物料与第三方测试服务费用。",
  },
  {
    id: "WF-20261104-0081",
    title: "品牌活动物料采购申请",
    short: "品牌活动物料采购申请",
    person: "许宁",
    department: "品牌部",
    date: "11-04 15:42",
    start: "2026-11-04 15:42",
    status: "withdrawn",
    amount: "9,800.00",
    node: "发起人主动撤回",
    color: "purple",
    subject: "秋季品牌活动物料制作",
    purpose: "活动日期调整，相关物料采购暂缓。",
  },
  {
    id: "WF-20261104-0080",
    title: "新员工入职设备申请",
    short: "新员工入职设备申请",
    person: "赵晨",
    department: "人力资源部",
    date: "11-04 11:05",
    start: "2026-11-04 11:05",
    status: "done",
    amount: "12,600.00",
    node: "流程已结束",
    color: "green",
    subject: "新员工入职办公设备",
    purpose: "为新入职同事配备笔记本电脑及办公配件。",
  },
  {
    id: "WF-20261103-0079",
    title: "服务器资源扩容申请",
    short: "服务器资源扩容申请",
    person: "陆川",
    department: "技术部",
    date: "11-03 09:30",
    start: "2026-11-03 09:30",
    status: "running",
    amount: "42,000.00",
    node: "财务审核",
    color: "orange",
    subject: "测试环境计算资源扩容",
    purpose: "扩容测试环境计算与存储资源，支持新版本性能测试。",
  },
];
let selected = records[0],
  selectedNode = "finance",
  activeTab = historyPreview
    ? "history"
    : ["diagram", "history", "form"].includes(location.hash.slice(1))
      ? location.hash.slice(1)
      : "diagram",
  zoom = 1,
  period = "week",
  descending = true;
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2600);
}
function getFiltered() {
  const query = $("#search").value.trim().toLowerCase();
  const status = $("#status-filter").value;
  const filtered = records.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      (period !== "today" || r.id.startsWith("WF-20261106")) &&
      `${r.title} ${r.id} ${r.person}`.toLowerCase().includes(query),
  );
  return descending ? filtered : filtered.reverse();
}
function renderRecords() {
  const filtered = getFiltered();
  $("#record-count").textContent = filtered.length;
  $("#visible-count").textContent = filtered.length;
  $("#record-list").innerHTML = filtered
    .map(
      (r) =>
        `<button class="record ${r === selected ? "selected" : ""}" data-record="${r.id}" aria-pressed="${r === selected}"><div class="record-top"><span class="record-title">${r.short}</span>${badge(r.status)}</div><div class="record-id">${r.id}</div><div class="record-bottom">${avatar(r.person, r.color)}<span>${r.person}</span><span class="record-date">${r.date}</span></div><div class="record-node"><i class="tiny-dot"></i>${r.node}</div></button>`,
    )
    .join("");
  $("#instance-pane").hidden = !filtered.length;
  $("#empty-state").hidden = !!filtered.length;
  if (filtered.length && !filtered.includes(selected)) {
    selected = filtered[0];
    selectedNode = selected.status === "done" ? "copy" : "finance";
    renderInstance();
  }
  document.querySelectorAll("[data-record]").forEach((el) =>
    el.addEventListener("click", () => {
      selected = records.find((r) => r.id === el.dataset.record);
      selectedNode =
        selected.status === "done"
          ? "copy"
          : selected.status === "withdrawn"
            ? "manager"
            : "finance";
      $("#inspector").classList.remove("open");
      renderRecords();
      renderInstance();
    }),
  );
}
function runtime() {
  const done = selected.status === "done";
  const stopped = selected.status === "withdrawn";
  const failed = selected.status === "rejected";
  return {
    manager: stopped ? "waiting" : "done",
    finance: done ? "done" : failed ? "failed" : stopped ? "waiting" : "current",
    copy: done ? "done" : "waiting",
    end: done ? "done" : "waiting",
  };
}
function eventTime(value) {
  const offsets = { "09:38": 26, "10:15": 63, "16:05": 23 };
  const d = new Date(
    new Date(selected.start.replace(" ", "T") + ":00+08:00").getTime() +
      (offsets[value] ?? value) * 60000,
  );
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return parts;
}
function elapsed() {
  const start = new Date(eventTime(26).replace(" ", "T") + ":00+08:00");
  const mins = Math.max(0, Math.floor((new Date("2026-11-06T14:32:00+08:00") - start) / 60000));
  return Math.floor(mins / 60) + " 小时 " + (mins % 60) + " 分钟";
}
function flowHistory() {
  const rt = runtime();
  const events = [
    {
      title: "发起申请",
      person: selected.person,
      time: selected.start,
      state: "done",
      comment: "申请已提交，流程开始流转。",
    },
  ];
  if (rt.manager === "done")
    events.push({
      title: "部门负责人",
      person: "张敏",
      time: eventTime("09:38"),
      state: "done",
      comment: "同意，符合本季度采购计划。",
    });
  if (selected.status === "withdrawn")
    events.push({
      title: "撤回申请",
      person: selected.person,
      time: eventTime("16:05"),
      state: "failed",
      comment: "活动计划有变，撤回后重新申请。",
    });
  else
    events.push({
      title: "财务审核",
      person: "李明",
      time: eventTime(rt.finance === "current" ? "09:38" : "10:15"),
      state: rt.finance,
      comment:
        rt.finance === "current"
          ? "等待李明处理"
          : rt.finance === "failed"
            ? "请补充供应商报价与预算明细后重新提交。"
            : "预算核对无误，审核通过。",
    });
  if (rt.copy === "done")
    events.push(
      {
        title: "抄送通知",
        person: "行政部",
        time: eventTime("10:15"),
        state: "done",
        comment: "已通知相关同事。",
      },
      {
        title: "流程结束",
        person: "系统",
        time: eventTime("10:15"),
        state: "done",
        comment: "所有节点已处理完成。",
      },
    );
  return events;
}
function timelineHTML(events) {
  return `<div class="timeline">${events.map((e) => `<div class="timeline-item"><span class="timeline-dot ${e.state === "current" ? "current" : e.state === "failed" ? "failed" : ""}">${e.state === "current" ? "" : icon(e.state === "failed" ? "close" : "check")}</span><div class="timeline-title"><strong>${e.title}</strong><span>${e.state === "current" ? "待处理" : e.state === "failed" ? (selected.status === "withdrawn" ? "已撤回" : "已拒绝") : "已完成"}</span></div><time>${e.time}</time>${e.comment ? `<div class="timeline-comment ${e.state === "done" ? "success" : ""}">${e.person}：${e.comment}</div>` : ""}</div>`).join("")}</div>`;
}
let logFilter = "all";
let logNewest = true;
function fullHistoryHTML(events) {
  const current = events.find((event) => event.state === "current");
  const completed = events.filter((event) => event.state === "done").length;
  const filters = { all: "全部记录", approval: "审批记录", other: "其他操作" };
  const filtered = events.filter(
    (event) =>
      logFilter === "all" ||
      (logFilter === "approval") === ["部门负责人", "财务审核"].includes(event.title),
  );
  const ordered = logNewest ? [...filtered].reverse() : filtered;
  const roles = {
    发起申请: selected.department,
    部门负责人: "部门负责人",
    财务审核: "财务经理",
    抄送通知: "接收人 · 共 2 位",
    流程结束: "自动处理",
    撤回申请: "发起人",
  };
  const rows = ordered
    .map((event) => {
      const current = event.state === "current";
      const failed = event.state === "failed";
      const system = event.person === "系统";
      const title = event.title === "部门负责人" ? "部门负责人审批" : event.title;
      const isApproval = ["部门负责人", "财务审核"].includes(event.title);
      const result = current
        ? "待审批"
        : failed
          ? selected.status === "withdrawn"
            ? "已撤回"
            : "已拒绝"
          : { 发起申请: "已提交", 抄送通知: "已送达", 流程结束: "已结束" }[event.title] || "已通过";
      const state = current ? "pending" : failed ? "negative" : isApproval ? "positive" : "neutral";
      const duration = current
        ? "到达时间"
        : event.title === "部门负责人"
          ? "用时 26 分钟"
          : event.title === "财务审核"
            ? "用时 37 分钟"
            : event.title === "流程结束" || event.title === "抄送通知"
              ? "自动执行"
              : "即时提交";
      return `<tr class="log-row ${current ? "pending-row" : ""}" data-log-row>
      <td data-label="环节"><div class="log-step"><span class="log-step-icon">${icon(event.title === "发起申请" ? "document" : event.title === "抄送通知" ? "copy" : event.title === "流程结束" ? "check" : event.title === "撤回申请" ? "history" : "approval")}</span><strong>${title}</strong></div><span class="log-event-kind">${isApproval ? "人工审批" : event.title === "发起申请" ? "发起流程" : event.title === "撤回申请" ? "撤回流程" : "系统操作"}</span></td>
      <td data-label="处理人"><div class="log-person">${system ? '<span class="avatar log-system">' + icon("flow") + "</span>" : avatar(event.person, current ? "blue" : event.person === selected.person ? selected.color : "slate")}<div><strong>${event.person}</strong><span>${roles[event.title]}</span></div></div></td>
      <td data-label="结果"><span class="log-result ${state}">${icon(current ? "clock" : failed ? "close" : "check")}${result}</span></td>
      <td class="log-opinion ${current ? "awaiting-opinion" : ""}" data-label="意见 / 说明">${current ? "<span>等待处理，暂无审批意见</span>" : event.comment}</td>
      <td class="log-time" data-label="处理时间"><time datetime="${event.time.replace(" ", "T")}:00+08:00">${event.time.slice(5, 10)}<strong>${event.time.slice(11)}</strong></time><span>${duration}</span></td>
    </tr>`;
    })
    .join("");
  const finalLabels = { done: "审批已完成", rejected: "审批未通过", withdrawn: "申请已撤回" };
  const focus = current
    ? `<section class="log-focus" aria-label="当前待办"><div class="log-focus-step"><span class="log-focus-icon">${icon("clock")}</span><div><span class="log-field-label">当前待办</span><h4>${current.title}<span class="log-live">处理中</span></h4></div></div><div class="log-focus-person">${avatar(current.person)}<div><strong>${current.person}</strong><span>财务经理</span></div></div><div class="log-focus-wait"><span class="log-field-label">已等待</span><strong>${elapsed()}</strong></div></section>`
    : `<section class="log-closed ${selected.status}"><span class="log-closed-icon">${icon(selected.status === "done" ? "check" : selected.status === "withdrawn" ? "history" : "close")}</span><div><strong>${finalLabels[selected.status]}</strong><span>${selected.status === "done" ? "所有审批环节均已处理完成，相关人员已收到通知" : selected.status === "withdrawn" ? "发起人已撤回申请，流程不再继续流转" : "请根据审批意见补充材料后重新发起"}</span></div><span class="log-closed-count">${completed} 个环节已完成</span></section>`;
  return `<div class="log-board">
    <header class="log-header"><div><div class="log-title"><span class="log-title-icon">${icon("records")}</span><h3>流转记录</h3>${badge(selected.status)}</div><p>${selected.title}<span>${selected.id}</span></p></div><button class="log-export" data-log-export>${icon("download")}导出记录</button></header>
    ${focus}
    <div class="log-toolbar"><div class="log-filters" role="group" aria-label="记录类型">${Object.entries(
      filters,
    )
      .map(
        ([key, label]) =>
          '<button class="' +
          (logFilter === key ? "active" : "") +
          '" data-log-filter="' +
          key +
          '" aria-pressed="' +
          (logFilter === key) +
          '">' +
          label +
          (key === "all" ? "<span>" + events.length + "</span>" : "") +
          "</button>",
      )
      .join(
        "",
      )}</div><button class="log-sort" data-log-sort>${icon("sort")}${logNewest ? "最新在前" : "最早在前"}</button></div>
    <div class="log-table-wrap"><table class="log-table"><colgroup><col class="col-step"><col class="col-person"><col class="col-result"><col class="col-opinion"><col class="col-time"></colgroup><thead><tr><th>审批环节</th><th>处理人</th><th>处理结果</th><th>意见 / 说明</th><th>处理时间</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="log-empty">暂无此类记录</td></tr>'}</tbody></table></div>
    <footer class="log-footer"><span>共 ${filtered.length} 条记录</span><span>${icon("refresh")}更新于 14:32</span></footer>
  </div>`;
}
function exportFlowHistory() {
  const events = flowHistory();
  const csv =
    "\uFEFF" +
    [
      ["审批环节", "处理人", "状态", "意见", "时间"],
      ...events.map((event) => [
        event.title,
        event.person,
        event.state === "current"
          ? "待审批"
          : event.state === "failed"
            ? selected.status === "withdrawn"
              ? "已撤回"
              : "已拒绝"
            : "已完成",
        event.comment,
        event.time,
      ]),
    ]
      .map((row) => row.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(","))
      .join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = selected.id + "-流转记录.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function nodeMarkup(id, label, who, type, x, y, state, extra = "") {
  const current = state === "current";
  const name =
    state === "done"
      ? type === "copy"
        ? "已送达"
        : "已通过"
      : state === "failed"
        ? "未通过"
        : current
          ? "处理中"
          : extra
            ? "未执行"
            : "待处理";
  return `<button class="graph-node node-${type} ${selectedNode === id ? "selected" : ""} ${current ? "is-current" : ""} ${state === "failed" ? "node-failed" : ""} ${extra}" style="left:${x}px;top:${y}px" data-node="${id}" aria-pressed="${selectedNode === id}" aria-label="${label}，${name}"><span class="node-heading">${icon(type === "copy" ? "copy" : "approval")}<span>${label}</span><span class="node-state ${state === "done" ? "done" : state === "failed" ? "failed" : current ? "current" : ""}">${state === "done" ? icon("check") : current ? icon("clock") : ""}${name}</span></span><span class="node-body">${avatar(who, type === "copy" ? "purple" : id === "manager" ? "green" : "blue")}<span>${who}</span><span class="node-duration">${state === "done" ? (id === "copy" ? "已送达" : id === "manager" ? "26 分钟" : "37 分钟") : current ? "已等待 " + elapsed().replace("分钟", "分") : "—"}</span>${icon("chevron-right")}</span></button>`;
}
function renderGraph() {
  const rt = runtime();
  const status = selected.status;
  const stopped = status === "withdrawn";
  const completed = status === "done";
  $("#graph-stage").innerHTML =
    `<svg class="edges" viewBox="0 0 780 535" aria-hidden="true"><defs><marker id="arrow-gray" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 6 4 1 7" fill="none" stroke="#cbd4e3" stroke-width="1.1"/></marker><marker id="arrow-blue" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 6 4 1 7" fill="none" stroke="#7c9ce7" stroke-width="1.1"/></marker><marker id="arrow-green" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 6 4 1 7" fill="none" stroke="#82bfa9" stroke-width="1.1"/></marker></defs><path class="edge done" d="M390 51V76" marker-end="url(#arrow-green)"/><path class="edge ${stopped ? "wait" : "done"}" d="M390 158V186" marker-end="url(#arrow-gray)"/><path class="edge ${stopped ? "wait" : completed ? "done" : "active"}" d="M390 219V237Q390 246 381 246H219Q210 246 210 255V277" marker-end="url(#arrow-${completed ? "green" : stopped ? "gray" : "blue"})"/><path class="edge wait" d="M390 219V237Q390 246 399 246H561Q570 246 570 255V277" marker-end="url(#arrow-gray)"/><path class="edge ${completed ? "done" : "wait"}" d="M210 359V384Q210 393 219 393H381Q390 393 390 402V412" marker-end="url(#arrow-gray)"/><path class="edge wait" d="M570 359V384Q570 393 561 393H390"/><path class="edge ${completed ? "done" : "wait"}" d="M390 494V514" marker-end="url(#arrow-gray)"/></svg><div class="terminal complete" style="left:334px;top:18px">${icon("person")}发起申请${icon("check")}</div>${nodeMarkup("manager", "部门负责人审批", "张敏", "approval", 280, 76, rt.manager)}<div class="condition-gate" style="left:326px;top:186px;width:128px">${icon("branch")}申请金额判断</div><div class="branch-label ${stopped ? "" : "matched"}" style="left:111px;top:228px">金额 ≤ 50,000 元${!stopped ? '<span class="check-text">已命中</span>' : ""}</div><div class="branch-label" style="left:496px;top:228px">金额 &gt; 50,000 元</div>${rt.finance === "current" ? '<span class="node-current-label" style="left:178px;top:250px">当前节点</span>' : ""}${nodeMarkup("finance", "财务审核", "李明", "approval", 100, 277, rt.finance)}${nodeMarkup("director", "总经理审批", "王建国", "approval", 460, 277, "waiting", "node-skipped")}<span class="branch-label" style="left:535px;top:361px;font-size:8px">${stopped ? "未执行" : "未经过此分支"}</span>${nodeMarkup("copy", "抄送通知", "行政部 · 2 人", "copy", 280, 412, rt.copy)}<div class="terminal ${completed ? "complete" : ""}" style="left:334px;top:514px">${icon(completed ? "check" : "stop")}流程结束</div>`;
  document.querySelectorAll("[data-node]").forEach((el) =>
    el.addEventListener("click", () => {
      selectedNode = el.dataset.node;
      renderGraph();
      renderInspector();
      if (innerWidth <= 1150) $("#inspector").classList.add("open");
    }),
  );
  fitGraph();
}
function renderInspector() {
  const rt = runtime();
  const details = {
    manager: {
      title: "部门负责人审批",
      who: "张敏",
      role: "部门负责人",
      state: rt.manager,
      arrived: selected.start,
      mode: "人工审批 · 单人审批",
    },
    finance: {
      title: "财务审核",
      who: "李明",
      role: "财务经理",
      state: rt.finance,
      arrived: rt.manager === "done" ? eventTime("09:38") : "尚未到达",
      mode: "人工审批 · 单人审批",
    },
    director: {
      title: "总经理审批",
      who: "王建国",
      role: "总经理",
      state: "skipped",
      arrived: "未经过此分支",
      mode: "人工审批 · 单人审批",
    },
    copy: {
      title: "抄送通知",
      who: "行政部",
      role: "共 2 位接收人",
      state: rt.copy,
      arrived: rt.copy === "done" ? eventTime("10:15") : "尚未到达",
      mode: "抄送节点 · 自动通知",
    },
  };
  const d = details[selectedNode];
  const label = {
    done: selectedNode === "copy" ? "已送达" : "已通过",
    current: "处理中",
    failed: "已拒绝",
    waiting: "待处理",
    skipped: "未执行",
  }[d.state];
  const events = flowHistory();
  $("#inspector").innerHTML =
    `<div class="inspector-top">${icon("records")}<span>节点详情</span><button class="icon-button mobile-close" id="close-inspector" aria-label="收起节点详情">${icon("close")}</button></div><div class="inspector-content"><div class="node-detail-title"><h3>${d.title}</h3><span class="status ${d.state === "current" ? "running" : d.state === "done" ? "done" : d.state === "failed" ? "rejected" : "withdrawn"}">${label}</span></div><div class="node-type-label">${icon(selectedNode === "copy" ? "copy" : "approval")}${d.mode}</div><dl class="detail-grid"><dt>处理人</dt><dd class="person">${avatar(d.who, selectedNode === "manager" ? "green" : selectedNode === "copy" ? "purple" : "blue")}${d.who}<span style="color:#a4adbb;font-size:9px">${d.role}</span></dd><dt>到达时间</dt><dd>${d.arrived}</dd><dt>停留时长</dt><dd class="${d.state === "current" ? "duration" : ""}">${d.state === "current" ? elapsed() : d.state === "done" ? (selectedNode === "manager" ? "26 分钟" : selectedNode === "finance" ? "37 分钟" : "即时完成") : "—"}</dd><dt>审批方式</dt><dd>${selectedNode === "copy" ? "自动执行" : "单人审批"}</dd></dl>${d.state === "current" ? `<div class="attention-note">${icon("clock")}<span>流程正在等待 <strong>${d.who}</strong> 审批<br/>审批完成后将自动流转至下一节点</span></div>` : d.state === "skipped" ? `<div class="attention-note">${icon("branch")}<span>本次申请金额未满足此分支条件<br/>实际流转路径已在流程图中标记</span></div>` : d.state === "failed" ? `<div class="attention-note">${icon("document")}<span>请补充供应商报价与预算明细，<br/>修改后可重新发起申请。</span></div>` : d.state === "waiting" ? `<div class="attention-note">${icon("clock")}<span>上一节点完成后，将继续流转。<br/>${selected.status === "withdrawn" ? "该流程已撤回，不再继续执行。" : ""}</span></div>` : ""}<div class="section-rule"></div><div class="inspector-section-title">最近流转<span>${events.length} 条记录</span></div>${timelineHTML([...events].reverse().slice(0, 3))}<button class="all-history" id="all-history">查看完整流转记录${icon("chevron-right")}</button><div class="inspector-footnote">记录展示流程实际处理顺序，<br/>未执行的节点不会产生流转记录。</div></div>`;
  $("#all-history").addEventListener("click", () => {
    setTab("history");
    $("#inspector").classList.remove("open");
  });
  $("#close-inspector").addEventListener("click", () => {
    if (innerWidth <= 1150) $("#inspector").classList.remove("open");
    else toast("当前为宽屏视图，可点击流程节点切换详情");
  });
}
function renderInstance() {
  $("#instance-title").textContent = selected.title;
  $("#instance-status").innerHTML = badge(selected.status);
  $("#instance-id").textContent = selected.id;
  $("#instance-meta").innerHTML =
    `<span>发起人 ${avatar(selected.person, selected.color)}<strong>${selected.person}</strong></span><span class="meta-separator"></span><span>所属部门 <strong>${selected.department}</strong></span><span class="meta-separator"></span><span>发起时间 <strong>${selected.start}</strong></span><span class="meta-separator"></span><span>申请金额 <strong>¥ ${selected.amount}</strong></span>`;
  const events = flowHistory();
  $("#history-count").textContent = events.length;
  $("#history-view").innerHTML = fullHistoryHTML(events);
  $("#form-view").innerHTML =
    `<h3>申请信息</h3><p class="panel-description">随流程发起时提交的业务信息</p><div class="form-grid"><div class="form-item full"><label>申请主题</label><p>${selected.subject}</p></div><div class="form-item"><label>发起人</label><p>${selected.person}</p></div><div class="form-item"><label>所属部门</label><p>${selected.department}</p></div><div class="form-item amount"><label>申请金额（元）</label><p>¥ ${selected.amount}</p></div><div class="form-item"><label>预计使用时间</label><p>2026-11-16</p></div><div class="form-item full"><label>用途说明</label><p>${selected.purpose}</p></div><div class="form-item full"><label>申请附件</label><span class="attachment">${icon("document")}<span>申请说明.pdf<small>PDF 文档 · 1.2 MB · 示例附件</small></span></span></div></div>`;
  renderGraph();
  renderInspector();
  setTab(activeTab);
}
function fitGraph() {
  if (activeTab !== "diagram") return;
  const view = $("#graph-viewport");
  const scale =
    Math.min(view.clientWidth / (innerWidth <= 760 ? 620 : 820), view.clientHeight / 560) * zoom;
  $("#graph-stage").style.transform = `scale(${Math.max(0.25, scale)})`;
  $("#zoom-value").textContent = `${Math.round(zoom * 100)}%`;
}
function setTab(tab) {
  activeTab = tab;
  window.history.replaceState(null, "", `#${tab}`);
  document.querySelectorAll("[data-tab]").forEach((el) => {
    const active = el.dataset.tab === tab;
    el.classList.toggle("active", active);
    el.setAttribute("aria-selected", String(active));
  });
  for (const name of ["diagram", "history", "form"]) $(`#${name}-view`).hidden = name !== tab;
  requestAnimationFrame(fitGraph);
}
document
  .querySelectorAll("[data-tab]")
  .forEach((el) => el.addEventListener("click", () => setTab(el.dataset.tab)));
$("#history-view").addEventListener("click", (event) => {
  const filter = event.target.closest("[data-log-filter]");
  if (filter) {
    logFilter = filter.dataset.logFilter;
    $("#history-view").innerHTML = fullHistoryHTML(flowHistory());
  }
  if (event.target.closest("[data-log-sort]")) {
    logNewest = !logNewest;
    $("#history-view").innerHTML = fullHistoryHTML(flowHistory());
  }
  if (event.target.closest("[data-log-export]")) exportFlowHistory();
});
$("#search").addEventListener("input", renderRecords);
$("#status-filter").addEventListener("change", renderRecords);
$("#sort-button").addEventListener("click", () => {
  descending = !descending;
  $("#sort-button").innerHTML = icon("sort") + (descending ? "最新发起" : "最早发起");
  renderRecords();
});
$("#clear-filters").addEventListener("click", () => {
  $("#search").value = "";
  $("#status-filter").value = "all";
  period = "week";
  $("#date-label").textContent = "2026/11/01 – 2026/11/06";
  renderRecords();
});
$("#date-button").addEventListener("click", () => {
  $("#date-menu").hidden = !$("#date-menu").hidden;
});
document.querySelectorAll("[data-period]").forEach((el) =>
  el.addEventListener("click", () => {
    period = el.dataset.period;
    $("#date-label").textContent =
      period === "today" ? "2026/11/06" : period === "all" ? "全部时间" : "2026/11/01 – 2026/11/06";
    $("#date-menu").hidden = true;
    renderRecords();
  }),
);
document.addEventListener("click", (e) => {
  if (!e.target.closest(".heading-actions")) $("#date-menu").hidden = true;
});
$("#refresh-button").addEventListener("click", () => {
  renderRecords();
  toast("示例记录已刷新");
});
$("#copy-link").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(selected.id);
    toast(`已复制流程编号 ${selected.id}`);
  } catch {
    toast(`流程编号：${selected.id}`);
  }
});
$("#zoom-in").addEventListener("click", () => {
  zoom = Math.min(1.6, zoom + 0.1);
  fitGraph();
});
$("#zoom-out").addEventListener("click", () => {
  zoom = Math.max(0.6, zoom - 0.1);
  fitGraph();
});
$("#zoom-fit").addEventListener("click", () => {
  zoom = 1;
  fitGraph();
});
$("#locate-button").addEventListener("click", () => {
  selectedNode =
    selected.status === "done" ? "copy" : selected.status === "withdrawn" ? "manager" : "finance";
  zoom = 1;
  renderGraph();
  renderInspector();
  toast(
    selected.status === "running"
      ? "已定位当前节点：财务审核"
      : selected.status === "done"
        ? "流程已完成，已定位最后处理节点"
        : selected.status === "withdrawn"
          ? "流程已撤回，已定位撤回前节点"
          : "流程已拒绝，已定位财务审核节点",
  );
});
$("#fullscreen-button").addEventListener("click", () => {
  $("#instance-pane").classList.toggle("expanded");
  fitGraph();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    $("#instance-pane").classList.remove("expanded");
    $("#inspector").classList.remove("open");
    fitGraph();
  }
  if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    e.preventDefault();
    $("#search").focus();
  }
});
$("#export-button").addEventListener("click", () => {
  const fields = ["流程编号", "流程名称", "状态", "发起人", "部门", "发起时间", "金额"];
  const rows = getFiltered().map((r) => [
    r.id,
    r.title,
    statusNames[r.status],
    r.person,
    r.department,
    r.start,
    r.amount,
  ]);
  const csv =
    "\uFEFF" +
    [fields, ...rows]
      .map((row) => row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(","))
      .join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "流程记录-设计示例.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`已导出 ${rows.length} 条示例流程记录`);
});
for (const id of ["help-button"])
  $(`#${id}`).addEventListener("click", () => $("#help-dialog").showModal());
for (const id of ["close-help", "understood"])
  $(`#${id}`).addEventListener("click", () => $("#help-dialog").close());
document.querySelectorAll("[data-view]").forEach((el) =>
  el.addEventListener("click", () => {
    document.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("active", b === el));
    $("#overview").hidden = el.dataset.view !== "overview";
    if (!$("#overview").hidden) {
      $("#overview").innerHTML = ["running", "done", "rejected", "withdrawn"]
        .map(
          (s) =>
            `<button data-overview-status="${s}"><strong>${records.filter((r) => r.status === s).length}</strong>${statusNames[s]}的流程</button>`,
        )
        .join("");
      document.querySelectorAll("[data-overview-status]").forEach((b) =>
        b.addEventListener("click", () => {
          $("#status-filter").value = b.dataset.overviewStatus;
          renderRecords();
        }),
      );
    }
    fitGraph();
  }),
);
hydrateIcons();
renderRecords();
renderInstance();
new ResizeObserver(fitGraph).observe($("#graph-viewport"));
