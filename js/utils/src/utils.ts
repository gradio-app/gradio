export interface SelectData {
	index: number | [number, number];
	value: any;
	selected?: boolean;
}

export interface ShareData {
	description: string;
	title_from_inputs: boolean;
}

export const uploadToHuggingFace = async (data: string, type: "base64" | "url") => {
	let blob: Blob;
	let contentType: string;
	if (type === "url") {
		const response = await fetch(data);
		blob = await response.blob();
		contentType = response.headers.get("content-type") || "";
	} else {
		blob = dataURLtoBlob(data);
		contentType = data.split(";")[0].split(":")[1];
	}

	// Create form data
	const formData = new FormData();
	formData.append('file', blob);

	// Send file to endpoint
	const uploadResponse = await fetch("https://huggingface.co/uploads", {
		method: 'POST',
		body: formData,
		headers: {
			'Content-Type': contentType,
			'X-Requested-With': 'XMLHttpRequest',
		}		
	});

	// Check status of response
	if (!uploadResponse.ok) {
		throw new Error(`Upload failed with status ${uploadResponse.status}`);
	}

	// Return response if needed
	const result = await uploadResponse.text();
	return result;

}

function dataURLtoBlob(dataurl: string) {
	var arr = dataurl.split(','), mime = (arr[0].match(/:(.*?);/) as RegExpMatchArray)[1],
		bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}