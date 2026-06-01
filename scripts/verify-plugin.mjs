import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function runStep(label, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    process.stdout.write(`\n[verify] ${label}\n`);
    const child = spawn(process.execPath, args, {
      cwd: root,
      stdio: "inherit"
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise(undefined);
        return;
      }
      rejectPromise(new Error(`${label} failed with exit code ${code || 1}`));
    });
  });
}

await runStep("repair local dependencies", ["./scripts/ensure-local-deps.mjs"]);
await runStep("build plugin", ["./scripts/build-plugin.mjs"]);
await runStep("typecheck", ["./node_modules/typescript/bin/tsc", "--noEmit"]);
await runStep("plugin runtime smoke test", ["./scripts/smoke-test-plugin-runtime.mjs"]);

process.stdout.write("\n[verify] all checks passed\n");
