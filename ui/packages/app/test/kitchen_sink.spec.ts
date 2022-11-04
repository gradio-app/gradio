import { test, expect, Page } from "@playwright/test";
import { BASE64_IMAGE, BASE64_AUDIO } from "./media_data";

function mock_demo(page: Page, demo: string) {
	return page.route("**/config", (route) => {
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			path: `../../../demo/${demo}/config.json`
		});
	});
}

function mock_api(page: Page, body: Array<unknown>) {
	return page.route("**/run/predict/", (route) => {
		const id = JSON.parse(route.request().postData()!).fn_index;
		return route.fulfill({
			headers: {
				"Access-Control-Allow-Origin": "*"
			},
			body: JSON.stringify({
				data: body[id]
			})
		});
	});
}

test("test inputs", async ({ page }) => {
	await mock_demo(page, "kitchen_sink");
	await page.goto("http://localhost:3000");

	const textbox = await page.getByLabel("Textbox").nth(0);
	await expect(textbox).toHaveValue("Lorem ipsum");

	await textbox.fill("hello world");
	await expect(textbox).toHaveValue("hello world");

	const textbox2 = await page.getByLabel("Textbox 2");
	await textbox2.fill("hello world");
	await expect(textbox2).toHaveValue("hello world");

	const number = await page.getByLabel("Number");
	await expect(number).toHaveValue("42");
	await number.fill("10");
	await expect(number).toHaveValue("10");

	// Image Input
	const image = await page.locator("input").nth(10);
	await image.setInputFiles("./test/files/cheetah1.jpg");

	const uploaded_image = await page.locator("img").nth(0);
	const image_data = await uploaded_image.getAttribute("src");
	await expect(image_data).toContain("cheetah1.jpg");

	// Image Input w/ Cropper
	const image_cropper = await page.locator("input").nth(10);
	await image_cropper.setInputFiles("./test/files/cheetah1.jpg");

	const uploaded_image_cropper = await page.locator("img").nth(0);
	const image_data_cropper = await uploaded_image_cropper.getAttribute("src");
	await expect(image_data_cropper).toContain("cheetah1.jpg");
});

test("test outputs", async ({ page }) => {
	await mock_demo(page, "kitchen_sink");

	await mock_api(page, [
		[
			"the quick brown fox, selected:foo, baz",
			{
				label: "negative",
				confidences: [
					{
						label: "negative",
						confidence: 0.46153846153846156
					},
					{
						label: "positive",
						confidence: 0.38461538461538464
					},
					{
						label: "neutral",
						confidence: 0.15384615384615385
					}
				]
			},
			BASE64_AUDIO,
			BASE64_IMAGE,
			{
				name: "worldt30a4ike.mp4",
				data: ""
			},
			[
				["The", "art"],
				["quick brown", "adj"],
				["fox", "nn"],
				["jumped", "vrb"],
				["testing testing testing", null],
				["over", "prp"],
				["the", "art"],
				["testing", null],
				["lazy", "adj"],
				["dogs", "nn"],
				[".", "punc"],
				["test 0", "test 0"],
				["test 1", "test 1"],
				["test 2", "test 2"],
				["test 3", "test 3"],
				["test 4", "test 4"],
				["test 5", "test 5"],
				["test 6", "test 6"],
				["test 7", "test 7"],
				["test 8", "test 8"],
				["test 9", "test 9"]
			],
			[
				["The testing testing testing", null],
				["over", 0.6],
				["the", 0.2],
				["testing", null],
				["lazy", -0.1],
				["dogs", 0.4],
				[".", 0],
				["test", -1],
				["test", -0.9],
				["test", -0.8],
				["test", -0.7],
				["test", -0.6],
				["test", -0.5],
				["test", -0.4],
				["test", -0.3],
				["test", -0.2],
				["test", -0.1],
				["test", 0],
				["test", 0.1],
				["test", 0.2],
				["test", 0.3],
				["test", 0.4],
				["test", 0.5],
				["test", 0.6],
				["test", 0.7],
				["test", 0.8],
				["test", 0.9]
			],
			{
				items: {
					item: [
						{
							id: "0001",
							type: null,
							is_good: false,
							ppu: 0.55,
							batters: {
								batter: [
									{
										id: "1001",
										type: "Regular"
									},
									{
										id: "1002",
										type: "Chocolate"
									},
									{
										id: "1003",
										type: "Blueberry"
									},
									{
										id: "1004",
										type: "Devil's Food"
									}
								]
							},
							topping: [
								{
									id: "5001",
									type: "None"
								},
								{
									id: "5002",
									type: "Glazed"
								},
								{
									id: "5005",
									type: "Sugar"
								},
								{
									id: "5007",
									type: "Powdered Sugar"
								},
								{
									id: "5006",
									type: "Chocolate with Sprinkles"
								},
								{
									id: "5003",
									type: "Chocolate"
								},
								{
									id: "5004",
									type: "Maple"
								}
							]
						}
					]
				}
			},
			"<button style='background-color: red'>Click Me: baz</button>"
		]
	]);

	await page.goto("http://localhost:3000");

	const submit_button = await page.locator("button", { hasText: /Submit/ });

	await Promise.all([
		submit_button.click(),
		page.waitForResponse("**/run/predict/")
	]);

	const textbox = await page.getByLabel("Textbox").nth(2);
	await expect(textbox).toHaveValue("the quick brown fox, selected:foo, baz");

	const label = await page.getByTestId("label");
	await expect(label).toContainText(`negative
    negative
    46%
    positive
    38%
    neutral
    15%`);

	const highlight_text_color_map = await page
		.getByTestId("highlighted-text")
		.nth(0);
	const highlight_text_legend = await page
		.getByTestId("highlighted-text")
		.nth(1);
	await expect(highlight_text_color_map).toContainText(
		"  HighlightedText  The art quick brown adj fox nn jumped vrb testing testing testing  over prp the art testing  lazy adj dogs nn . punc test 0 test 0 test 1 test 1 test 2 test 2 test 3 test 3 test 4 test 4 test 5 test 5 test 6 test 6 test 7 test 7 test 8 test 8 test 9 test 9"
	);
	await expect(highlight_text_legend).toContainText(
		"The testing testing testing over the testing lazy dogs . test test test test test test test test test test test test test test test test test test test test"
	);

	// const click_me_button =await page.locator("button", { hasText: /Click Me: baz/ });
	// click_me_button.click()

	const json = await page.locator("data-testid=json");
	await expect(json).toContainText(`{
        items:  {
        item:  [
        0:  {
        id:  "0001",
        type:  null,
        is_good:  false,
        ppu:  0.55,
        batters:  {
        batter:  expand 4 children
        },
        topping:  [
        0:  {+2 items} ,
        1:  {+2 items} ,
        2:  {+2 items} ,
        3:  {+2 items} ,
        4:  {+2 items} ,
        5:  {+2 items} ,
        6:  {+2 items}
        ]
        }
        ]
        }
        }`);

	const image = await page.locator("img").nth(0);
	const image_data = await image.getAttribute("src");
	await expect(image_data).toEqual(BASE64_IMAGE);

	const audio = await page.locator("audio").nth(0);
	const audio_data = await audio.getAttribute("src");
	await expect(audio_data).toEqual(BASE64_AUDIO);
});
