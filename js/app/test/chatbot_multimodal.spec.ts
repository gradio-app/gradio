import { test, expect } from "@gradio/tootils";

test("test inputs", async ({ page }) => {
    // Text Input
    const textbox = await page.getByTestId('textbox');
    await textbox.fill("Lorem ipsum");
    await page.keyboard.press('Enter');
    const user_message_1 = await page.getByTestId('user').first().getByRole('paragraph').textContent();
    const bot_message_1 = await page.getByTestId('bot').first().getByRole('paragraph').textContent();
    await expect(user_message_1).toEqual("Lorem ipsum");
    await expect(bot_message_1).toBeTruthy();

    // Image Input
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: '📁' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles("./test/files/cheetah1.jpg");
    await page.keyboard.press('Enter');

    const user_message_2 = await page.getByTestId('user').nth(1).getByRole('img');
    const bot_message_2 = await page.getByTestId('bot').nth(1).getByRole('paragraph').textContent();
    const image_data = await user_message_2.getAttribute("src");
    await expect(image_data).toContain("cheetah1.jpg");
    await expect(bot_message_2).toBeTruthy();


    // Audio Input
    await page.getByRole('button', { name: '📁' }).click();
    await fileChooser.setFiles("../../test/test_files/audio_sample.wav");
    await page.keyboard.press('Enter');

    const user_message_3 = await page.getByTestId('user').nth(2).locator('audio');
    const bot_message_3 = await page.getByTestId('bot').nth(2).getByRole('paragraph').textContent();
    const audio_data = await user_message_3.getAttribute("src");
    await expect(audio_data).toContain("audio_sample.wav");
    await expect(bot_message_3).toBeTruthy();

    // Video Input
    await page.getByRole('button', { name: '📁' }).click();
    await fileChooser.setFiles("../../test/test_files/video_sample.mp4");
    await page.keyboard.press('Enter');

    const user_message_4 = await page.getByTestId('user').nth(3).locator('video');
    const bot_message_4 = await page.getByTestId('bot').nth(3).getByRole('paragraph').textContent();
    const video_data = await user_message_4.getAttribute("src");
    await expect(video_data).toContain("video_sample.mp4");
    await expect(user_message_4).toBeVisible();
    await expect(bot_message_4).toBeTruthy();
});
