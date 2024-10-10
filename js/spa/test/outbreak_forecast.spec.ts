import { test, expect, is_lite } from "@self/tootils";

test("selecting matplotlib should show matplotlib image and pressing clear should clear output", async ({
	page
}) => {
	await page.getByLabel("Plot Type").click();
	await page.getByRole("option", { name: "Matplotlib" }).click();
	await page.getByLabel("Month").click();
	await page.getByRole("option", { name: "January" }).click();
	await page.getByLabel("Social Distancing?").check();

	await page.click("text=Submit");

	const matplotlib_img = await page.getByTestId("matplotlib").getByRole("img");
	const matplotlib_img_data = await matplotlib_img.getAttribute("src");
	await expect(matplotlib_img_data).toBeTruthy();

	await page.getByRole("button", { name: "Clear" }).click();
	await expect(matplotlib_img).toHaveCount(0);
});

test("selecting plotly should show plotly plot and pressing clear should clear output", async ({
	page,
	browserName
}) => {
	test.fixme(
		browserName === "firefox" && is_lite,
		"Plotly component can't be located on Lite on FireFox in the CI env for some reason"
	);

	await page.getByLabel("Plot Type").click();
	await page.getByRole("option", { name: "Plotly" }).click();
	await page.getByLabel("Month").click();
	await page.getByRole("option", { name: "January" }).click();
	await page.getByLabel("Social Distancing?").check();

	await page.click("text=Submit");

	const plotly_plot = page.getByTestId("plotly");
	await expect(plotly_plot).toHaveCount(1);

	await page.getByRole("button", { name: "Clear" }).click();
	await expect(plotly_plot).toHaveCount(0);
});

test("selecting altair should show altair plot and pressing clear should clear output", async ({
	page
}) => {
	await page.getByLabel("Plot Type").click();
	await page.getByRole("option", { name: "altair" }).click();
	await page.getByLabel("Month").click();
	await page.getByRole("option", { name: "January" }).click();
	await page.getByLabel("Social Distancing?").check();

	await page.click("text=Submit");

	const altair = page.getByTestId("altair");
	await expect(altair).toHaveCount(1);

	await page.getByRole("button", { name: "Clear" }).click();
	await expect(altair).toHaveCount(0);
});

test("selecting bokeh should show bokeh plot and pressing clear should clear output", async ({
	page
}) => {
	await page.getByLabel("Plot Type").click();
	await page.getByRole("option", { name: "bokeh" }).click();
	await page.getByLabel("Month").click();
	await page.getByRole("option", { name: "January" }).click();
	await page.getByLabel("Social Distancing?").check();

	await page.click("text=Submit");

	const altair = page.getByTestId("bokeh");
	await expect(altair).toHaveCount(1);

	await page.getByRole("button", { name: "Clear" }).click();
	await expect(altair).toHaveCount(0);
});

test("switching between all 4 plot types and pressing submit should update output component to corresponding plot type", async ({
	page,
	browserName
}) => {
	test.fixme(
		browserName === "firefox" && is_lite,
		"Plotly component can't be located on Lite on FireFox in the CI env for some reason"
	);

	//Matplotlib
	await page.getByLabel("Plot Type").click();
	await page.getByRole("option", { name: "Matplotlib" }).click();
	await page.getByLabel("Month").click();
	await page.getByRole("option", { name: "January" }).click();
	await page.getByLabel("Social Distancing?").check();

	await page.click("text=Submit");

	const matplotlib_img = await page.getByTestId("matplotlib").getByRole("img");
	const matplotlib_img_data = await matplotlib_img.getAttribute("src");
	await expect(matplotlib_img_data).toBeTruthy();

	//Plotly
	await page.getByLabel("Plot Type").click();
	await page.getByRole("option", { name: "Plotly" }).click();

	await page.click("text=Submit");
	const plotly = page.getByTestId("plotly");
	await expect(plotly).toHaveCount(1);

	//Altair
	await page.getByLabel("Plot Type").click();
	await page.getByRole("option", { name: "Altair" }).click();

	await page.click("text=Submit");
	const altair = await page.getByTestId("altair");
	await expect(altair).toHaveCount(1);

	//Bokeh
	await page.getByLabel("Plot Type").click();
	await page.getByRole("option", { name: "Bokeh" }).click();

	await page.click("text=Submit");
	const bokeh = await page.getByTestId("bokeh");
	await expect(bokeh).toHaveCount(1);
});
