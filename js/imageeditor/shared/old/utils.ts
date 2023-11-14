export const get_coordinates_of_clicked_image = (
	evt: MouseEvent
): [number, number] | null => {
	let image = evt.currentTarget as HTMLImageElement;

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

export function click_outside(node: Node, cb: any): any {
	const handle_click = (event: MouseEvent): void => {
		if (
			node &&
			!node.contains(event.target as Node) &&
			!event.defaultPrevented
		) {
			cb(event);
		}
	};

	document.addEventListener("click", handle_click, true);

	return {
		destroy() {
			document.removeEventListener("click", handle_click, true);
		}
	};
}

export const erase_shader = `
precision highp float;

uniform sampler2D uDrawingTexture;
uniform sampler2D uEraserTexture;

varying vec2 vTextureCoord;

void main(void) {
	vec4 drawingColor = texture2D(uDrawingTexture,vTextureCoord);
	vec4 eraserColor = texture2D(uEraserTexture, vTextureCoord);

	// Use the alpha of the eraser to determine how much to "erase" from the drawing
	float alpha = 1.0 - eraserColor.a;
	gl_FragColor = vec4(drawingColor.rgb * alpha, drawingColor.a * alpha);
}`;
