import {
	Graphics,
	type IRenderer,
	type Container,
	Sprite,
	RenderTexture
} from "pixi.js";
import { type Command } from "../utils/commands";
import { spring } from "svelte/motion";
import type { Writable } from "svelte/store";

export interface CropCommand extends Command {
	start: (
		width: number,
		height: number,
		previous_crop: [number, number, number, number],
		preview?: boolean,
		set_previous?: boolean
	) => void;
	stop: () => number;
	continue: (
		crop_size: [number, number, number, number],
		preview?: boolean
	) => void;
}

export function crop_canvas(
	renderer: IRenderer,
	mask_container: Container,
	crop: Writable<[number, number, number, number]>,
	current_opacity = 0
): CropCommand {
	let text: RenderTexture;
	let sprite: Sprite;
	const mask_graphics = new Graphics();
	let previous_crop: [number, number, number, number];
	let final_crop: [number, number, number, number];
	let width: number;
	let height: number;
	let alpha_spring = spring(current_opacity, {
		stiffness: 0.1,
		damping: 0.5
	});

	let spring_value = current_opacity;
	alpha_spring.subscribe((value) => {
		if (!final_crop) return;
		spring_value = value;
		crop_mask(width, height, final_crop, true);
	});

	function crop_mask(
		width: number,
		height: number,
		crop_size: [number, number, number, number],
		preview: boolean
	): void {
		mask_graphics.clear();
		if (preview) {
			mask_graphics.beginFill(0xffffff, spring_value);
			mask_graphics.drawRect(0, 0, width, height);
			mask_graphics.endFill();
		}
		mask_graphics.beginFill(0xffffff, 1);
		mask_graphics.drawRect(...crop_size);
		mask_graphics.endFill();

		renderer.render(mask_graphics, {
			renderTexture: text
		});
	}

	let clean = true;
	let stopped = false;

	return {
		start: (
			_width: number,
			_height: number,
			_previous_crop: [number, number, number, number],
			_preview = true,
			set_previous = true
		) => {
			clean = false;
			text = RenderTexture.create({
				width: _width,
				height: _height
			});

			crop_mask(_width, _height, _previous_crop, _preview);
			sprite = new Sprite(text);
			mask_container.mask = sprite;
			width = _width;
			height = _height;
			if (set_previous)
				previous_crop = JSON.parse(JSON.stringify(_previous_crop));
		},
		continue: (crop_size: [number, number, number, number], preview = true) => {
			final_crop = JSON.parse(JSON.stringify(crop_size));
			if (spring_value === 0.2) {
				crop_mask(width, height, final_crop, preview);
			} else {
				alpha_spring.set(0.2);
			}
		},

		undo() {
			this.start(width, height, previous_crop, false);
			crop.set([
				previous_crop[0] / width,
				previous_crop[1] / height,
				previous_crop[2] / width,
				previous_crop[3] / height
			]);
			clean = true;
		},
		stop() {
			stopped = true;
			return spring_value;
		},
		execute() {
			if (clean) {
				this.start(width, height, final_crop, false);

				crop.set([
					final_crop[0] / width,
					final_crop[1] / height,
					final_crop[2] / width,
					final_crop[3] / height
				]);
				clean = true;
			} else {
				if (!stopped) {
					alpha_spring.set(0);
				}

				crop.set([
					final_crop[0] / width,
					final_crop[1] / height,
					final_crop[2] / width,
					final_crop[3] / height
				]);

				clean = true;
			}
		}
	};
}

export function resize_and_reposition(
	original_width: number,
	original_height: number,
	anchor: "t" | "r" | "l" | "b" | "tl" | "tr" | "bl" | "br" | "c",
	aspect_ratio: number,
	max_width: number,
	max_height: number
): {
	new_width: number;
	new_height: number;
	x_offset: number;
	y_offset: number;
} {
	let new_width = original_width;
	let new_height = original_height;

	// Calculate new dimensions based on aspect ratio
	if (anchor.includes("t") || anchor.includes("b") || anchor == "c") {
		new_width = original_height * aspect_ratio;
	}
	if (anchor.includes("l") || anchor.includes("r") || anchor == "c") {
		new_height = original_width / aspect_ratio;
	}

	// Ensure aspect ratio is maintained
	new_height = new_height || new_width / aspect_ratio;
	new_width = new_width || new_height * aspect_ratio;

	// Apply max width/height constraints and adjust dimensions
	if (new_width > max_width) {
		new_width = max_width;
		new_height = new_width / aspect_ratio;
	}
	if (new_height > max_height) {
		new_height = max_height;
		new_width = new_height * aspect_ratio;
	}

	// Calculate offsets to ensure anchor position is maintained
	let x_offset = 0;
	let y_offset = 0;
	if (anchor.includes("r")) {
		x_offset = original_width - new_width;
	} else if (anchor.includes("l")) {
		x_offset = 0;
	} else {
		// Center or top/bottom center
		x_offset = (original_width - new_width) / 2;
	}

	if (anchor.includes("b")) {
		y_offset = original_height - new_height;
	} else if (anchor.includes("t")) {
		y_offset = 0;
	} else {
		// Center or left/right center
		y_offset = (original_height - new_height) / 2;
	}

	return {
		new_width: new_width,
		new_height: new_height,
		x_offset: x_offset,
		y_offset: y_offset
	};
}
