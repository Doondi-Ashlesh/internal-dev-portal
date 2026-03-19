const { PrismaClient } = require("@prisma/client");
const { assertDemoSeedAllowed } = require("./seed-guard");
const { runSeed } = require("./seed-data");

async function main() {
  if (!assertDemoSeedAllowed("prisma/seed-if-empty.js")) {
    return;
  }

  const prisma = new PrismaClient();

  try {
    const workspaceCount = await prisma.workspace.count();

    if (workspaceCount > 0) {
      console.log(`Skipping demo seed because ${workspaceCount} workspace record(s) already exist.`);
      return;
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
    return;
  } finally {
    await prisma.$disconnect();
  }

  await runSeed({ reset: false });
}

main();
