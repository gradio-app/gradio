import { test, expect } from "@gradio/tootils";

test("text input by a user should be shown in the chatbot as a paragraph", async ({
	page
}) => {
	const textbox = await page.getByTestId("textbox");
	await textbox.fill("Lorem ipsum");
	await page.keyboard.press("Enter");
	const user_message = await page
		.getByTestId("user")
		.first()
		.getByRole("paragraph")
		.textContent();
	const bot_message = await page
		.getByTestId("bot")
		.first()
		.getByRole("paragraph")
		.textContent();
	await expect(user_message).toEqual("Lorem ipsum");
	await expect(bot_message).toBeTruthy();
});

test("images uploaded by a user should be shown in the chat", async ({
	page
}) => {
	const fileChooserPromise = page.waitForEvent("filechooser");
	await page.getByRole("button", { name: "📁" }).click();
	const fileChooser = await fileChooserPromise;
	await fileChooser.setFiles("./test/files/cheetah1.jpg");
	await page.keyboard.press("Enter");

	const user_message = await page.getByTestId("user").first().getByRole("img");
	const bot_message = await page
		.getByTestId("bot")
		.first()
		.getByRole("paragraph")
		.textContent();
	const image_data = await user_message.getAttribute("src");
	await expect(image_data).toContain("cheetah1.jpg");
	await expect(bot_message).toBeTruthy();
});

test("audio uploaded by a user should be shown in the chatbot", async ({
	page
}) => {
	const fileChooserPromise = page.waitForEvent("filechooser");
	await page.getByRole("button", { name: "📁" }).click();
	const fileChooser = await fileChooserPromise;
	await fileChooser.setFiles("../../test/test_files/audio_sample.wav");
	await page.keyboard.press("Enter");

	const user_message = await page.getByTestId("user").first().locator("audio");
	const bot_message = await page
		.getByTestId("bot")
		.first()
		.getByRole("paragraph")
		.textContent();
	const audio_data = await user_message.getAttribute("src");
	await expect(audio_data).toContain("audio_sample.wav");
	await expect(bot_message).toBeTruthy();
});

test("videos uploaded by a user should be shown in the chatbot", async ({
	page
}) => {
	const fileChooserPromise = page.waitForEvent("filechooser");
	await page.getByRole("button", { name: "📁" }).click();
	const fileChooser = await fileChooserPromise;
	await fileChooser.setFiles("../../test/test_files/video_sample.mp4");
	await page.keyboard.press("Enter");

	const user_message = await page.getByTestId("user").first().locator("video");
	const bot_message = await page
		.getByTestId("bot")
		.first()
		.getByRole("paragraph")
		.textContent();
	const video_data = await user_message.getAttribute("src");
	await expect(video_data).toContain("video_sample.mp4");
	await expect(bot_message).toBeTruthy();
});

test("markdown input by a user should be correctly formatted: bold, italics, links", async ({
	page
}) => {
	const textbox = await page.getByTestId("textbox");
	await textbox.fill(
		"This is **bold text**. This is *italic text*. This is a [link](https://gradio.app)."
	);
	await page.keyboard.press("Enter");
	const user_message = await page
		.getByTestId("user")
		.first()
		.getByRole("paragraph")
		.innerHTML();
	const bot_message = await page
		.getByTestId("bot")
		.first()
		.getByRole("paragraph")
		.textContent();
	await expect(user_message).toEqual(
		'This is <strong>bold text</strong>. This is <em>italic text</em>. This is a <a href="https://gradio.app" target="_blank" rel="noopener noreferrer">link</a>.'
	);
	await expect(bot_message).toBeTruthy();
});

test("inline code markdown input by the user should be correctly formatted", async ({
	page
}) => {
	const textbox = await page.getByTestId("textbox");
	await textbox.fill("This is `code`.");
	await page.keyboard.press("Enter");
	const user_message = await page
		.getByTestId("user")
		.first()
		.getByRole("paragraph")
		.innerHTML();
	const bot_message = await page
		.getByTestId("bot")
		.first()
		.getByRole("paragraph")
		.textContent();
	await expect(user_message).toEqual("This is <code>code</code>.");
	await expect(bot_message).toBeTruthy();
});

test("markdown code blocks input by a user should be rendered correctly with the correct language tag", async ({
	page
}) => {
	const textbox = await page.getByTestId("textbox");
	await textbox.fill("```python\nprint('Hello')\nprint('World!')\n```");
	await page.keyboard.press("Enter");
	const user_message = await page
		.getByTestId("user")
		.first()
		.locator("pre")
		.innerHTML();
	const bot_message = await page
		.getByTestId("bot")
		.first()
		.getByRole("paragraph")
		.textContent();
	await expect(user_message).toContain("language-python");
	await expect(bot_message).toBeTruthy();
});

test("LaTeX input by a user should be rendered correctly", async ({ page }) => {
	const textbox = await page.getByTestId("textbox");
	await textbox.fill("This is LaTeX $$x^2$$");
	await page.keyboard.press("Enter");
	const user_message = await page
		.getByTestId("user")
		.first()
		.getByRole("paragraph")
		.innerHTML();
	const bot_message = await page
		.getByTestId("bot")
		.first()
		.getByRole("paragraph")
		.textContent();
	await expect(user_message).toContain("katex-display");
	await expect(bot_message).toBeTruthy();
});

test("when a new message is sent the chatbot should scroll to the latest message", async ({
	page
}) => {
	const textbox = await page.getByTestId("textbox");
	const line_break = "<br>";
	await textbox.fill(line_break.repeat(30));
	await page.keyboard.press("Enter");
	const bot_message = await page
		.getByTestId("bot")
		.first()
		.getByRole("paragraph");
	await expect(bot_message).toBeVisible();
	const bot_message_text = bot_message.textContent();
	await expect(bot_message_text).toBeTruthy();
});
