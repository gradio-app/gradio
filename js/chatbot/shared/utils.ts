import type { FileData } from "@gradio/client";
import type { ComponentType, SvelteComponent } from "svelte";
import { uploadToHuggingFace } from "@gradio/utils";
import type {
	ComponentMessage,
	ComponentData,
	TextMessage,
	NormalisedMessage,
	Message,
	MessageRole,
	ThoughtNode,
	Text,
	Component,
	File
} from "../types";
import type { LoadedComponent } from "../../core/src/types";
import { Gradio } from "@gradio/utils";

export const format_chat_for_sharing = async (
	chat: NormalisedMessage[],
	url_length_limit = 1800
): Promise<string> => {
	let messages_to_share = [...chat];
	let formatted = await format_messages(messages_to_share);

	if (formatted.length > url_length_limit && messages_to_share.length > 2) {
		const first_message = messages_to_share[0];
		const last_message = messages_to_share[messages_to_share.length - 1];
		messages_to_share = [first_message, last_message];
		formatted = await format_messages(messages_to_share);
	}

	if (formatted.length > url_length_limit && messages_to_share.length > 0) {
		const truncated_messages = messages_to_share.map((msg) => {
			if (msg.type === "text") {
				const max_length =
					Math.floor(url_length_limit / messages_to_share.length) - 20;
				if (msg.content.length > max_length) {
					return {
						...msg,
						content: msg.content.substring(0, max_length) + "..."
					};
				}
			}
			return msg;
		});

		messages_to_share = truncated_messages;
		formatted = await format_messages(messages_to_share);
	}

	return formatted;
};

const format_messages = async (chat: NormalisedMessage[]): Promise<string> => {
	let messages = await Promise.all(
		chat.map(async (message) => {
			if (message.role === "system") return "";
			let speaker_emoji = message.role === "user" ? "😃" : "🤖";
			let html_content = "";

			if (message.type === "text") {
				const regexPatterns = {
					audio: /<audio.*?src="(\/file=.*?)"/g,
					video: /<video.*?src="(\/file=.*?)"/g,
					image: /<img.*?src="(\/file=.*?)".*?\/>|!\[.*?\]\((\/file=.*?)\)/g
				};

				html_content = message.content;

				for (let [_, regex] of Object.entries(regexPatterns)) {
					let match;

					while ((match = regex.exec(message.content)) !== null) {
						const fileUrl = match[1] || match[2];
						const newUrl = await uploadToHuggingFace(fileUrl, "url");
						html_content = html_content.replace(fileUrl, newUrl);
					}
				}
			} else {
				if (!message.content.value) return "";
				const url =
					message.content.component === "video"
						? message.content.value?.video.path
						: message.content.value;
				const file_url = await uploadToHuggingFace(url, "url");
				if (message.content.component === "audio") {
					html_content = `<audio controls src="${file_url}"></audio>`;
				} else if (message.content.component === "video") {
					html_content = file_url;
				} else if (message.content.component === "image") {
					html_content = `<img src="${file_url}" />`;
				}
			}

			return `${speaker_emoji}: ${html_content}`;
		})
	);
	return messages.filter((msg) => msg !== "").join("\n");
};

export interface UndoRetryData {
	index: number | [number, number];
	value: string | FileData | ComponentData;
}

export interface EditData {
	index: number | [number, number];
	value: string;
	previous_value: string;
	_dispatch_value: { type: "text"; text: string }[];
}

const redirect_src_url = (src: string, root: string): string =>
	src.replace('src="/file', `src="${root}file`);

function get_component_for_mime_type(
	mime_type: string | null | undefined,
	file?: { path?: string }
): string {
	if (!mime_type) {
		const path = file?.path;
		if (path) {
			const lower_path = path.toLowerCase();
			if (
				lower_path.endsWith(".glb") ||
				lower_path.endsWith(".gltf") ||
				lower_path.endsWith(".obj") ||
				lower_path.endsWith(".stl") ||
				lower_path.endsWith(".splat") ||
				lower_path.endsWith(".ply")
			) {
				return "model3d";
			}
		}
		return "file";
	}
	if (mime_type.includes("audio")) return "audio";
	if (mime_type.includes("video")) return "video";
	if (mime_type.includes("image")) return "image";
	if (mime_type.includes("model")) return "model3d";
	return "file";
}

function convert_file_message_to_component_message(
	message: File
): ComponentData {
	const _file = Array.isArray(message.file) ? message.file[0] : message.file;
	const component = get_component_for_mime_type(_file?.mime_type, _file);
	// Ensure that value is always an array for files
	return {
		component: component,
		value:
			component === "file"
				? Array.isArray(message.file)
					? message.file
					: [message.file]
				: message.file,
		alt_text: message.alt_text,
		constructor_args: {},
		props: {}
	} as ComponentData;
}

function normalise_message(
	message: Message,
	content: Text | File | Component,
	root: string,
	i: number
): NormalisedMessage {
	let normalized: NormalisedMessage;
	if (content.type === "text") {
		normalized = {
			role: message.role,
			metadata: message.metadata,
			content: redirect_src_url(content.text, root),
			type: "text",
			index: i,
			options: message.options
		};
	} else if (content.type === "file") {
		normalized = {
			role: message.role,
			metadata: message.metadata,
			content: convert_file_message_to_component_message(content),
			type: "component",
			index: i,
			options: message.options
		};
	} else {
		normalized = {
			role: message.role,
			metadata: message.metadata,
			content: content,
			type: "component",
			index: i,
			options: message.options
		};
	}
	return normalized;
}

export function normalise_messages(
	messages: Message[] | null,
	root: string
): NormalisedMessage[] | null {
	if (messages === null) return messages;

	const thought_map = new Map<string, ThoughtNode>();

	return messages
		.flatMap((message, i) => {
			const normalized: NormalisedMessage[] = message.content.map((content) =>
				normalise_message(message, content, root, i)
			);
			for (const msg of normalized) {
				const { id, title, parent_id } = message.metadata || {};
				if (parent_id) {
					const parent = thought_map.get(String(parent_id));
					if (parent) {
						const thought = { ...msg, children: [] } as ThoughtNode;
						parent.children.push(thought);
						if (id && title) {
							thought_map.set(String(id), thought);
						}
						return null;
					}
				}
				if (id && title) {
					const thought = { ...msg, children: [] } as ThoughtNode;
					thought_map.set(String(id), thought);
					return thought;
				}
			}
			return normalized;
		})
		.filter((msg): msg is NormalisedMessage => msg !== null);
}

export function is_component_message(
	message: NormalisedMessage
): message is ComponentMessage {
	return message.type === "component";
}

export function is_last_bot_message(
	messages: NormalisedMessage[],
	all_messages: NormalisedMessage[]
): boolean {
	const is_bot = messages[messages.length - 1].role === "assistant";
	const last_index = messages[messages.length - 1].index;
	// use JSON.stringify to handle both the number and tuple cases
	// when msg_format is tuples, last_index is an array and when it is messages, it is a number
	const is_last =
		JSON.stringify(last_index) ===
		JSON.stringify(all_messages[all_messages.length - 1].index);
	return is_last && is_bot;
}

export function group_messages(
	messages: NormalisedMessage[],
	display_consecutive_in_same_bubble = true
): NormalisedMessage[][] {
	const groupedMessages: NormalisedMessage[][] = [];
	let currentGroup: NormalisedMessage[] = [];
	let currentRole: MessageRole | null = null;

	for (const message of messages) {
		if (!(message.role === "assistant" || message.role === "user")) {
			continue;
		}

		// If display_consecutive_in_same_bubble is false, each message should be its own group
		if (!display_consecutive_in_same_bubble) {
			groupedMessages.push([message]);
			continue;
		}

		if (message.role === currentRole) {
			currentGroup.push(message);
		} else {
			if (currentGroup.length > 0) {
				groupedMessages.push(currentGroup);
			}
			currentGroup = [message];
			currentRole = message.role;
		}
	}

	if (currentGroup.length > 0) {
		groupedMessages.push(currentGroup);
	}

	return groupedMessages;
}

export async function load_components(
	component_names: string[],
	_components: Record<string, ComponentType<SvelteComponent>>,
	load_component: Gradio["load_component"]
): Promise<Record<string, ComponentType<SvelteComponent>>> {
	for (const component_name of component_names) {
		if (_components[component_name] || component_name === "file") {
			continue;
		}
		const variant = component_name === "dataframe" ? "component" : "base";
		const comp = await load_component(component_name, variant);
		// @ts-ignore
		_components[component_name] = comp.default;
	}
	return _components;
}

export function get_components_from_messages(
	messages: NormalisedMessage[] | null
): string[] {
	if (!messages) return [];
	let components: Set<string> = new Set();
	messages.forEach((message) => {
		if (message.type === "component") {
			components.add(message.content.component);
		}
	});
	return Array.from(components);
}

export function get_thought_content(msg: NormalisedMessage, depth = 0): string {
	let content = "";
	const indent = "  ".repeat(depth);

	if (msg.metadata?.title) {
		content += `${indent}${depth > 0 ? "- " : ""}${msg.metadata.title}\n`;
	}
	if (typeof msg.content === "string") {
		content += `${indent}  ${msg.content}\n`;
	}
	const thought = msg as ThoughtNode;
	if (thought.children?.length > 0) {
		content += thought.children
			.map((child) => get_thought_content(child, depth + 1))
			.join("");
	}
	return content;
}

export function all_text(message: TextMessage[] | TextMessage): string {
	if (Array.isArray(message)) {
		return message
			.map((m) => {
				if (m.metadata?.title) {
					return get_thought_content(m);
				}
				return m.content;
			})
			.join("\n");
	}
	if (message.metadata?.title) {
		return get_thought_content(message);
	}
	return message.content;
}

export function is_all_text(
	message: NormalisedMessage[] | NormalisedMessage
): message is TextMessage[] | TextMessage {
	return (
		(Array.isArray(message) &&
			message.every((m) => typeof m.content === "string")) ||
		(!Array.isArray(message) && typeof message.content === "string")
	);
}
