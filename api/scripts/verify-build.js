// Runs automatically after every build (see package.json "postbuild").
// Render (and other hosts) can report a build as "successful" even when
// the actual compiled entry point is missing — e.g. if devDependencies
// like typescript/tsc-alias got skipped because NODE_ENV=production was
// set during `npm install`, silently producing an empty/partial dist/.
// This turns that into a loud, immediate build failure with a clear
// explanation, instead of a confusing crash on the FIRST request at
// runtime with no obvious cause.
const fs = require("fs");
const path = require("path");

const entry = path.join(__dirname, "..", "dist", "server.js");

if (!fs.existsSync(entry)) {
  console.error("");
  console.error("========================================================");
  console.error("BUILD VERIFICATION FAILED");
  console.error(`Expected compiled entry point at: ${entry}`);
  console.error("...but it does not exist.");
  console.error("");
  console.error("This almost always means devDependencies were not");
  console.error("installed (typescript / tsc-alias live in devDependencies,");
  console.error("and are required to produce dist/). Common cause: your");
  console.error("host sets NODE_ENV=production during the build, which");
  console.error('makes "npm install" skip devDependencies by default.');
  console.error("");
  console.error("Fix: change your build command to:");
  console.error("  npm install --include=dev && npm run build");
  console.error("========================================================");
  process.exit(1);
}

console.log(`Build verified: ${entry} exists.`);