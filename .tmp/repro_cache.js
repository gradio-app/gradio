const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console:${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    errors.push(err.stack || err.message);
  });
  await page.goto('http://127.0.0.1:7861', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Classify' }).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Classify' }).click();
  await page.waitForTimeout(1500);
  console.log('error_count', errors.length);
  if (errors.length) console.log(errors.slice(0, 5).join('\n---\n'));
  await browser.close();
})();
