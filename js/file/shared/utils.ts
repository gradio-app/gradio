import type { FileData } from "@gradio/client";

export const prettyBytes = (bytes: number): string => {
	let units = ["B", "KB", "MB", "GB", "PB"];
	let i = 0;
	while (bytes > 1024) {
		bytes /= 1024;
		i++;
	}
	let unit = units[i];
	return bytes.toFixed(1) + "&nbsp;" + unit;
};

export const display_file_name = (value: FileData): string => {
	var str: string;
	str = value.orig_name;
	const max_length = 30;

	if (str.length > max_length) {
		const truncated_name = str.substring(0, max_length);
		const file_extension_index = str.lastIndexOf(".");
		if (file_extension_index !== -1) {
			const file_extension = str.slice(file_extension_index);
			return `${truncated_name}..${file_extension}`;
		}
		return truncated_name;
	}
	return str;
};

export const display_file_size = (value: FileData | FileData[]): string => {
	var total_size = 0;
	if (Array.isArray(value)) {
		for (var file of value) {
			if (file.size !== undefined) total_size += file.size;
		}
	} else {
		total_size = value.size || 0;
	}
	return prettyBytes(total_size);
};
