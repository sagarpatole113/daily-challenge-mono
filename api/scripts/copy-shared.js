// Copies shared/src into api/src/shared before compiling, so the shared
// types become a normal local module inside the API's own rootDir instead
// of a sibling directory tsc can't cleanly emit output for. This makes
// api/ fully self-contained for deployment (Render, Docker, etc.) without
// needing npm workspaces or a monorepo-aware build tool. Safe to re-run —
// always wipes and re-copies fresh.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "..", "shared", "src");
const dest = path.join(__dirname, "..", "src", "shared");

if (!fs.existsSync(src)) {
  console.error(`copy-shared: source not found at ${src}`);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });

console.log(`copy-shared: ${src} -> ${dest}`);