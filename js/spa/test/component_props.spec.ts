import { test, expect } from "@self/tootils";

test("component props", async ({ page }) => {
	const numberInput = page.getByLabel("Input A");
	const outputJson = page.locator("#output");
	const showValueBtn = page.getByRole("button", { name: "Show Value" });
	const doubleBtn = page.getByRole("button", {
		name: "Double Value and Maximum"
	});
	const resetBtn = page.getByRole("button", { name: "Reset", exact: true });

	await expect(numberInput).toHaveValue("5");

	await showValueBtn.click();
	await expect(outputJson).toContainText('"value": 5');
	await expect(outputJson).toContainText('"maximum": 10');
	await expect(outputJson).toContainText('"minimum": 0');

	await doubleBtn.click();

	await expect(numberInput).toHaveValue("10");
	await expect(outputJson).toContainText('"value": 10');
	await expect(outputJson).toContainText('"maximum": 20');
	await expect(outputJson).toContainText('"minimum": 0');

	await doubleBtn.click();
	await expect(numberInput).toHaveValue("20");
	await expect(outputJson).toContainText('"value": 20');
	await expect(outputJson).toContainText('"maximum": 40');

	await resetBtn.click();
	await expect(outputJson).toContainText('"value": 5');
	await expect(outputJson).toContainText('"maximum": 10');
	await expect(outputJson).toContainText('"minimum": 0');

	await numberInput.fill("7");
	await showValueBtn.click();

	await expect(outputJson).toContainText('"value": 7');
	await expect(outputJson).toContainText('"maximum": 10');
	await expect(outputJson).toContainText('"minimum": 0');

	const imageOutputJson = page.locator("#image-output");
	const showImagePropsBtn = page.getByRole("button", {
		name: "Show Image Props"
	});
	const changeImageSizeBtn = page.getByRole("button", {
		name: "Change Image Size"
	});
	const resetImageBtn = page.getByRole("button", {
		name: "Reset Image"
	});

	await showImagePropsBtn.click();
	await expect(imageOutputJson).toContainText('"width": 300');
	await expect(imageOutputJson).toContainText('"height": 300');
	await expect(imageOutputJson).toContainText('"type": "filepath"');
	await expect(imageOutputJson).toContainText("cheetah.jpg");

	await changeImageSizeBtn.click();
	await expect(imageOutputJson).toContainText('"width": 400');
	await expect(imageOutputJson).toContainText('"height": 400');

	await resetImageBtn.click();
	await expect(imageOutputJson).toContainText('"width": 300');
	await expect(imageOutputJson).toContainText('"height": 300');
	await expect(imageOutputJson).toContainText("cheetah.jpg");

	const modelCanvas = page.locator("#model3d-props canvas");
	const modelOutputJson = page.locator("#model3d-output");
	const showModelPropsBtn = page.getByRole("button", {
		name: "Show Model3D Props"
	});
	const resetModelCameraBtn = page.getByRole("button", {
		name: "Reset Model3D Camera"
	});

	await expect(modelCanvas).toBeVisible();
	await showModelPropsBtn.click();
	await expect(modelOutputJson).toContainText('"static_exact"');
	const initialModelProps = await modelOutputJson.textContent();

	// Moving the camera reports the new position back up to the backend. Polling
	// also establishes that the viewer is live, which the canvas being visible
	// does not: it mounts well before Babylon has initialised.
	await expect
		.poll(
			async () => {
				await modelCanvas.hover();
				await page.mouse.wheel(0, 200);
				await showModelPropsBtn.click();
				return modelOutputJson.textContent();
			},
			{ timeout: 15_000 }
		)
		.not.toBe(initialModelProps);

	// A position set from the backend has to reach the camera and survive
	// verbatim. `30` is deliberate: it does not survive a degrees -> radians ->
	// degrees round trip, so a reported-back value would read 29.999999999999996.
	// The editable model additionally covers the upload variant of the component
	// and display_mode="point_cloud", neither of which applied camera_position.
	await resetModelCameraBtn.click();
	await showModelPropsBtn.click();
	await expect(modelOutputJson).toContainText('"static_exact": true');
	await expect(modelOutputJson).toContainText('"editable_exact": true');
});
