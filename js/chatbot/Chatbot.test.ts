import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils";
import Chatbot from "./Index.svelte";
import type { LoadingStatus } from "@gradio/statustracker";
import type { FileData } from "@gradio/client";

const loading_status: LoadingStatus = {
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	status: "complete",
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full"
};

describe("Chatbot", () => {
	afterEach(() => cleanup());

	test("renders user and bot messages", async () => {
		const { getAllByTestId } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: [["user message one", "bot message one"]],
			latex_delimiters: [{ left: "$$", right: "$$", display: true }]
		});

		const bot = getAllByTestId("user")[0];
		const user = getAllByTestId("bot")[0];

		assert.exists(bot);
		assert.exists(user);
	});

	test("null messages are not visible", async () => {
		const { getByRole, container } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: [[null, null]],
			latex_delimiters: [{ left: "$$", right: "$$", display: true }]
		});

		const chatbot = getByRole("log");

		const userButton = container.querySelector(".user > div");
		const botButton = container.querySelector(".bot > div");

		assert.notExists(userButton);
		assert.notExists(botButton);

		assert.isFalse(chatbot.innerHTML.includes("button"));
	});

	test("empty string messages are visible", async () => {
		const { container } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: [["", ""]],
			latex_delimiters: [{ left: "$$", right: "$$", display: true }]
		});

		const userButton = container.querySelector(".user > div");
		const botButton = container.querySelector(".bot > div");

		assert.exists(userButton);
		assert.exists(botButton);
	});

	test("renders additional message as they are passed", async () => {
		const { component, getAllByTestId } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: [["user message one", "bot message one"]],
			latex_delimiters: [{ left: "$$", right: "$$", display: true }]
		});

		await component.$set({
			value: [
				["user message one", "bot message one"],
				["user message two", "bot message two"]
			]
		});

		const user_2 = getAllByTestId("user");
		const bot_2 = getAllByTestId("bot");

		assert.equal(user_2.length, 2);
		assert.equal(bot_2.length, 2);

		assert.exists(user_2[1]);
		assert.exists(bot_2[1]);
	});

	test.skip("renders image bot and user messages", async () => {
		const { component, getAllByTestId, debug } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: undefined,
			latex_delimiters: []
		});

		let value: [string | FileData | null, string | FileData | null][] = Array(
			2
		).fill([
			{
				file: {
					path: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah1.jpg",
					url: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah1.jpg",
					mime_type: "image/jpeg",
					alt_text: null
				}
			}
		]);

		await component.$set({
			value: value
		});

		const image = getAllByTestId("chatbot-image") as HTMLImageElement[];
		debug(image[0]);
		assert.isTrue(image[0].src.includes("cheetah1.jpg"));
		assert.isTrue(image[1].src.includes("cheetah1.jpg"));
	});

	test.skip("renders video bot and user messages", async () => {
		const { component, getAllByTestId } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			latex_delimiters: [],
			theme_mode: "dark"
		});
		let value: Array<[string | FileData | null, string | FileData | null]> =
			Array(2).fill([
				{
					file: {
						path: "https://gradio-builds.s3.amazonaws.com/demo-files/video_sample.mp4",
						url: "https://gradio-builds.s3.amazonaws.com/demo-files/video_sample.mp4",
						mime_type: "video/mp4",
						alt_text: null
					}
				}
			]);
		await component.$set({
			value: value
		});

		const video = getAllByTestId("chatbot-video") as HTMLVideoElement[];
		assert.isTrue(video[0].src.includes("video_sample.mp4"));
		assert.isTrue(video[1].src.includes("video_sample.mp4"));
	});

	test.skip("renders audio bot and user messages", async () => {
		const { component, getAllByTestId } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			latex_delimiters: [],
			theme_mode: "dark"
		});

		let value = Array(2).fill([
			{
				file: {
					path: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
					url: "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav",
					mime_type: "audio/wav",
					alt_text: null
				}
			}
		]);

		await component.$set({
			value: value
		});

		const audio = getAllByTestId("chatbot-audio") as HTMLAudioElement[];
		assert.isTrue(audio[0].src.includes("audio_sample.wav"));
		assert.isTrue(audio[1].src.includes("audio_sample.wav"));
	});

	test("renders hyperlinks to file bot and user messages", async () => {
		const { component, getAllByTestId } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			latex_delimiters: []
		});

		let value = Array(2).fill([
			{
				file: {
					path: "https://gradio-builds.s3.amazonaws.com/demo-files/titanic.csv",
					url: "https://gradio-builds.s3.amazonaws.com/demo-files/titanic.csv",
					mime_type: "text/csv",
					alt_text: null
				}
			}
		]);

		await component.$set({
			value: value
		});

		const file_link = getAllByTestId("chatbot-file") as HTMLAnchorElement[];
		assert.isTrue(file_link[0].href.includes("titanic.csv"));
		assert.isTrue(file_link[0].href.includes("titanic.csv"));
	});

	test("renders copy all messages button and copies all messages to clipboard", async () => {
		// mock the clipboard API
		const clipboard_write_text_mock = vi.fn().mockResolvedValue(undefined);

		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: clipboard_write_text_mock },
			configurable: true,
			writable: true
		});

		const { getByLabelText } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: [["user message one", "bot message one"]],
			show_copy_all_button: true
		});

		const copy_button = getByLabelText("Copy conversation");

		fireEvent.click(copy_button);

		expect(clipboard_write_text_mock).toHaveBeenCalledWith(
			expect.stringContaining("user: user message one")
		);
		expect(clipboard_write_text_mock).toHaveBeenCalledWith(
			expect.stringContaining("assistant: bot message one")
		);
	});

	test("renders custom buttons with null icon and non-existing icon", async () => {
		const customButtons = [
			{ label: "Example1", icon: "NonExisting", visible: "user" },
			{ label: "Example2", visible: "chatbot" }
		];

		const { getByText } = await render(Chatbot, {
			label: "chatbot",
			value: [["user message one", "bot message one"]],
			custom_buttons: customButtons
		});

		for (const button of customButtons) {
			expect(getByText(button.label)).toBeInTheDocument();
		}
	});

	test("renders messages with allowed HTML tags", async () => {
		const { container } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: [["user message", "<thinking>processing query...</thinking>"]],
			allow_tags: ["thinking"]
		});

		const botMessage = container.querySelector(".bot > div");
		assert.exists(botMessage);
		assert.isTrue(
			botMessage?.innerHTML.includes("<thinking>processing query...</thinking>")
		);
	});
});
