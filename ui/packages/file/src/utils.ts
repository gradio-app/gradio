import type { FileData } from "@gradio/upload";

export const prettyBytes = (bytes: number): string => {
	let units = ["B", "KB", "MB", "GB", "PB"];
	let i = 0;
	while (bytes > 1024) {
		bytes /= 1024;
		i++;
	}
	let unit = units[i];
	return bytes.toFixed(1) + " " + unit;
};

export const display_file_name = (
	value: FileData | Array<FileData>
): string => {
	var str: string;
	if (Array.isArray(value)) {
		if (value.length > 1) {
			return value.length + " files";
		} else {
			str = value[0].name;
		}
	} else {
		str = value.name;
	}
	if (str.length > 30) {
		return `${str.substr(0, 30)}...`;
	} else return str;
};

export const download_files = (value: FileData | Array<FileData>): string => {
	return Array.isArray(value) ? value[0].data : value.data;
};

export const display_file_size = (
	value: FileData | Array<FileData>
): string => {
	var total_size = 0;
	if (Array.isArray(value)) {
		for (var file of value) {
			console.log(file)
			total_size += file.size;
		}
	} else {
		total_size = value.size;
	}
	return prettyBytes(total_size || 0);
};
