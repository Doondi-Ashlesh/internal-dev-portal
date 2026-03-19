function isDemoSeedAllowed() {
  return process.argv.includes("--allow-demo-seed") || process.env.ALLOW_DEMO_SEEDING === "1";
}

function assertDemoSeedAllowed(scriptName) {
  if (isDemoSeedAllowed()) {
    return true;
  }

  console.error(
    `${scriptName} creates demo workspace data and is disabled by default. ` +
      "Use an explicit demo seed command in dev or CI, or pass --allow-demo-seed."
  );
  process.exitCode = 1;
  return false;
}

module.exports = {
  assertDemoSeedAllowed
};
