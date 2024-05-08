import { test, expect } from "@gradio/tootils";

async function error_modal_showed(page) {
	const toast = page.getByTestId("toast-body");
	expect(toast).toContainText("error");
	const close = page.getByTestId("toast-close");
	await close.click();
	await expect(page.getByTestId("toast-body")).toHaveCount(0);
}

async function get_file_selector(page, locator) {
	//source https://stackoverflow.com/questions/74048369/setinputfiles-gives-error-on-antd-upload-component
	let [file_chooser] = await Promise.all([
		page.waitForEvent("filechooser"),
		locator.click()
	]);

	return file_chooser;
}

test("gr.Image triggers the gr.Error model when an uploaded file exceeds max_file_size ", async ({
	page
}) => {
	const file_chooser = await get_file_selector(
		page,
		page.getByRole("button", { name: "Drop Image Here - or - Click to Upload" })
	);
	await file_chooser.setFiles("./test/files/cheetah1.jpg");
	await error_modal_showed(page);
});

test("gr.File(file_count='single') triggers the gr.Error modal when an uploaded file exceeds max_file_size ", async ({
	page
}) => {
	const locator = page.getByText(
		"Single File Drop File Here - or - Click to Upload"
	);
	const file_chooser = await get_file_selector(page, locator);
	await file_chooser.setFiles("./test/files/cheetah1.jpg");
	await error_modal_showed(page);
});

test("gr.File(file_count='multiple') triggers the gr.Error modal when an uploaded file exceeds max_file_size ", async ({
	page
}) => {
	const locator = page.getByText(
		"Multiple Files Drop File Here - or - Click to Upload"
	);
	const file_chooser = await get_file_selector(page, locator);
	await file_chooser.setFiles([
		"./test/files/cheetah1.jpg",
		"./test/files/alphabet.txt"
	]);
	await error_modal_showed(page);
});

test("gr.Gallery() triggers the gr.Error modal when an uploaded file exceeds max_file_size ", async ({
	page
}) => {
	const locator = page.getByText(
		"Gallery Drop Image(s) Here - or - Click to Upload"
	);
	const file_chooser = await get_file_selector(page, locator);
	await file_chooser.setFiles(["./test/files/cheetah1.jpg"]);
	await error_modal_showed(page);
});

test("gr.Model3D() triggers the gr.Error modal when an uploaded file exceeds max_file_size ", async ({
	page
}) => {
	const locator = page.getByText(
		"Model 3D Drop File Here - or - Click to Upload"
	);
	const file_chooser = await get_file_selector(page, locator);
	await file_chooser.setFiles(["./test/files/face.obj"]);
	await error_modal_showed(page);
});

test("gr.MultimodalTextBox() triggers the gr.Error modal when an uploaded file exceeds max_file_size ", async ({
	page
}) => {
	const locator = page.getByRole("button", { name: "+" });
	const file_chooser = await get_file_selector(page, locator);
	await file_chooser.setFiles(["./test/files/face.obj"]);
	await error_modal_showed(page);
});

test("gr.UploadButton() triggers the gr.Error modal when an uploaded file exceeds max_file_size ", async ({
	page
}) => {
	const locator = page.getByRole("button", {
		name: "Upload Button",
		exact: true
	});
	const file_chooser = await get_file_selector(page, locator);
	await file_chooser.setFiles(["./test/files/face.obj"]);
	await error_modal_showed(page);
});

test("gr.Video() triggers the gr.Error modal when an uploaded file exceeds max_file_size ", async ({
	page
}) => {
	const locator = page.getByText(
		"Video Drop Video Here - or - Click to Upload"
	);
	const file_chooser = await get_file_selector(page, locator);
	await file_chooser.setFiles(["./test/files/world.mp4"]);
	await error_modal_showed(page);
});

test("gr.Audio() triggers the gr.Error modal when an uploaded file exceeds max_file_size ", async ({
	page
}) => {
	const locator = page.getByText(
		"Audio Drop Audio Here - or - Click to Upload"
	);
	const file_chooser = await get_file_selector(page, locator);
	await file_chooser.setFiles(["./test/files/world.mp4"]);
	await error_modal_showed(page);
});

test("gr.File() will allow uploads below the max_file_size limit of 15kb", async ({
	page
}) => {
	// test fails because the error modal does not show up
	test.fail();

	const locator = page.getByText(
		"Single File Drop File Here - or - Click to Upload"
	);
	const file_chooser = await get_file_selector(page, locator);
	await file_chooser.setFiles(["./test/files/gradio-logo.svg"]);
	await expect(page.getByTestId("toast-body")).toHaveCount(1, {
		timeout: 2000
	});
});

test("gr.UploadButton() will allow uploads below the max_file_size limit of 15kb", async ({
	page
}) => {
	// test fails because the error modal does not show up
	test.fail();

	const locator = page.getByRole("button", {
		name: "Upload Button",
		exact: true
	});
	const file_chooser = await get_file_selector(page, locator);
	await file_chooser.setFiles(["./test/files/time.csv"]);
	await expect(page.getByTestId("toast-body")).toHaveCount(1, {
		timeout: 2000
	});
});
