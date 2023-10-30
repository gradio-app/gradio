import { test, expect } from "@gradio/tootils";
import { BASE64_IMAGE } from "./media_data";

test.skip("test inputs", async ({ page }) => {
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

test.skip("test outputs", async ({ page }) => {
	const submit_button = await page.locator("button", { hasText: /Submit/ });

	await Promise.all([
		submit_button.click(),
		page.waitForResponse("**/run/predict")
	]);

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
	await expect(image_data).toContain(
		"gradio/d0a3c81692e072d119e2c665defbd47ce4d3b89a/cheetah1.jpg"
	);

	const audio = await page.getByTestId("unlabelled-audio");
	expect(audio).toBeTruthy();

	const controls = await page.getByTestId("waveform-controls");
	expect(controls).toBeVisible();
});
