export interface SelectData {
	index: number | [number, number];
	value: any;
	selected?: boolean;
}

export interface ShareData {
	description: string;
	title?: string;
}

export class ShareError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ShareError";
	}
}

export async function uploadToHuggingFace(
	data: string,
	type: "base64" | "url"
): Promise<string> {
	if (window.__gradio_space__ == null) {
		throw new ShareError("Must be on Spaces to share.");
	}
	let blob: Blob;
	let contentType: string;
	let filename: string;
	if (type === "url") {
		const response = await fetch(data);
		blob = await response.blob();
		contentType = response.headers.get("content-type") || "";
		filename = response.headers.get("content-disposition") || "";
	} else {
		blob = dataURLtoBlob(data);
		contentType = data.split(";")[0].split(":")[1];
		filename = "file" + contentType.split("/")[1];
	}

	const file = new File([blob], filename, { type: contentType });

	// Send file to endpoint
	const uploadResponse = await fetch("https://huggingface.co/uploads", {
		method: "POST",
		body: file,
		headers: {
			"Content-Type": file.type,
			"X-Requested-With": "XMLHttpRequest"
		}
	});

	// Check status of response
	if (!uploadResponse.ok) {
		if (
			uploadResponse.headers.get("content-type")?.includes("application/json")
		) {
			const error = await uploadResponse.json();
			throw new ShareError(`Upload failed: ${error.error}`);
		}
		throw new ShareError(`Upload failed.`);
	}

	// Return response if needed
	const result = await uploadResponse.text();
	return result;
}

function dataURLtoBlob(dataurl: string): Blob {
	var arr = dataurl.split(","),
		mime = (arr[0].match(/:(.*?);/) as RegExpMatchArray)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}
