export const get_coordinates_of_clicked_image = (
	evt: MouseEvent
): [number, number] | null => {
	let image;
	if (evt.currentTarget instanceof Element) {
		image = evt.currentTarget.querySelector("img") as HTMLImageElement;
	} else {
		return [NaN, NaN];
	}

	const imageRect = image.getBoundingClientRect();
	const xScale = image.naturalWidth / imageRect.width;
	const yScale = image.naturalHeight / imageRect.height;
	if (xScale > yScale) {
		const displayed_height = image.naturalHeight / xScale;
		const y_offset = (imageRect.height - displayed_height) / 2;
		var x = Math.round((evt.clientX - imageRect.left) * xScale);
		var y = Math.round((evt.clientY - imageRect.top - y_offset) * xScale);
	} else {
		const displayed_width = image.naturalWidth / yScale;
		const x_offset = (imageRect.width - displayed_width) / 2;
		var x = Math.round((evt.clientX - imageRect.left - x_offset) * yScale);
		var y = Math.round((evt.clientY - imageRect.top) * yScale);
	}
	if (x < 0 || x >= image.naturalWidth || y < 0 || y >= image.naturalHeight) {
		return null;
	}
	return [x, y];
};
