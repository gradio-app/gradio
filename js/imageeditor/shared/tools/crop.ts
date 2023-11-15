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
		set_previous?: boolean
	) => void;
	continue: (crop_size: [number, number, number, number]) => void;
}

export function crop_canvas(
	renderer: IRenderer,
	mask_container: Container,
	crop: Writable<[number, number, number, number]>
): CropCommand {
	let text: RenderTexture;
	let sprite: Sprite;
	const mask_graphics = new Graphics();
	let previous_crop: [number, number, number, number];
	let final_crop: [number, number, number, number];
	let width: number;
	let height: number;
	let alpha_spring = spring(0, {
		stiffness: 0.1,
		damping: 0.5
	});

	let spring_value = 0;
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

	return {
		start: (
			_width: number,
			_height: number,
			_previous_crop: [number, number, number, number],
			set_previous = true
		) => {
			clean = false;
			text = RenderTexture.create({
				width: _width,
				height: _height
			});
			crop_mask(_width, _height, _previous_crop, false);
			sprite = new Sprite(text);
			mask_container.mask = sprite;
			width = _width;
			height = _height;
			if (set_previous)
				previous_crop = JSON.parse(JSON.stringify(_previous_crop));
		},
		continue: (crop_size: [number, number, number, number]) => {
			final_crop = JSON.parse(JSON.stringify(crop_size));
			if (spring_value === 0.2) {
				crop_mask(width, height, final_crop, true);
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
				alpha_spring.set(0);
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
