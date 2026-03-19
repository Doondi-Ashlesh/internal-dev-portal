const { assertDemoSeedAllowed } = require("./seed-guard");
const { runSeed } = require("./seed-data");

if (assertDemoSeedAllowed("prisma/seed.js")) {
  runSeed({ reset: true });
}
