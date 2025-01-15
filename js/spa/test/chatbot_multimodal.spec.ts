import { test, expect, go_to_testcase } from "@self/tootils";

for (const msg_format of ["tuples", "messages"]) {
	test(`message format ${msg_format} - text input by a user should be shown in the chatbot as a paragraph`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
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

	test(`message format ${msg_format} - images uploaded by a user should be shown in the chat`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
		const fileChooserPromise = page.waitForEvent("filechooser");
		await page.getByTestId("upload-button").click();
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles("./test/files/cheetah1.jpg");
		await expect(page.locator(".thumbnail-item")).toBeVisible();
		await page.getByTestId("textbox").click();
		await page.keyboard.press("Enter");

		const user_message_locator = await page.getByTestId("user").first();
		const user_message = await user_message_locator.elementHandle();
		if (user_message) {
			const imageContainer = await user_message.$("div.image-container");

			if (imageContainer) {
				const imgElement = await imageContainer.$("img");
				if (imgElement) {
					const image_src = await imgElement.getAttribute("src");
					expect(image_src).toBeTruthy();
				}
			}
		}

		const bot_message = await page
			.getByTestId("bot")
			.first()
			.getByRole("paragraph")
			.textContent();

		expect(bot_message).toBeTruthy();
	});

	test(`message format ${msg_format} - audio uploaded by a user should be shown in the chatbot`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
		const fileChooserPromise = page.waitForEvent("filechooser");
		await page.getByTestId("upload-button").click();
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles("../../test/test_files/audio_sample.wav");
		await expect(page.locator(".thumbnail-item")).toBeVisible();
		await page.getByTestId("textbox").click();
		await page.keyboard.press("Enter");

		const bot_message = await page
			.getByTestId("bot")
			.first()
			.getByRole("paragraph")
			.textContent();

		await expect(
			page.getByTestId("user").getByTestId("unlabelled-audio")
		).toBeVisible();
		expect(bot_message).toBeTruthy();
	});

	test(`message format ${msg_format} - videos uploaded by a user should be shown in the chatbot`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
		const fileChooserPromise = page.waitForEvent("filechooser");
		await page.getByTestId("upload-button").click();
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles("../../test/test_files/video_sample.mp4");
		await expect(page.locator(".thumbnail-item")).toBeVisible();
		await page.getByTestId("textbox").click();
		await page.keyboard.press("Enter");

		const user_message = await page
			.getByTestId("user")
			.first()
			.locator("video");
		const bot_message = await page
			.getByTestId("bot")
			.first()
			.getByRole("paragraph")
			.textContent();
		const video_data = await user_message.getAttribute("src");
		await expect(video_data).toBeTruthy();
		await expect(bot_message).toBeTruthy();
	});

	test(`message format ${msg_format} - markdown input by a user should be correctly formatted: bold, italics, links`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
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

	test(`message format ${msg_format} - inline code markdown input by the user should be correctly formatted`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
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

	test(`message format ${msg_format} - markdown code blocks input by a user should be rendered correctly with the correct language tag`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
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

	test(`message format ${msg_format} - LaTeX input by a user should be rendered correctly`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
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

	test(`message format ${msg_format} - when a new message is sent the chatbot should scroll to the latest message`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
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

	test(`message format ${msg_format} - chatbot like and dislike functionality`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
		await page.getByTestId("textbox").click();
		await page.getByTestId("textbox").fill("hello");
		await page.keyboard.press("Enter");
		await expect(
			page.getByTestId("bot").first().getByRole("paragraph")
		).toBeVisible();
		await page.getByLabel("like", { exact: true }).first().click();
		await page.getByLabel("dislike", { exact: true }).first().click();

		expect(await page.getByLabel("clicked dislike").count()).toEqual(1);
		expect(await page.getByLabel("clicked like").count()).toEqual(0);
	});

	test(`message format ${msg_format} - Users can upload multiple images and they will be shown as thumbnails`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}

		const fileChooserPromise = page.waitForEvent("filechooser");
		await page.getByTestId("upload-button").click();
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles([
			"./test/files/cheetah1.jpg",
			"./test/files/cheetah1.jpg"
		]);

		await expect(page.locator(".thumbnail-image")).toHaveCount(2);
	});

	test(`message format ${msg_format} - pasting large text should create a file upload`, async ({
		page
	}) => {
		if (msg_format === "tuples") {
			await go_to_testcase(page, "tuples");
		}
		const textbox = await page.getByTestId("textbox");
		const largeText = "x".repeat(2000);

		await textbox.focus();
		await page.evaluate((text) => {
			const dataTransfer = new DataTransfer();
			const clipboardData = new ClipboardEvent("paste", {
				clipboardData: dataTransfer,
				bubbles: true,
				cancelable: true
			});
			dataTransfer.setData("text/plain", text);
			document.activeElement?.dispatchEvent(clipboardData);
		}, largeText);

		await expect(page.locator(".thumbnail-item")).toBeVisible();
		const fileIcon = await page.locator(".thumbnail-item").first();
		await expect(fileIcon).toBeVisible();

		const textboxValue = await textbox.inputValue();
		await expect(textboxValue).toBe("");
	});
}
