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
