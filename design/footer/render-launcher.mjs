// Renders each board in footer-launcher.html to a PNG next to it.
// Usage: node design/footer/render-launcher.mjs
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const dir = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1900, height: 1200 },
  deviceScaleFactor: 2,
});
await page.goto(pathToFileURL(path.join(dir, "footer-launcher.html")).href);
await page.evaluate(() => document.fonts.ready);
const ids = await page.$$eval("section.board", (els) => els.map((e) => e.id));
for (const id of ids) {
  await page
    .locator(`#${id}`)
    .screenshot({ path: path.join(dir, `${id}.png`) });
}
await browser.close();
console.log(ids.join("\n"));
