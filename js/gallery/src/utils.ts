import { uploadToHuggingFace } from "@gradio/utils";
import type { FileData } from "@gradio/upload";

export const format_gallery_for_sharing = async (
	value: string[] | FileData[] | null
) => {
	if (!value) return "";
	let urls = await Promise.all(
		value.map(async (image) => {
			if (typeof image === "string")
				return await uploadToHuggingFace(image, "base64");
			return await uploadToHuggingFace(image.data, "url");
		})
	);

	return `<div style="display: flex; flex-wrap: wrap; gap: 16px">${urls
		.map((url) => `<img src="${url}" style="height: 400px" />`)
		.join("")}</div>`;
};
