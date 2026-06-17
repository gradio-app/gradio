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
	// The image is rendered with `object-fit: scale-down`: centered, never
	// scaled above its natural size, so empty space can appear on both axes.
	const scale = Math.min(
		imageRect.width / image.naturalWidth,
		imageRect.height / image.naturalHeight,
		1
	);
	const x_offset = (imageRect.width - image.naturalWidth * scale) / 2;
	const y_offset = (imageRect.height - image.naturalHeight * scale) / 2;
	const x = Math.round((evt.clientX - imageRect.left - x_offset) / scale);
	const y = Math.round((evt.clientY - imageRect.top - y_offset) / scale);
	if (x < 0 || x >= image.naturalWidth || y < 0 || y >= image.naturalHeight) {
		return null;
	}
	return [x, y];
};
