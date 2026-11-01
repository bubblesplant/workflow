import { vue } from "@antfu/eslint-config";

// ESLint 只加载 Vue 专项规则，通用脚本检查交给 Oxlint。
const presets = await vue({
  typescript: true,
  stylistic: false,
  sfcBlocks: false,
  overrides: {
    "vue/block-order": ["error", { order: ["template", "script", "style"] }],
  },
});
const plugins = Object.assign({}, ...presets.map((config) => config.plugins));
const orderingRules = new Set(["vue/attributes-order", "vue/order-in-components"]);

// 部分排版规则仍由 Vue preset 启用，统一移除以交给 Oxfmt。
function isLintRule([name]) {
  const separator = name.lastIndexOf("/");
  const rule = plugins[name.slice(0, separator)]?.rules?.[name.slice(separator + 1)];
  return rule?.meta?.type !== "layout" && !orderingRules.has(name);
}

export default [
  {
    name: "workflow/vue-lint/ignores",
    ignores: [
      "**/*",
      "!**/",
      "!**/*.vue",
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.vitepress/cache/**",
      "**/.vitepress/dist/**",
    ],
  },
  ...presets.map((config) => ({
    ...config,
    files: ["**/*.vue"],
    rules: Object.fromEntries(Object.entries(config.rules ?? {}).filter(isLintRule)),
  })),
];
