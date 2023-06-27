import { test, expect } from "@gradio/tootils";

test("test text input", async ({ page }) => {
    const textbox = await page.getByTestId('textbox');
    await textbox.fill("Lorem ipsum");
    await page.keyboard.press('Enter');
    const user_message = await page.getByTestId('user').first().getByRole('paragraph').textContent();
    const bot_message = await page.getByTestId('bot').first().getByRole('paragraph').textContent();
    await expect(user_message).toEqual("Lorem ipsum");
    await expect(bot_message).toBeTruthy();
});

test("test image input", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: '📁' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles("./test/files/cheetah1.jpg");
    await page.keyboard.press('Enter');

    const user_message = await page.getByTestId('user').first().getByRole('img');
    const bot_message = await page.getByTestId('bot').first().getByRole('paragraph').textContent();
    const image_data = await user_message.getAttribute("src");
    await expect(image_data).toContain("cheetah1.jpg");
    await expect(bot_message).toBeTruthy();
});

test("test audio input", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: '📁' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles("../../test/test_files/audio_sample.wav");
    await page.keyboard.press('Enter');

    const user_message = await page.getByTestId('user').first().locator('audio');
    const bot_message = await page.getByTestId('bot').first().getByRole('paragraph').textContent();
    const audio_data = await user_message.getAttribute("src");
    await expect(audio_data).toContain("audio_sample.wav");
    await expect(bot_message).toBeTruthy();

});

test("test video input", async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: '📁' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles("../../test/test_files/video_sample.mp4");
    await page.keyboard.press('Enter');

    const user_message = await page.getByTestId('user').first().locator('video');
    const bot_message = await page.getByTestId('bot').first().getByRole('paragraph').textContent();
    const video_data = await user_message.getAttribute("src");
    await expect(video_data).toContain("video_sample.mp4");
    await expect(bot_message).toBeTruthy();
});


test("test basic markdown", async ({ page }) => {
    // Basic Markdown Input (Bold, Italics, Link)
    const textbox = await page.getByTestId('textbox');
    await textbox.fill("This is **bold text**. This is *italic text*. This is a [link](https://gradio.app).");
    await page.keyboard.press('Enter');
    const user_message = await page.getByTestId('user').first().getByRole('paragraph').innerHTML();
    const bot_message = await page.getByTestId('bot').first().getByRole('paragraph').textContent();
    await expect(user_message).toEqual('This is <strong>bold text</strong>. This is <em>italic text</em>. This is a <a href=\"https://gradio.app\" target=\"_blank\" rel=\"noopener noreferrer\">link</a>.');
    await expect(bot_message).toBeTruthy();
});

test("test inline code markdown", async ({ page }) => {
    const textbox = await page.getByTestId('textbox');
    await textbox.fill("This is `code`.");
    await page.keyboard.press('Enter');
    const user_message = await page.getByTestId('user').first().getByRole('paragraph').innerHTML();
    const bot_message = await page.getByTestId('bot').first().getByRole('paragraph').textContent();
    await expect(user_message).toEqual("This is <code>code</code>.");
    await expect(bot_message).toBeTruthy();
});

test("test code block markdown", async ({ page }) => {
    const textbox = await page.getByTestId('textbox');
    await textbox.fill("```python\nprint('Hello')\nprint('World!')\n```");
    await page.keyboard.press('Enter');
    const user_message = await page.getByTestId('user').first().locator('pre').innerHTML();
    const bot_message = await page.getByTestId('bot').first().getByRole('paragraph').textContent();
    await expect(user_message.replace(/\s/g, "")).toEqual(`<code class=\"language-python\"><button class=\"copy_code_button\" title=\"copy\"><span class=\"copy-text\"><svg viewBox=\"0 0 32 32\" height=\"100%\" width=\"100%\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z\" fill=\"currentColor\"></path><path d=\"M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z\" fill=\"currentColor\"></path></svg></span>
     <span class=\"check\"><svg stroke-linejoin=\"round\" stroke-linecap=\"round\" stroke-width=\"3\" stroke=\"currentColor\" fill=\"none\" viewBox=\"0 0 24 24\" height=\"100%\" width=\"100%\" xmlns=\"http://www.w3.org/2000/svg\"><polyline points=\"20 6 9 17 4 12\"></polyline></svg></span>
     </button><span class=\"token keyword\">print</span><span class=\"token punctuation\">(</span><span class=\"token string\">'Hello'</span><span class=\"token punctuation\">)</span>
     <span class=\"token keyword\">print</span><span class=\"token punctuation\">(</span><span class=\"token string\">'World!'</span><span class=\"token punctuation\">)</span>
     </code>`.replace(/\s/g, ""));
    await expect(bot_message).toBeTruthy();

});

test("test LaTeX", async ({ page }) => {
    const textbox = await page.getByTestId('textbox');
    await textbox.fill("This is LaTeX $$x^2$$");
    await page.keyboard.press('Enter');
    const user_message = await page.getByTestId('user').first().getByRole('paragraph').innerHTML();
    const bot_message = await page.getByTestId('bot').first().getByRole('paragraph');
    const bot_message_4_text = bot_message.textContent();
    await expect(user_message.replace(/\s/g, "")).toEqual(`This is LaTeX <span><span class=\"katex-display\"><span class=\"katex\"><span class=\"katex-mathml\"><math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\"><semantics><mrow><msup><mi>x</mi><mn>2</mn></msup></mrow><annotation encoding=\"application/x-tex\">x^2</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"base\"><span class=\"strut\" style=\"height: 0.8641em;\"></span><span class=\"mord\"><span class=\"mord mathnormal\">x</span><span class=\"msupsub\"><span class=\"vlist-t\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height: 0.8641em;\"><span class=\"\" style=\"top: -3.113em; margin-right: 0.05em;\"><span class=\"pstrut\" style=\"height: 2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mtight\">2</span></span></span></span></span></span></span></span></span></span></span></span></span>`.replace(/\s/g, ""));
    await expect(bot_message_4_text).toBeTruthy();
});


test("test autoscroll", async ({ page }) => {
    const textbox = await page.getByTestId('textbox');
    const line_break = "<br>"
    await textbox.fill(line_break.repeat(30));
    await page.keyboard.press('Enter');
    const bot_message = await page.getByTestId('bot').first().getByRole('paragraph');
    await expect(bot_message).toBeVisible();
    const bot_message_text = bot_message.textContent();
    await expect(bot_message_text).toBeTruthy();
});