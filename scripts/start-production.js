const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const standaloneServer = path.join(rootDir, ".next", "standalone", "server.js");
const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");

const args = fs.existsSync(standaloneServer) ? [standaloneServer] : [nextBin, "start"];

if (!fs.existsSync(standaloneServer)) {
  console.warn("Standalone server artifact not found at .next/standalone/server.js; falling back to `next start` for this local runtime.");
}

const child = spawn(process.execPath, args, {
  cwd: rootDir,
  env: process.env,
  stdio: "inherit"
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
