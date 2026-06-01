import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureLocalDeps } from "./ensure-local-deps.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");
const entryFile = resolve(root, "src/code.ts");

function createDistManifest(sourceManifestText) {
  const manifest = JSON.parse(sourceManifestText);
  manifest.main = "code.js";
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

async function bundlePluginCode() {
  await ensureLocalDeps();
  const { build } = await import("esbuild");

  await build({
    entryPoints: [entryFile],
    outfile: resolve(distDir, "code.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2019"],
    charset: "utf8",
    sourcemap: false,
    treeShaking: true,
    logLevel: "info"
  });
}

async function writeDistManifest() {
  const rootManifestText = await readFile(resolve(root, "manifest.json"), "utf8");
  await writeFile(resolve(distDir, "manifest.json"), createDistManifest(rootManifestText), "utf8");
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await bundlePluginCode();
await writeDistManifest();
