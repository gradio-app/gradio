// Renders the launcher in each shape from footer-launcher.html:
// launcher-shapes.png compares every state, and shapes/<shape>/ holds each
// board of the launcher redrawn in that shape.
// Usage: node design/footer/render-shapes.mjs
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const dir = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(dir, "footer-launcher.html")).href;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1900, height: 1200 },
  deviceScaleFactor: 2,
});
async function shoot(query, out) {
  await page.goto(`${url}?${query}`);
  await page.evaluate(() => document.fonts.ready);
  const ids = await page.$$eval("section.board", (els) => els.map((e) => e.id));
  for (const id of ids) {
    mkdirSync(out, { recursive: true });
    await page
      .locator(`#${id}`)
      .screenshot({ path: path.join(out, `${id}.png`) });
  }
}
await shoot("board=shapes", dir);
for (const shape of ["squircle", "tab", "diamond"]) {
  await shoot(`shape=${shape}`, path.join(dir, "shapes", shape));
}
await browser.close();
