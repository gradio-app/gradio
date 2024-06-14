import type { FileData } from "@gradio/client";
import { uploadToHuggingFace } from "@gradio/utils";

export const format_chat_for_sharing = async (
	chat: [string | FileData | null, string | FileData | null][]
): Promise<string> => {
	let messages = await Promise.all(
		chat.map(async (message_pair) => {
			return await Promise.all(
				message_pair.map(async (message, i) => {
					if (message === null) return "";
					let speaker_emoji = i === 0 ? "😃" : "🤖";
					let html_content = "";

					if (typeof message === "string") {
						const regexPatterns = {
							audio: /<audio.*?src="(\/file=.*?)"/g,
							video: /<video.*?src="(\/file=.*?)"/g,
							image: /<img.*?src="(\/file=.*?)".*?\/>|!\[.*?\]\((\/file=.*?)\)/g
						};

						html_content = message;

						for (let [_, regex] of Object.entries(regexPatterns)) {
							let match;

							while ((match = regex.exec(message)) !== null) {
								const fileUrl = match[1] || match[2];
								const newUrl = await uploadToHuggingFace(fileUrl, "url");
								html_content = html_content.replace(fileUrl, newUrl);
							}
						}
					} else {
						if (!message?.url) return "";
						const file_url = await uploadToHuggingFace(message.url, "url");
						if (message.mime_type?.includes("audio")) {
							html_content = `<audio controls src="${file_url}"></audio>`;
						} else if (message.mime_type?.includes("video")) {
							html_content = file_url;
						} else if (message.mime_type?.includes("image")) {
							html_content = `<img src="${file_url}" />`;
						}
					}

					return `${speaker_emoji}: ${html_content}`;
				})
			);
		})
	);
	return messages
		.map((message_pair) =>
			message_pair.join(
				message_pair[0] !== "" && message_pair[1] !== "" ? "\n" : ""
			)
		)
		.join("\n");
};

export interface ComponentMessage {
	type: "component";
	component: string;
	value: any;
	constructor_args: any;
	props: any;
	id: string;
}
export interface TextMessage {
	type: "text";
	value: string;
	id: string;
}

export interface FileMessage {
	type: "file";
	file: FileData | FileData[];
	alt_text: string | null;
	id: string;
}

export interface EmptyMessage {
	type: "empty";
	value: null;
	id: string;
}

export type NormalisedMessage =
	| TextMessage
	| FileMessage
	| ComponentMessage
	| EmptyMessage;

export type message_data =
	| string
	| { file: FileData | FileData[]; alt_text: string | null }
	| { component: string; value: any; constructor_args: any; props: any }
	| null;

export type messages = [message_data, message_data][] | null;

function make_id(): string {
	return Math.random().toString(36).substring(7);
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

export function normalise_messages(
	messages: messages,
	root: string
): [NormalisedMessage, NormalisedMessage][] | null {
	if (messages === null) return null;
	return messages.map((message_pair) => {
		return message_pair.map((message) => {
			if (message == null) return { value: null, id: make_id(), type: "empty" };

			if (typeof message === "string") {
				return {
					type: "text",
					value: redirect_src_url(message, root),
					id: make_id()
				};
			}

			if ("file" in message) {
				const _file = Array.isArray(message.file)
					? message.file[0]
					: message.file;
				return {
					type: "component",
					component: get_component_for_mime_type(_file?.mime_type),
					value: message.file,
					alt_text: message.alt_text,
					id: make_id()
				};
			}

			return { ...message, type: "component", id: make_id() };
		}) as [NormalisedMessage, NormalisedMessage];
	});
}
