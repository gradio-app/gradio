import { test, expect } from "@self/tootils";

test("3D node renders an uploaded model and owns its own drag", async ({
	page
}) => {
	const loader_warnings: string[] = [];
	page.on("console", (msg) => {
		if (msg.text().includes("Unable to find a plugin"))
			loader_warnings.push(msg.text());
	});

	await page.getByRole("button", { name: "Workflow" }).click();

	// The graph loads after a default canvas, so wait for the 3D node itself.
	const drop = page.getByRole("button", { name: /Drop model3d here/ });
	const [chooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		drop.getByRole("button", { name: "Upload", exact: true }).click()
	]);
	await chooser.setFiles("../../gradio/media_assets/models3d/Duck.glb");

	const viewer = page.getByTestId("model3d");
	const canvas = viewer.locator("canvas");
	await expect(canvas).toBeVisible();

	const node = page.locator(".node-pos-wrap").first();
	const before = await node.boundingBox();
	const box = (await canvas.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2);
	await page.mouse.up();
	expect(await node.boundingBox()).toEqual(before);

	// The viewer exposes no "loaded" signal, so give the loader time to warn.
	await page.waitForTimeout(1000);
	expect(loader_warnings).toEqual([]);
});
