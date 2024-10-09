import { test, expect } from "@self/tootils";

test("test inputs", async ({ page, browser }) => {
	const context = await browser.newContext({
		permissions: ["camera"]
	});
	context.grantPermissions(["camera"]);

	const textbox = await page.getByLabel("Textbox").nth(0);
	await expect(textbox).toHaveValue("Lorem ipsum");

	await textbox.fill("hello world");
	await expect(textbox).toHaveValue("hello world");

	const textbox2 = await page.getByLabel("Textbox 2");
	await textbox2.fill("hello world");
	await expect(textbox2).toHaveValue("hello world");

	const number = await page.getByLabel("Number").first();
	await expect(number).toHaveValue("42");
	await number.fill("10");
	await expect(number).toHaveValue("10");

	// Image Input
	const image = page.getByTestId("image").nth(0).locator("input");
	await image.setInputFiles("./test/files/cheetah1.jpg");

	const uploaded_image = await page.locator("img").nth(0);
	const image_data = await uploaded_image.getAttribute("src");
	await expect(image_data).toBeTruthy();

	// Image Input w/ Webcam
	await page.getByRole("button", { name: "Click to Access Webcam" }).click();
	await page.getByRole("button", { name: "select input source" }).click();
	expect(await page.getByText("fake_device_0")).toBeTruthy();
});

test("test outputs", async ({ page }) => {
	const submit_button = await page.locator("button", { hasText: /Submit/ });

	await submit_button.click();

	const textbox = await page.getByLabel("Textbox").nth(2);
	await expect(textbox).toHaveValue(", selected:foo, bar");

	const label = await page.getByTestId("label");
	await expect(label).toContainText(
		`  Label positive  positive  74%  negative  26%  neutral  0%`
	);

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

	const json = await page.locator("data-testid=json");
	await expect(json).toContainText(
		`{     "items": {     "item": [     "0": { Object(6) }    "id": "0001" ,   "type": null ,   "is_good": false ,   "ppu": 0.55 ,   "batters": { Object(1) } ,   "batter": [ Array(4) ]    "0": { Object(2) } ,   "id": "1001" ,   "type": "Regular"    } ,  "1": { Object(2) } ,   "id": "1002" ,   "type": "Chocolate"    } ,  "2": { Object(2) } ,   "id": "1003" ,   "type": "Blueberry"    } ,  "3": { Object(2) }    "id": "1004" ,   "type": "Devil's Food"    }   ]   } ,  "topping": [ Array(7) ]    "0": { Object(2) } ,   "id": "5001" ,   "type": "None"    } ,  "1": { Object(2) } ,   "id": "5002" ,   "type": "Glazed"    } ,  "2": { Object(2) } ,   "id": "5005" ,   "type": "Sugar"    } ,  "3": { Object(2) } ,   "id": "5007" ,   "type": "Powdered Sugar"    } ,  "4": { Object(2) } ,   "id": "5006" ,   "type": "Chocolate with Sprinkles"    } ,  "5": { Object(2) } ,   "id": "5003" ,   "type": "Chocolate"    } ,  "6": { Object(2) }    "id": "5004" ,   "type": "Maple"    }   ]   }   ]   }   } `
	);

	const image = page.locator("#output-img img");
	const image_data = await image.getAttribute("src");
	expect(image_data).toBeTruthy();

	const audio = page.getByTestId("unlabelled-audio");
	expect(audio).toBeTruthy();

	const controls = page.getByTestId("waveform-controls");
	await expect(controls).toBeVisible();
});
