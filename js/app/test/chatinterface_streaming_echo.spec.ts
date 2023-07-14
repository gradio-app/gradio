import { test, expect } from "@gradio/tootils";

test("chatinterface works with streaming functions", async ({
	page
}) => {
	let last_iteration;

	const submit_button = await page.locator("button").nth(0);
	const textbox = await page.getByTestId("textbox");
	textbox.fill("hello");

	page.on("websocket", (ws) => {
		last_iteration = ws.waitForEvent("framereceived", {
			predicate: (event) => {
				return JSON.parse(event.payload as string).msg === "process_completed";
			}
		});
	});

	await submit_button.click();

	await last_iteration;
	await expect(textbox).toHaveValue("hello");
});

test("the buttons in chatinterface work as expected", async ({
	page
}) => {
	
});
