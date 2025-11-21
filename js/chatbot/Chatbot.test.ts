import { test, describe, assert, afterEach, vi } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils";
import Chatbot from "./Index.svelte";
import type { LoadingStatus } from "@gradio/statustracker";
import type { FileData } from "@gradio/client";
import { group_messages } from "./shared/utils";

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
			value: [
				{ role: "user", content: [{ type: "text", text: "user message one" }] },
				{
					role: "assistant",
					content: [{ type: "text", text: "bot message one" }]
				}
			],
			latex_delimiters: [{ left: "$$", right: "$$", display: true }]
		});

		const bot = getAllByTestId("user")[0];
		const user = getAllByTestId("bot")[0];

		assert.exists(bot);
		assert.exists(user);
	});

	test("empty string messages are visible", async () => {
		const { container } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: [
				{ role: "user", content: [{ type: "text", text: "" }] },
				{ role: "assistant", content: [{ type: "text", text: "" }] }
			],
			latex_delimiters: [{ left: "$$", right: "$$", display: true }]
		});

		const userButton = container.querySelector(".user > div");
		const botButton = container.querySelector(".bot > div");

		assert.exists(userButton);
		assert.exists(botButton);
	});

	test("renders additional message as they are passed", async () => {
		const { getAllByTestId } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: [
				{ role: "user", content: [{ type: "text", text: "user message one" }] },
				{
					role: "assistant",
					content: [{ type: "text", text: "bot message one" }]
				},
				{ role: "user", content: [{ type: "text", text: "user message two" }] },
				{
					role: "assistant",
					content: [{ type: "text", text: "bot message two" }]
				}
			],
			latex_delimiters: [{ left: "$$", right: "$$", display: true }]
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
				},
				type: "file"
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
					},
					type: "file"
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
				},
				type: "file"
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
		const { getAllByTestId } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			latex_delimiters: [],
			value: [
				{
					content: [
						{
							file: {
								path: "https://gradio-builds.s3.amazonaws.com/demo-files/titanic.csv",
								url: "https://gradio-builds.s3.amazonaws.com/demo-files/titanic.csv",
								mime_type: "text/csv",
								alt_text: null
							},
							type: "file"
						}
					],
					role: "user"
				}
			]
		});

		const file_link = getAllByTestId("chatbot-file") as HTMLAnchorElement[];
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
			value: [
				{ role: "user", content: [{ type: "text", text: "user message one" }] },
				{
					role: "assistant",
					content: [{ type: "text", text: "bot message one" }]
				}
			],
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

	test("renders messages with allowed HTML tags", async () => {
		const { container } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: [
				{ role: "user", content: [{ type: "text", text: "user message" }] },
				{
					role: "assistant",
					content: [
						{ type: "text", text: "<thinking>processing query...</thinking>" }
					]
				}
			],
			allow_tags: ["thinking"]
		});

		const botMessage = container.querySelector(".bot");
		assert.exists(botMessage);
		assert.isTrue(
			botMessage?.textContent?.includes("processing query...")
		);
	});

	test("groups messages correctly when display_consecutive_in_same_bubble is true", () => {
		const messages = [
			{ role: "user", content: "Hello", type: "text", index: 0 },
			{ role: "assistant", content: "Hi there", type: "text", index: 1 },
			{ role: "assistant", content: "How can I help?", type: "text", index: 2 },
			{ role: "user", content: "Thanks", type: "text", index: 3 }
		];

		const grouped = group_messages(messages, true);

		// Should have 3 groups: user, assistant (2 messages), user
		assert.equal(grouped.length, 3);
		assert.equal(grouped[0].length, 1); // First user message
		assert.equal(grouped[1].length, 2); // Two consecutive assistant messages
		assert.equal(grouped[2].length, 1); // Second user message
	});

	test("groups messages correctly when display_consecutive_in_same_bubble is false", () => {
		const messages = [
			{ role: "user", content: "Hello", type: "text", index: 0 },
			{ role: "assistant", content: "Hi there", type: "text", index: 1 },
			{ role: "assistant", content: "How can I help?", type: "text", index: 2 },
			{ role: "user", content: "Thanks", type: "text", index: 3 }
		];

		const grouped = group_messages(messages, false);

		// Should have 4 groups: each message should be its own group
		assert.equal(grouped.length, 4);
		assert.equal(grouped[0].length, 1); // First user message
		assert.equal(grouped[1].length, 1); // First assistant message
		assert.equal(grouped[2].length, 1); // Second assistant message
		assert.equal(grouped[3].length, 1); // Second user message
	});

	test("displays like/dislike buttons on every message when group_consecutive_messages is false", async () => {
		const messages = [
			{ role: "user", content: [{ type: "text", text: "Hello" }] },
			{ role: "assistant", content: [{ type: "text", text: "Hi there" }] },
			{
				role: "assistant",
				content: [{ type: "text", text: "How can I help?" }]
			},
			{ role: "user", content: [{ type: "text", text: "Thanks" }] },
			{
				role: "assistant",
				content: [{ type: "text", text: "You're welcome!" }]
			}
		];

		const { container } = await render(Chatbot, {
			loading_status,
			label: "chatbot",
			value: messages,
			type: "messages",
			group_consecutive_messages: false,
			show_copy_button: false,
			feedback_options: ["Like", "Dislike"],
			likeable: true
		});

		// Count the number of like/dislike button panels
		const buttonPanels = container.querySelectorAll(".message-buttons");
		assert.equal(buttonPanels.length, 5);
	});
});
