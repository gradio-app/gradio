import type { FileData } from "@gradio/client";
import { uploadToHuggingFace } from "@gradio/utils";
import type { SvelteComponent } from "svelte";

export async function dynamicImportComponent(
	componentName: string
): Promise<typeof SvelteComponent> {
	const basePath = "@gradio/";
	const baseComponentName =
		componentName.charAt(0).toUpperCase() + componentName.slice(1);

	const importPaths = [
		`${basePath}${componentName.toLowerCase()}`,
		`${basePath}${componentName.toLowerCase()}`
	];

	const componentNames = [
		`BaseStatic${baseComponentName}`,
		`Base${baseComponentName}`
	];

	for (let i = 0; i < importPaths.length; i++) {
		const path = importPaths[i];
		const componentName = componentNames[i];
		try {
			const module = await import(path);
			return module[componentName];
		} catch (error) {}
	}

	throw new Error(
		`Component ${componentName} not found as BaseStatic${baseComponentName} or Base${baseComponentName}`
	);
}

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
