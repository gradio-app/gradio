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

export const playable = (): boolean => {
	// let video_element = document.createElement("video");
	// let mime_type = mime.lookup(filename);
	// return video_element.canPlayType(mime_type) != "";
	return true; // FIX BEFORE COMMIT - mime import causing issues
};
