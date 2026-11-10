import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { homedir, tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const packageDirectory = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const rootManifest = JSON.parse(
  await readFile(new URL("../../../../package.json", import.meta.url), "utf8"),
);
const minimumVue = /^\^(\d+\.\d+\.\d+)$/.exec(manifest.peerDependencies.vue)?.[1];
assert(minimumVue, "独立类型检查需要从 Vue peer dependency 中读取最低版本");

const packageManager = process.env.npm_execpath;
assert(packageManager, "请通过 pnpm verify:packages 运行独立类型检查");
const pnpmCommand = [".js", ".cjs", ".mjs"].includes(extname(packageManager))
  ? [process.execPath, packageManager]
  : [packageManager];

function run(command, args, cwd) {
  execFileSync(command[0], [...command.slice(1), ...args], {
    cwd,
    stdio: "inherit",
    timeout: 180_000,
  });
}

const scratchBase =
  process.platform === "win32" ? join(homedir(), "Documents", "Codex", "scratch-tests") : tmpdir();
await mkdir(scratchBase, { recursive: true });
const resolvedBase = await realpath(scratchBase);
const scratchDirectory = await mkdtemp(join(resolvedBase, "vue-history-consumer-"));

try {
  run(pnpmCommand, ["pack", "--out", join(scratchDirectory, "package.tgz")], packageDirectory);
  await writeFile(
    join(scratchDirectory, "package.json"),
    JSON.stringify({
      name: "workflow-vue-history-type-consumer",
      private: true,
      type: "module",
      packageManager: rootManifest.packageManager,
      dependencies: {
        [manifest.name]: "file:./package.tgz",
        vue: minimumVue,
      },
      devDependencies: {
        typescript: require("typescript/package.json").version,
      },
    }),
  );
  await writeFile(
    join(scratchDirectory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        types: [],
      },
      include: ["consumer.mts", "consumer.cts"],
    }),
  );
  const consumer = await readFile(new URL("./type-consumer.fixture", import.meta.url), "utf8");
  await Promise.all(
    ["consumer.mts", "consumer.cts"].map((entry) =>
      writeFile(join(scratchDirectory, entry), consumer),
    ),
  );
  run(pnpmCommand, ["install", "--ignore-scripts", "--no-frozen-lockfile"], scratchDirectory);
  run(
    [process.execPath],
    [join(scratchDirectory, "node_modules/typescript/bin/tsc"), "--project", "tsconfig.json"],
    scratchDirectory,
  );
  console.log(`独立安装的 ESM / CJS 声明在 Vue ${minimumVue} 下通过严格类型检查。`);
} finally {
  try {
    const resolvedDirectory = await realpath(scratchDirectory);
    assert.equal(
      dirname(resolvedDirectory),
      resolvedBase,
      "临时测试目录必须位于指定的测试根目录中",
    );
    assert.equal(resolve(resolvedDirectory), resolve(scratchDirectory), "临时测试目录不能重定向");
    assert(!(await lstat(scratchDirectory)).isSymbolicLink(), "拒绝清理链接目录");
    if (process.platform === "win32") {
      execFileSync(
        "pwsh.exe",
        [
          "-NoLogo",
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          String.raw`
            $ErrorActionPreference = 'Stop'
            $consumerPath = (Resolve-Path -LiteralPath $env:WORKFLOW_HISTORY_CONSUMER_DIRECTORY).Path
            $consumerBase = (Resolve-Path -LiteralPath $env:WORKFLOW_HISTORY_CONSUMER_BASE).Path
            if ((Split-Path -Parent $consumerPath) -ne $consumerBase) { throw '测试目录超出允许的清理范围' }
            if ((Get-Item -LiteralPath $consumerPath -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw '拒绝清理链接目录' }
            Remove-Item -LiteralPath $consumerPath -Recurse -Force
          `,
        ],
        {
          stdio: "inherit",
          env: {
            ...process.env,
            WORKFLOW_HISTORY_CONSUMER_DIRECTORY: resolvedDirectory,
            WORKFLOW_HISTORY_CONSUMER_BASE: resolvedBase,
          },
        },
      );
    } else {
      await rm(resolvedDirectory, { recursive: true, force: true });
    }
    console.log("已清理独立类型检查的临时项目。");
  } catch (error) {
    console.error(`独立类型检查的临时项目未能清理，遗留路径：${scratchDirectory}`);
    console.error(error);
    process.exitCode = 1;
  }
}
