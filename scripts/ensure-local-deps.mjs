import { access, lstat, rm, symlink } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const localNodeModules = resolve(root, "node_modules");
const requiredPackages = ["typescript", "esbuild"];

async function pathExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch (error) {
    void error;
    return false;
  }
}

async function pathEntryExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    void error;
    return false;
  }
}

async function hasRequiredPackages(nodeModulesPath) {
  for (const pkg of requiredPackages) {
    if (!(await pathExists(resolve(nodeModulesPath, pkg)))) {
      return false;
    }
  }
  return true;
}

function getCandidateNodeModules() {
  return [resolve(root, "..", "figma-ui-design-review-plugin", "node_modules")];
}

export async function ensureLocalDeps() {
  if (await hasRequiredPackages(localNodeModules)) {
    return localNodeModules;
  }

  const localExists = await pathEntryExists(localNodeModules);
  if (localExists) {
    const stat = await lstat(localNodeModules);
    if (stat.isSymbolicLink()) {
      await rm(localNodeModules, { force: true });
    } else {
      throw new Error("当前插件的 node_modules 不完整，且不是可自动修复的软链接。");
    }
  }

  for (const candidate of getCandidateNodeModules()) {
    if (await hasRequiredPackages(candidate)) {
      await symlink(candidate, localNodeModules, "dir");
      return localNodeModules;
    }
  }

  throw new Error("未找到可复用的依赖目录，请先安装依赖或保留现有插件的 node_modules。");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const linkedPath = await ensureLocalDeps();
  process.stdout.write(`Using dependencies from: ${linkedPath}\n`);
}
