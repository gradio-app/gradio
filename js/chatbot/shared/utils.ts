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
	MessageRole
} from "../types";
import type { LoadedComponent } from "../../core/src/types";
import { Gradio } from "@gradio/utils";
export const format_chat_for_sharing = async (
	chat: NormalisedMessage[]
): Promise<string> => {
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
	return messages.join("\n");
};

export interface UndoRetryData {
	index: number | [number, number];
	value: string | FileData | ComponentData;
}

const redirect_src_url = (src: string, root: string): string =>
	src.replace('src="/file', `src="${root}file`);

function get_component_for_mime_type(
	mime_type: string | null | undefined
): string {
	if (!mime_type) return "file";
	if (mime_type.includes("audio")) return "audio";
	if (mime_type.includes("video")) return "video";
	if (mime_type.includes("image")) return "image";
	return "file";
}

function convert_file_message_to_component_message(
	message: any
): ComponentData {
	const _file = Array.isArray(message.file) ? message.file[0] : message.file;
	return {
		component: get_component_for_mime_type(_file?.mime_type),
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
	return messages.map((message, i) => {
		if (typeof message.content === "string") {
			return {
				role: message.role,
				metadata: message.metadata,
				content: redirect_src_url(message.content, root),
				type: "text",
				index: i,
				options: message.options
			};
		} else if ("file" in message.content) {
			return {
				content: convert_file_message_to_component_message(message.content),
				metadata: message.metadata,
				role: message.role,
				type: "component",
				index: i,
				options: message.options
			};
		}
		return { type: "component", ...message } as ComponentMessage;
	});
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
		if (msg_format === "tuples") {
			currentRole = null;
		}

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

		const { name, component } = load_component(component_name, "base");
		names.push(name);
		components.push(component);
		component_name;
	});

	const loaded_components: LoadedComponent[] = await Promise.all(components);
	loaded_components.forEach((component, i) => {
		_components[names[i]] = component.default;
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
