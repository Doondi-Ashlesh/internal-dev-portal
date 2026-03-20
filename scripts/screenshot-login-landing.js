const { chromium } = require("playwright");

async function screenshot(url, name) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${name}-zoom1.png`, fullPage: true });

  await page.evaluate(() => {
    document.body.style.zoom = "1.25";
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${name}-zoom125.png`, fullPage: true });

  await page.evaluate(() => {
    document.body.style.zoom = "";
  });

  await browser.close();
}

async function main() {
  await screenshot("http://127.0.0.1:3000/login", "login");
  await screenshot("http://127.0.0.1:3000/", "landing");
  // eslint-disable-next-line no-console
  console.log("screenshots complete");
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exitCode = 1;
});

