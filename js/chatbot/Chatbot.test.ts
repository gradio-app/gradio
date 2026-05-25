import { test, describe, expect, afterEach, vi } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import Chatbot from "./Index.svelte";
import {
	group_messages,
	normalise_messages,
	is_last_bot_message,
	all_text,
	get_thought_content
} from "./shared/utils";
import type { NormalisedMessage, Message, ThoughtNode } from "./types";

function text_msg(
	role: "user" | "assistant",
	text: string,
	index: number,
	opts?: { options?: { value: string; label?: string }[]; metadata?: any }
): Message {
	return {
		role,
		content: [{ type: "text", text }],
		index,
		metadata: opts?.metadata ?? { title: null },
		...(opts?.options ? { options: opts.options } : {})
	};
}

function file_msg(
	role: "user" | "assistant",
	url: string,
	mime_type: string,
	index: number
): Message {
	return {
		role,
		content: [
			{
				type: "file",
				file: {
					path: url,
					url,
					orig_name: url.split("/").pop() || "file",
					size: 1024,
					mime_type,
					is_stream: false
				},
				alt_text: null
			}
		],
		index,
		metadata: { title: null }
	};
}

const default_props = {
	label: "Chatbot",
	show_label: true,
	value: null as Message[] | null,
	latex_delimiters: [{ left: "$$", right: "$$", display: true }],
	likeable: false,
	feedback_options: [] as string[],
	feedback_value: null as (string | null)[] | null,
	like_user_message: false,
	_retryable: false,
	_undoable: false,
	_selectable: false,
	editable: null as "user" | "all" | null,
	layout: "bubble" as const,
	render_markdown: true,
	sanitize_html: true,
	line_breaks: true,
	allow_tags: false as string[] | boolean,
	group_consecutive_messages: true,
	autoscroll: false,
	placeholder: null as string | null,
	examples: null as any,
	avatar_images: [null, null] as [null, null],
	buttons: null as
		| (string | { value: string; id: number; icon: null })[]
		| null,
	allow_file_downloads: true,
	watermark: null as string | null,
	rtl: false,
	height: undefined as number | string | undefined
};

run_shared_prop_tests({
	component: Chatbot,
	name: "Chatbot",
	base_props: { ...default_props },
	has_label: false,
	has_validation_error: false
});

describe("Chatbot", () => {
	afterEach(() => cleanup());

	test("renders user and bot messages", async () => {
		const { getAllByTestId } = await render(Chatbot, {
			...default_props,
			value: [
				text_msg("user", "Hello", 0),
				text_msg("assistant", "Hi there", 1)
			]
		});

		expect(getAllByTestId("user").length).toBe(1);
		expect(getAllByTestId("bot").length).toBe(1);
	});

	test("empty string messages are visible", async () => {
		const { getAllByTestId } = await render(Chatbot, {
			...default_props,
			value: [text_msg("user", "", 0), text_msg("assistant", "", 1)]
		});

		expect(getAllByTestId("user").length).toBe(1);
		expect(getAllByTestId("bot").length).toBe(1);
	});

	test("renders multiple messages", async () => {
		const { getAllByTestId } = await render(Chatbot, {
			...default_props,
			value: [
				text_msg("user", "msg 1", 0),
				text_msg("assistant", "reply 1", 1),
				text_msg("user", "msg 2", 2),
				text_msg("assistant", "reply 2", 3)
			]
		});

		expect(getAllByTestId("user").length).toBe(2);
		expect(getAllByTestId("bot").length).toBe(2);
	});

	test("renders with null value showing no messages", async () => {
		const { queryAllByTestId } = await render(Chatbot, {
			...default_props,
			value: null
		});

		expect(queryAllByTestId("user").length).toBe(0);
		expect(queryAllByTestId("bot").length).toBe(0);
	});

	test("conversation log has correct accessibility attributes", async () => {
		const { getByRole } = await render(Chatbot, {
			...default_props,
			value: [text_msg("user", "Hello", 0)]
		});

		const log = getByRole("log");
		expect(log).toBeTruthy();
		expect(log.getAttribute("aria-label")).toBe("chatbot conversation");
		expect(log.getAttribute("aria-live")).toBe("polite");
	});
});

describe("Props: likeable / feedback_options", () => {
	afterEach(() => cleanup());

	test("likeable=true shows like/dislike buttons on bot messages", async () => {
		const { getByLabelText } = await render(Chatbot, {
			...default_props,
			likeable: true,
			feedback_options: ["Like", "Dislike"],
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		expect(getByLabelText("chatbot.like")).toBeTruthy();
		expect(getByLabelText("chatbot.dislike")).toBeTruthy();
	});

	test("likeable=false hides like/dislike buttons", async () => {
		const { queryByLabelText } = await render(Chatbot, {
			...default_props,
			likeable: false,
			feedback_options: ["Like", "Dislike"],
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		expect(queryByLabelText("chatbot.like")).toBeNull();
		expect(queryByLabelText("chatbot.dislike")).toBeNull();
	});

	test("like_user_message=true shows like buttons on user messages", async () => {
		const { getAllByLabelText } = await render(Chatbot, {
			...default_props,
			likeable: true,
			like_user_message: true,
			feedback_options: ["Like", "Dislike"],
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		expect(getAllByLabelText("chatbot.like").length).toBe(2);
	});

	test("like_user_message=false hides like buttons on user messages", async () => {
		const { getAllByLabelText } = await render(Chatbot, {
			...default_props,
			likeable: true,
			like_user_message: false,
			feedback_options: ["Like", "Dislike"],
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		expect(getAllByLabelText("chatbot.like").length).toBe(1);
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("copy button renders on text messages when enabled", async () => {
		const { getAllByLabelText } = await render(Chatbot, {
			...default_props,
			buttons: null,
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		expect(getAllByLabelText("chatbot.copy_message").length).toEqual(2);
	});

	test("copy_all button renders when enabled", async () => {
		const { getByLabelText } = await render(Chatbot, {
			...default_props,
			buttons: ["copy_all"],
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		expect(getByLabelText("Copy conversation")).toBeTruthy();
	});

	test("clear button renders when messages exist", async () => {
		const { getByLabelText } = await render(Chatbot, {
			...default_props,
			value: [text_msg("user", "Hi", 0)]
		});

		expect(getByLabelText("chatbot.clear")).toBeTruthy();
	});

	test("clear button not rendered when no messages", async () => {
		const { queryByLabelText } = await render(Chatbot, {
			...default_props,
			value: null
		});

		expect(queryByLabelText("chatbot.clear")).toBeNull();
	});

	test("retry button shows on last bot message when _retryable=true", async () => {
		const { getByLabelText, getAllByLabelText } = await render(Chatbot, {
			...default_props,
			_retryable: true,
			value: [
				text_msg("user", "Hi", 0),
				text_msg("assistant", "Hi", 1),
				text_msg("user", "Hello", 2),
				text_msg("assistant", "Hello", 3)
			]
		});

		expect(getByLabelText("chatbot.retry")).toBeTruthy();
		expect(getAllByLabelText("chatbot.retry").length).toEqual(1);
	});

	test("undo button shows on last bot message when _undoable=true", async () => {
		const { getByLabelText } = await render(Chatbot, {
			...default_props,
			_undoable: true,
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		expect(getByLabelText("chatbot.undo")).toBeTruthy();
	});

	test("retry/undo buttons not shown on non-last bot messages", async () => {
		const { getAllByLabelText, queryAllByLabelText } = await render(Chatbot, {
			...default_props,
			_retryable: true,
			_undoable: true,
			value: [
				text_msg("user", "Hi", 0),
				text_msg("assistant", "Hello", 1),
				text_msg("user", "Thanks", 2),
				text_msg("assistant", "You're welcome", 3)
			]
		});

		expect(getAllByLabelText("chatbot.retry").length).toBe(1);
		expect(getAllByLabelText("chatbot.undo").length).toBe(1);
	});

	test("custom button dispatches custom_button_click", async () => {
		const { listen, getByLabelText } = await render(Chatbot, {
			...default_props,
			buttons: [{ value: "Analyze", id: 3, icon: null }],
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		const custom = listen("custom_button_click");
		await fireEvent.click(getByLabelText("Analyze"));

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 3 });
	});
});

describe("Props: editable", () => {
	afterEach(() => cleanup());

	test("editable='user' shows edit button on user messages", async () => {
		const { getByLabelText } = await render(Chatbot, {
			...default_props,
			editable: "user",
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		expect(getByLabelText("chatbot.edit")).toBeTruthy();
	});

	test("editable=null hides edit button", async () => {
		const { queryByLabelText } = await render(Chatbot, {
			...default_props,
			editable: null,
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		expect(queryByLabelText("chatbot.edit")).toBeNull();
	});

	test("editable='all' shows edit button on both user and bot messages", async () => {
		const { getAllByLabelText } = await render(Chatbot, {
			...default_props,
			editable: "all",
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		expect(getAllByLabelText("chatbot.edit").length).toBe(2);
	});
});

describe("Props: placeholder / examples", () => {
	afterEach(() => cleanup());

	test("placeholder shown when no messages", async () => {
		const { getByText } = await render(Chatbot, {
			...default_props,
			value: null,
			placeholder: "Ask me anything..."
		});

		expect(getByText("Ask me anything...")).toBeTruthy();
	});

	test("placeholder not shown when messages exist", async () => {
		const { queryByText } = await render(Chatbot, {
			...default_props,
			value: [text_msg("user", "Hi", 0)],
			placeholder: "Ask me anything..."
		});

		expect(queryByText("Ask me anything...")).toBeNull();
	});

	test("examples render when no messages", async () => {
		const { getByText } = await render(Chatbot, {
			...default_props,
			value: null,
			examples: [
				{ text: "Tell me a joke", display_text: "Tell me a joke" },
				{ text: "Write code", display_text: "Write code" }
			]
		});

		expect(getByText("Tell me a joke")).toBeTruthy();
		expect(getByText("Write code")).toBeTruthy();
	});

	test("clicking example dispatches example_select", async () => {
		const { listen, getByText } = await render(Chatbot, {
			...default_props,
			value: null,
			examples: [{ text: "Tell me a joke", display_text: "Tell me a joke" }]
		});

		const example_select = listen("example_select");
		await fireEvent.click(getByText("Tell me a joke"));

		expect(example_select).toHaveBeenCalledTimes(1);
	});
});

describe("Props: allow_tags", () => {
	afterEach(() => cleanup());

	test("custom HTML tags preserved when in allow_tags", async () => {
		const { getAllByTestId } = await render(Chatbot, {
			...default_props,
			allow_tags: ["thinking"],
			value: [text_msg("assistant", "<thinking>deep thought</thinking>", 0)]
		});

		const bot = getAllByTestId("bot")[0];
		expect(bot.textContent).toContain("deep thought");
	});
});

describe("Props: options", () => {
	afterEach(() => cleanup());

	test("bot message options render as clickable buttons", async () => {
		const { getByRole } = await render(Chatbot, {
			...default_props,
			value: [
				text_msg("assistant", "Choose one:", 0, {
					options: [
						{ value: "opt_a", label: "Option A" },
						{ value: "opt_b", label: "Option B" }
					]
				})
			]
		});

		expect(getByRole("button", { name: "Option A" })).toBeTruthy();
		expect(getByRole("button", { name: "Option B" })).toBeTruthy();
	});

	test("clicking option dispatches option_select", async () => {
		const { listen, getByRole } = await render(Chatbot, {
			...default_props,
			value: [
				text_msg("assistant", "Choose:", 0, {
					options: [{ value: "yes", label: "Yes" }]
				})
			]
		});

		const option_select = listen("option_select");
		await fireEvent.click(getByRole("button", { name: "Yes" }));

		expect(option_select).toHaveBeenCalledTimes(1);
		expect(option_select).toHaveBeenCalledWith(
			expect.objectContaining({ value: "yes", index: 0 })
		);
	});

	test("option without label uses value as display text", async () => {
		const { getByRole } = await render(Chatbot, {
			...default_props,
			value: [
				text_msg("assistant", "Choose:", 0, {
					options: [{ value: "raw_value" }]
				})
			]
		});

		expect(getByRole("button", { name: "raw_value" })).toBeTruthy();
	});
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("set_data triggers change event", async () => {
		const { listen, set_data } = await render(Chatbot, {
			...default_props,
			value: null
		});

		const change = listen("change");
		await set_data({ value: [text_msg("user", "Hello", 0)] });

		expect(change).toHaveBeenCalled();
	});

	test("no spurious change on mount with null value", async () => {
		const { listen } = await render(Chatbot, {
			...default_props,
			value: null
		});

		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});
});

describe("Events: like", () => {
	afterEach(() => cleanup());

	test("clicking like dispatches like event with liked=true", async () => {
		const { listen, getByLabelText } = await render(Chatbot, {
			...default_props,
			likeable: true,
			feedback_options: ["Like", "Dislike"],
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		const like = listen("like");
		await fireEvent.click(getByLabelText("chatbot.like"));

		expect(like).toHaveBeenCalledTimes(1);
		expect(like).toHaveBeenCalledWith(expect.objectContaining({ liked: true }));
	});

	test("clicking dislike dispatches like event with liked=false", async () => {
		const { listen, getByLabelText } = await render(Chatbot, {
			...default_props,
			likeable: true,
			feedback_options: ["Like", "Dislike"],
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		const like = listen("like");
		await fireEvent.click(getByLabelText("chatbot.dislike"));

		expect(like).toHaveBeenCalledTimes(1);
		expect(like).toHaveBeenCalledWith(
			expect.objectContaining({ liked: false })
		);
	});
});

describe("Events: retry / undo", () => {
	afterEach(() => cleanup());

	test("clicking retry dispatches retry event", async () => {
		const { listen, getByLabelText } = await render(Chatbot, {
			...default_props,
			_retryable: true,
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		const retry = listen("retry");
		await fireEvent.click(getByLabelText("chatbot.retry"));

		expect(retry).toHaveBeenCalledTimes(1);
		expect(retry).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
	});

	test("clicking undo dispatches undo event", async () => {
		const { listen, getByLabelText } = await render(Chatbot, {
			...default_props,
			_undoable: true,
			value: [text_msg("user", "Hi", 0), text_msg("assistant", "Hello", 1)]
		});

		const undo = listen("undo");
		await fireEvent.click(getByLabelText("chatbot.undo"));

		expect(undo).toHaveBeenCalledTimes(1);
		expect(undo).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
	});
});

describe("Events: clear", () => {
	afterEach(() => cleanup());

	test("clear button dispatches clear event", async () => {
		const { listen, getByLabelText } = await render(Chatbot, {
			...default_props,
			value: [text_msg("user", "Hi", 0)]
		});

		const clear = listen("clear");
		await fireEvent.click(getByLabelText("chatbot.clear"));

		expect(clear).toHaveBeenCalledTimes(1);
	});
});

describe("Events: copy", () => {
	afterEach(() => cleanup());

	test("copy all copies full conversation to clipboard", async () => {
		// Mock clipboard API — browser clipboard requires user gesture
		// and secure context, neither of which is available in test
		const clipboard_mock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: clipboard_mock },
			configurable: true,
			writable: true
		});

		const { getByLabelText, listen } = await render(Chatbot, {
			...default_props,
			buttons: ["copy_all"],
			value: [
				text_msg("user", "user msg", 0),
				text_msg("assistant", "bot msg", 1)
			]
		});
		const copy = listen("copy");
		await fireEvent.click(getByLabelText("Copy conversation"));

		expect(copy).not.toHaveBeenCalled();

		expect(clipboard_mock).toHaveBeenCalledWith(
			expect.stringContaining("user: user msg")
		);
		expect(clipboard_mock).toHaveBeenCalledWith(
			expect.stringContaining("assistant: bot msg")
		);
	});

	test("copy message button triggers copy event", async () => {
		const { getAllByTitle, listen } = await render(Chatbot, {
			...default_props,
			buttons: ["copy_all", "copy"],
			value: [
				text_msg("user", "user msg", 0),
				text_msg("assistant", "bot msg", 1)
			]
		});
		const copy = listen("copy");
		await fireEvent.click(getAllByTitle("chatbot.copy_message")[0]);
		expect(copy).toHaveBeenCalled();
	});
});

describe("File messages", () => {
	afterEach(() => cleanup());

	test("generic file renders download link with correct href", async () => {
		const { getAllByTestId } = await render(Chatbot, {
			...default_props,
			value: [file_msg("user", "https://example.com/data.csv", "text/csv", 0)]
		});

		const links = getAllByTestId("chatbot-file") as HTMLAnchorElement[];
		expect(links.length).toBe(1);
		expect(links[0].href).toContain("data.csv");
	});

	test("generic file shows file name and extension", async () => {
		const { getByText } = await render(Chatbot, {
			...default_props,
			value: [file_msg("user", "https://example.com/report.pdf", "text/pdf", 0)]
		});

		expect(getByText("report.pdf")).toBeTruthy();
		expect(getByText("PDF")).toBeTruthy();
	});

	test("image file is normalised to image component message", () => {
		const messages: Message[] = [
			file_msg("assistant", "https://example.com/photo.jpg", "image/jpeg", 0)
		];

		const normalised = normalise_messages(messages, "");
		expect(normalised).not.toBeNull();
		expect(normalised![0].type).toBe("component");
		if (normalised![0].type === "component") {
			expect(normalised![0].content.component).toBe("image");
		}
	});

	test("video file is normalised to video component message", () => {
		const messages: Message[] = [
			file_msg("assistant", "https://example.com/clip.mp4", "video/mp4", 0)
		];

		const normalised = normalise_messages(messages, "");
		expect(normalised).not.toBeNull();
		expect(normalised![0].type).toBe("component");
		if (normalised![0].type === "component") {
			expect(normalised![0].content.component).toBe("video");
		}
	});

	test("audio file is normalised to audio component message", () => {
		const messages: Message[] = [
			file_msg("assistant", "https://example.com/song.wav", "audio/wav", 0)
		];

		const normalised = normalise_messages(messages, "");
		expect(normalised).not.toBeNull();
		expect(normalised![0].type).toBe("component");
		if (normalised![0].type === "component") {
			expect(normalised![0].content.component).toBe("audio");
		}
	});

	test("file without mime_type and 3D model extension normalised to model3d", () => {
		const messages: Message[] = [
			{
				role: "assistant",
				content: [
					{
						type: "file",
						file: {
							path: "https://example.com/scene.glb",
							url: "https://example.com/scene.glb",
							orig_name: "scene.glb",
							size: 4096,
							mime_type: null,
							is_stream: false
						} as any,
						alt_text: null
					}
				],
				index: 0,
				metadata: { title: null }
			}
		];

		const normalised = normalise_messages(messages, "");
		expect(normalised![0].type).toBe("component");
		if (normalised![0].type === "component") {
			expect(normalised![0].content.component).toBe("model3d");
		}
	});

	test("unknown mime_type file normalised to 'file' component with array value", () => {
		const messages: Message[] = [
			file_msg("user", "https://example.com/data.csv", "text/csv", 0)
		];

		const normalised = normalise_messages(messages, "");
		expect(normalised![0].type).toBe("component");
		if (normalised![0].type === "component") {
			expect(normalised![0].content.component).toBe("file");
			expect(Array.isArray(normalised![0].content.value)).toBe(true);
		}
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns null when no value", async () => {
		const { get_data } = await render(Chatbot, {
			...default_props,
			value: null
		});

		const data = await get_data();
		expect(data.value).toBeNull();
	});

	test("set_data updates displayed messages", async () => {
		const { set_data, getAllByTestId } = await render(Chatbot, {
			...default_props,
			value: null
		});

		await set_data({
			value: [text_msg("user", "Hello", 0), text_msg("assistant", "World", 1)]
		});

		expect(getAllByTestId("user").length).toBe(1);
		expect(getAllByTestId("bot").length).toBe(1);
	});

	test("get_data reflects set_data (round-trip)", async () => {
		const msgs = [
			text_msg("user", "Hello", 0),
			text_msg("assistant", "World", 1)
		];
		const { get_data, set_data } = await render(Chatbot, {
			...default_props,
			value: null
		});

		await set_data({ value: msgs });
		const data = await get_data();
		expect(data.value).toEqual(msgs);
	});
});

describe("group_messages utility", () => {
	const msgs: NormalisedMessage[] = [
		{
			role: "user",
			content: "Hello",
			type: "text",
			index: 0,
			metadata: { title: null }
		},
		{
			role: "assistant",
			content: "Hi",
			type: "text",
			index: 1,
			metadata: { title: null }
		},
		{
			role: "assistant",
			content: "How can I help?",
			type: "text",
			index: 2,
			metadata: { title: null }
		},
		{
			role: "user",
			content: "Thanks",
			type: "text",
			index: 3,
			metadata: { title: null }
		}
	];

	test("groups consecutive same-role messages when enabled", () => {
		const grouped = group_messages(msgs, true);

		expect(grouped.length).toBe(3);
		expect(grouped[0].length).toBe(1); // user
		expect(grouped[1].length).toBe(2); // 2 consecutive assistant
		expect(grouped[2].length).toBe(1); // user
	});

	test("keeps each message separate when disabled", () => {
		const grouped = group_messages(msgs, false);

		expect(grouped.length).toBe(4);
		grouped.forEach((g) => expect(g.length).toBe(1));
	});

	test("skips system messages", () => {
		const with_system: NormalisedMessage[] = [
			{
				role: "system",
				content: "You are helpful",
				type: "text",
				index: 0,
				metadata: { title: null }
			},
			...msgs
		];

		const grouped = group_messages(with_system, true);
		expect(grouped.length).toBe(3);
	});
});

describe("normalise_messages utility", () => {
	test("normalises text messages", () => {
		const messages: Message[] = [text_msg("user", "Hello world", 0)];
		const result = normalise_messages(messages, "");

		expect(result).not.toBeNull();
		expect(result!.length).toBe(1);
		expect(result![0].type).toBe("text");
		expect(result![0].content).toBe("Hello world");
		expect(result![0].role).toBe("user");
	});

	test("handles null input", () => {
		expect(normalise_messages(null, "")).toBeNull();
	});

	test("redirects /file src URLs using root", () => {
		const messages: Message[] = [
			text_msg("assistant", 'Check <img src="/file=img.png" />', 0)
		];
		const result = normalise_messages(messages, "http://localhost:7860/");

		expect(result![0].type).toBe("text");
		expect((result![0] as any).content).toContain("http://localhost:7860/file");
	});

	test("nests thought messages by parent_id", () => {
		const messages: Message[] = [
			{
				role: "assistant",
				content: [{ type: "text", text: "Thinking..." }],
				index: 0,
				metadata: { title: "Step 1", id: "1", parent_id: null }
			},
			{
				role: "assistant",
				content: [{ type: "text", text: "Sub-step" }],
				index: 1,
				metadata: { title: "Sub", id: "2", parent_id: "1" }
			}
		];

		const result = normalise_messages(messages, "");
		// The child should be nested, so only 1 top-level message
		expect(result!.length).toBe(1);
		const thought = result![0] as ThoughtNode;
		expect(thought.children.length).toBe(1);
		expect(thought.children[0].content).toBe("Sub-step");
	});
});

describe("is_last_bot_message utility", () => {
	test("returns true for the last bot message group", () => {
		const msgs: NormalisedMessage[] = [
			{
				role: "user",
				content: "Hi",
				type: "text",
				index: 0,
				metadata: { title: null }
			},
			{
				role: "assistant",
				content: "Hello",
				type: "text",
				index: 1,
				metadata: { title: null }
			}
		];

		expect(is_last_bot_message([msgs[1]], msgs)).toBe(true);
	});

	test("returns false for non-last bot message", () => {
		const msgs: NormalisedMessage[] = [
			{
				role: "user",
				content: "Hi",
				type: "text",
				index: 0,
				metadata: { title: null }
			},
			{
				role: "assistant",
				content: "Hello",
				type: "text",
				index: 1,
				metadata: { title: null }
			},
			{
				role: "user",
				content: "Thanks",
				type: "text",
				index: 2,
				metadata: { title: null }
			},
			{
				role: "assistant",
				content: "Bye",
				type: "text",
				index: 3,
				metadata: { title: null }
			}
		];

		expect(is_last_bot_message([msgs[1]], msgs)).toBe(false);
	});

	test("returns false when last message is user", () => {
		const msgs: NormalisedMessage[] = [
			{
				role: "assistant",
				content: "Hello",
				type: "text",
				index: 0,
				metadata: { title: null }
			},
			{
				role: "user",
				content: "Hi",
				type: "text",
				index: 1,
				metadata: { title: null }
			}
		];

		expect(is_last_bot_message([msgs[1]], msgs)).toBe(false);
	});
});

describe("all_text / get_thought_content utilities", () => {
	test("all_text returns content for a single message", () => {
		const msg: any = {
			type: "text",
			content: "Hello world",
			metadata: { title: null }
		};
		expect(all_text(msg)).toBe("Hello world");
	});

	test("all_text joins content for array of messages", () => {
		const msgs: any[] = [
			{ type: "text", content: "Line 1", metadata: { title: null } },
			{ type: "text", content: "Line 2", metadata: { title: null } }
		];
		expect(all_text(msgs)).toBe("Line 1\nLine 2");
	});

	test("get_thought_content includes title and content", () => {
		const msg: any = {
			type: "text",
			content: "thinking...",
			metadata: { title: "Step 1" },
			children: []
		};
		const result = get_thought_content(msg);
		expect(result).toContain("Step 1");
		expect(result).toContain("thinking...");
	});

	test("get_thought_content recurses into children", () => {
		const msg: any = {
			type: "text",
			content: "parent",
			metadata: { title: "Parent" },
			children: [
				{
					type: "text",
					content: "child",
					metadata: { title: "Child" },
					children: []
				}
			]
		};
		const result = get_thought_content(msg);
		expect(result).toContain("Parent");
		expect(result).toContain("Child");
		expect(result).toContain("child");
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("displays like/dislike on every message when group_consecutive_messages=false", async () => {
		const { container } = await render(Chatbot, {
			...default_props,
			group_consecutive_messages: false,
			likeable: true,
			like_user_message: true,
			value: [
				text_msg("user", "Hello", 0),
				text_msg("assistant", "Hi", 1),
				text_msg("assistant", "How can I help?", 2),
				text_msg("user", "Thanks", 3),
				text_msg("assistant", "Welcome!", 4)
			]
		});

		// Each message gets its own button panel when not grouped
		// querySelectorAll is used because there's no semantic query for
		// the message-buttons wrapper — it has no role/label/testid
		const buttonPanels = container.querySelectorAll(".message-buttons");
		expect(buttonPanels.length).toBe(5);
	});

	test("single message conversation renders correctly", async () => {
		const { getAllByTestId } = await render(Chatbot, {
			...default_props,
			value: [text_msg("user", "Solo", 0)]
		});

		expect(getAllByTestId("user").length).toBe(1);
	});

	test("empty array value shows placeholder area", async () => {
		const { queryAllByTestId } = await render(Chatbot, {
			...default_props,
			value: []
		});

		expect(queryAllByTestId("user").length).toBe(0);
		expect(queryAllByTestId("bot").length).toBe(0);
	});
});

describe("Thoughts / metadata", () => {
	afterEach(() => cleanup());

	test("thought message renders title from metadata", async () => {
		const { getByText } = await render(Chatbot, {
			...default_props,
			value: [
				{
					role: "assistant",
					content: [{ type: "text", text: "Analyzing the problem..." }],
					index: 0,
					metadata: { title: "Thinking...", id: "1" }
				} as Message
			]
		});

		expect(getByText("Thinking...")).toBeTruthy();
	});

	test("thought message renders log and duration from metadata", async () => {
		const { getByText, container } = await render(Chatbot, {
			...default_props,
			value: [
				{
					role: "assistant",
					content: [{ type: "text", text: "Step done" }],
					index: 0,
					metadata: {
						title: "Step 1",
						id: "1",
						log: "Completed analysis",
						duration: 1.5,
						status: "done"
					}
				} as Message
			]
		});

		expect(getByText("Step 1")).toBeTruthy();
		// Log and duration are rendered inside the same .duration span,
		// so getByText may not find them individually. Check container text.
		const thoughtGroup = container.querySelector(".thought-group");
		expect(thoughtGroup).not.toBeNull();
		expect(thoughtGroup!.textContent).toContain("Completed analysis");
		expect(thoughtGroup!.textContent).toContain("1.5s");
	});

	test("thought with status='pending' shows loading spinner", async () => {
		const { container } = await render(Chatbot, {
			...default_props,
			value: [
				{
					role: "assistant",
					content: [{ type: "text", text: "" }],
					index: 0,
					metadata: {
						title: "Thinking...",
						id: "1",
						status: "pending"
					}
				} as Message
			]
		});

		// Loading spinner has class loading-spinner — no role/label/testid available
		const spinner = container.querySelector(".loading-spinner");
		expect(spinner).not.toBeNull();
	});

	test("thought with status='done' does not show loading spinner", async () => {
		const { container } = await render(Chatbot, {
			...default_props,
			value: [
				{
					role: "assistant",
					content: [{ type: "text", text: "Done thinking" }],
					index: 0,
					metadata: {
						title: "Analysis",
						id: "1",
						status: "done"
					}
				} as Message
			]
		});

		const spinner = container.querySelector(".loading-spinner");
		expect(spinner).toBeNull();
	});

	test("thought with status='done' is collapsed by default", async () => {
		const { queryByText, getByRole } = await render(Chatbot, {
			...default_props,
			value: [
				{
					role: "assistant",
					content: [{ type: "text", text: "Hidden reasoning" }],
					index: 0,
					metadata: {
						title: "My Thought",
						id: "1",
						status: "done"
					}
				} as Message
			]
		});

		// status=done means collapsed by default — content not in DOM
		const toggle = getByRole("button", { name: /My Thought/ });
		expect(toggle).toBeTruthy();
		expect(queryByText("Hidden reasoning")).toBeNull();
	});

	test("clicking thought title expands content", async () => {
		const { queryByText, getByRole } = await render(Chatbot, {
			...default_props,
			value: [
				{
					role: "assistant",
					content: [{ type: "text", text: "Hidden reasoning" }],
					index: 0,
					metadata: {
						title: "My Thought",
						id: "1",
						status: "done"
					}
				} as Message
			]
		});

		expect(queryByText("Hidden reasoning")).toBeNull();

		// Click to expand — content appears in DOM
		await fireEvent.click(getByRole("button", { name: /My Thought/ }));
		expect(queryByText("Hidden reasoning")).not.toBeNull();
	});

	test("nested thought children render within parent", async () => {
		const { getByText } = await render(Chatbot, {
			...default_props,
			value: [
				{
					role: "assistant",
					content: [{ type: "text", text: "Parent content" }],
					index: 0,
					metadata: { title: "Parent Thought", id: "1", status: "pending" }
				} as Message,
				{
					role: "assistant",
					content: [{ type: "text", text: "Child content" }],
					index: 1,
					metadata: {
						title: "Child Thought",
						id: "2",
						parent_id: "1",
						status: "pending"
					}
				} as Message
			]
		});

		// Both should render — parent auto-expanded because status=pending
		expect(getByText("Parent Thought")).toBeTruthy();
		expect(getByText("Child Thought")).toBeTruthy();
	});

	test("integer duration renders without decimal", async () => {
		const { getByText } = await render(Chatbot, {
			...default_props,
			value: [
				{
					role: "assistant",
					content: [{ type: "text", text: "Done" }],
					index: 0,
					metadata: {
						title: "Step",
						id: "1",
						duration: 3,
						status: "done"
					}
				} as Message
			]
		});

		expect(getByText(/3s/)).toBeTruthy();
	});

	test("sub-second duration renders in milliseconds", async () => {
		const { getByText } = await render(Chatbot, {
			...default_props,
			value: [
				{
					role: "assistant",
					content: [{ type: "text", text: "Fast" }],
					index: 0,
					metadata: {
						title: "Quick Step",
						id: "1",
						duration: 0.05,
						status: "done"
					}
				} as Message
			]
		});

		expect(getByText(/50\.0ms/)).toBeTruthy();
	});
});

// ── Visual-only (test.todo) ──────────────────────────────────────────

test.todo(
	"VISUAL: layout='bubble' renders messages in speech bubble style — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: layout='panel' renders messages in panel style — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: avatar_images displays user and bot avatars next to messages — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: rtl=true renders right-to-left layout — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: height/min_height/max_height control component sizing — needs Playwright visual regression screenshot comparison"
);
