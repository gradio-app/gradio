import { uploadToHuggingFace } from "@gradio/utils";
import { FileData } from "@gradio/client";

export async function format_gallery_for_sharing(
	value: [FileData, string | null][] | null
): Promise<string> {
	if (!value) return "";
	let urls = await Promise.all(
		value.map(async ([image, _]) => {
			if (image === null || !image.url) return "";
			return await uploadToHuggingFace(image.url, "url");
		})
	);

	return `<div style="display: flex; flex-wrap: wrap; gap: 16px">${urls
		.map((url) => `<img src="${url}" style="height: 400px" />`)
		.join("")}</div>`;
}

export async function handle_save(
	img_blob: Blob | any,
	upload: any
): Promise<FileData[]> {
	const f_ = new File([img_blob], `image.png`);
	const files = [
		new FileData({
			path: f_.name,
			orig_name: f_.name,
			blob: f_,
			size: f_.size,
			mime_type: f_.type,
			is_stream: false
		})
	];
	return await upload(...files);
}
