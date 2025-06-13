import type { FileData } from "@gradio/client";
import type { ComponentType, SvelteComponent } from "svelte";
import { uploadToHuggingFace } from "@gradio/utils";
import type {
	TupleFormat,
	ComponentMessage,
	ComponentData,
	TextMessage,
	NormalisedMessage,
	Message,
	MessageRole,
	ThoughtNode
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
	message: any
): ComponentData {
	const _file = Array.isArray(message.file) ? message.file[0] : message.file;
	return {
		component: get_component_for_mime_type(_file?.mime_type, _file),
		value: message.file,
		alt_text: message.alt_text,
		constructor_args: {},
		props: {}
	} as ComponentData;
}

export function normalise_messages(
	messages: Message[] | null,
	root: string
): NormalisedMessage[] | null {
	if (messages === null) return messages;

	const thought_map = new Map<string, ThoughtNode>();

	return messages
		.map((message, i) => {
			let normalized: NormalisedMessage =
				typeof message.content === "string"
					? {
							role: message.role,
							metadata: message.metadata,
							content: redirect_src_url(message.content, root),
							type: "text",
							index: i,
							options: message.options
						}
					: "file" in message.content
						? {
								content: convert_file_message_to_component_message(
									message.content
								),
								metadata: message.metadata,
								role: message.role,
								type: "component",
								index: i,
								options: message.options
							}
						: ({ type: "component", ...message } as ComponentMessage);

			// handle thoughts
			const { id, title, parent_id } = message.metadata || {};
			if (parent_id) {
				const parent = thought_map.get(String(parent_id));
				if (parent) {
					const thought = { ...normalized, children: [] } as ThoughtNode;
					parent.children.push(thought);
					if (id && title) {
						thought_map.set(String(id), thought);
					}
					return null;
				}
			}
			if (id && title) {
				const thought = { ...normalized, children: [] } as ThoughtNode;
				thought_map.set(String(id), thought);
				return thought;
			}

			return normalized;
		})
		.filter((msg): msg is NormalisedMessage => msg !== null);
}

export function normalise_tuples(
	messages: TupleFormat,
	root: string
): NormalisedMessage[] | null {
	if (messages === null) return messages;
	const msg = messages.flatMap((message_pair, i) => {
		return message_pair.map((message, index) => {
			if (message == null) return null;
			const role = index == 0 ? "user" : "assistant";

			if (typeof message === "string") {
				return {
					role: role,
					type: "text",
					content: redirect_src_url(message, root),
					metadata: { title: null },
					index: [i, index]
				} as TextMessage;
			}

			if ("file" in message) {
				return {
					content: convert_file_message_to_component_message(message),
					role: role,
					type: "component",
					index: [i, index]
				} as ComponentMessage;
			}

			return {
				role: role,
				content: message,
				type: "component",
				index: [i, index]
			} as ComponentMessage;
		});
	});
	return msg.filter((message) => message != null) as NormalisedMessage[];
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
	msg_format: "messages" | "tuples"
): NormalisedMessage[][] {
	const groupedMessages: NormalisedMessage[][] = [];
	let currentGroup: NormalisedMessage[] = [];
	let currentRole: MessageRole | null = null;

	for (const message of messages) {
		if (!(message.role === "assistant" || message.role === "user")) {
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
	let names: string[] = [];
	let components: ReturnType<typeof load_component>["component"][] = [];

	component_names.forEach((component_name) => {
		if (_components[component_name] || component_name === "file") {
			return;
		}
		const variant =
			component_name === "dataframe" || component_name === "model3d"
				? "component"
				: "base";
		const { name, component } = load_component(component_name, variant);
		names.push(name);
		components.push(component);
		component_name;
	});

	const resolved_components = await Promise.allSettled(components);
	const supported_components: [number, LoadedComponent][] = resolved_components
		.map((result, index) =>
			result.status === "fulfilled" ? [index, result.value] : null
		)
		.filter((item): item is [number, LoadedComponent] => item !== null);

	supported_components.forEach(([originalIndex, component]) => {
		_components[names[originalIndex]] = component.default;
	});

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
