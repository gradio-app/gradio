import { test, expect, getByLabelText } from "@gradio/tootils";
import type { Response } from "@playwright/test";

test("gr.ClearButton clears every component's value", async ({
	page
}) => {

	// [...Array(23).keys()].forEach((value) => {
	// 	const comp = page.getByLabel(`Component_${value}`)
	// 	const comp_val = comp.inputValue();

	// })
	await page.click("text=Clear");
	expect(await page.getByLabel("component_00").inputValue()).toBe("");
	expect(await page.getByLabel("component_01").inputValue()).toBe("");
	expect(await page.getByLabel("component_02").inputValue()).toBe("0");
	expect(await page.getByLabel("component_03").inputValue()).toBe("0");
	// These two are checkbox and checkbox group
	expect(await page.getByLabel("component_04").isChecked()).toBeFalsy();
	//expect(await page.getByLabel("component_05").getByRole("checkbox").first().isChecked()).toBeFalsy();
	//expect(await page.getByLabel("component_06").inputValue()).toBeFalsy();
	expect(await page.getByLabel("component_07").inputValue()).toBeFalsy();
	expect(await page.getByTestId('image-icon').count()).toEqual(4);
	expect(await page.getByTestId('music-icon').count()).toEqual(2);
	//expect(await page.getByTestId('json-icon').count()).toEqual(2);

	expect(await page.getByTestId('plot-icon').count()).toEqual(2);








	// [...Array(23).keys()].forEach(async (value) => {
	// 	const label = value < 10 ? `component_0${value}` : `component_${value}`
	// 	const comp = page.getByLabel(label);
	// 	const comp_val = await comp.inputValue();
	// 	console.log(`${value}: ${[comp_val]} ${!comp_val}`);
	// 	//expect(comp_val).toBeFalsy();
	// })
	//expect(await page.getByLabel(`component_0${ 1}`).inputValue()).toBeFalsy();

	// [...Array(1, 23).keys()].forEach((value) => {
	// 	const comp = page.getByLabel(`Component_${ value }`)
	// 	expect(comp.).();
	// })

	// const textbox = page.getByLabel("Result");
	// await expect(textbox).toHaveValue("");

	// await Promise.all([
	// 	page.waitForResponse("**/run/predict"),
	// 	page.click("text=Trigger Failure")
	// ]);
	// expect(textbox).toHaveValue("");

	// await Promise.all([
	// 	page.click("text=Trigger Success"),
	// 	page.waitForResponse("**/run/predict")
	// ]);

	// expect(textbox).toHaveValue("Success event triggered");
});

