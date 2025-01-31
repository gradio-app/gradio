import { chromium } from "playwright";

(async () => {
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();

	await page.goto("http://localhost:7860");

	await page.getByLabel("Show Layers").click();
	await page.waitForTimeout(500);

	await page.getByLabel("layer-1").click();
	await page.waitForTimeout(500);

	const draw_button = page.getByLabel("Draw button").first();
	await draw_button.click();

	await page.mouse.move(300, 100);
	await page.mouse.down();
	await page.mouse.move(300, 300);
	await page.waitForTimeout(300);

	await page.mouse.move(100, 100);
	await page.mouse.down();
	await page.waitForTimeout(500);
	await page.mouse.up();

	await draw_button.click();
	await page.waitForTimeout(300);
	const color = page.locator("menu > button").nth(1);
	await color.click();
	await page.mouse.move(300, 100);
	await page.mouse.down();
	await page.mouse.move(100, 100);

	await page.getByLabel("Transform button").click();
	await page.waitForTimeout(300);
	const right_handle = page.locator(".handle.corner.r");
	const rectangle = await right_handle.boundingBox();

	//@ts-ignore
	await page.mouse.move(rectangle.x, rectangle.y);
	await page.mouse.down();
	//@ts-ignore
	await page.mouse.move(rectangle.x - 100, rectangle.y, { steps: 25 });
	await page.mouse.up();
	await page.waitForTimeout(500);

	await page.getByRole("button", { name: "Get" }).click();
	await page.waitForTimeout(7000);
	await browser.close();
})();
