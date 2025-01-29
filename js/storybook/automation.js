import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();

	await page.goto("http://localhost:7860");

	await page.getByLabel("Show Layers").click();
	await page.waitForTimeout(500);

	await page.getByLabel("layer-1").click();
	await page.waitForTimeout(500);

	const drawButton = page.getByLabel("Draw button").first();
	await drawButton.click();

	// Drawing interactions
	await page.mouse.move(300, 100);
	await page.mouse.down();
	await page.mouse.move(300, 300);
	await page.waitForTimeout(300);

	await page.mouse.move(100, 100);
	await page.mouse.down();
	await page.waitForTimeout(500);
	await page.mouse.up();

	await drawButton.click();
	await page.waitForTimeout(300);
	const color = page.locator("menu > button").nth(1);
	console.log(color);
	await color.click();
	await page.mouse.move(300, 100);
	await page.mouse.down();
	await page.mouse.move(100, 100);

	await page.getByRole("button", { name: "Get" }).click();
	await page.waitForTimeout(3000);
	await browser.close();
})();
