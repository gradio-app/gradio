import {
	Container,
	type IRenderer,
	type DisplayObject,
	RenderTexture,
	Texture,
	Sprite,
	Filter
} from "pixi.js";

import { type Command } from "../utils/commands";
import { get, writable, type Writable } from "svelte/store";

/**
 * GLSL Shader that takes two textures and erases the second texture from the first.
 */
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

/**
 * Interface holding data for a layer
 */
export interface LayerScene {
	/**
	 * The texture used for tracking brush strokes.
	 */
	draw_texture: RenderTexture;
	/**
	 * The texture used for tracking eraser strokes.
	 */
	erase_texture: RenderTexture;
	/**
	 * The sprite used for displaying the composite of the draw and erase textures.
	 */
	composite: Sprite;
	/**
	 * The filter used for combining the draw and erase textures into a composite texture.
	 */
	filter?: Filter;
}

/**
 * Interface for managing layers.
 */
interface LayerManager {
	/**
	 * Adds a layer to the container.
	 * @param layer The container to add the layer to.
	 * @param renderer The renderer to use for the layer.
	 * @param width the width of the layer
	 * @param height the height of the layer
	 */
	add_layer(
		container: Container,
		renderer: IRenderer,
		width: number,
		height: number,
		sprite?: Sprite
	): Command;
	/**
	 * Swaps the layer with the layer above or below it.
	 * @param layer The index layer to swap.
	 * @param direction The direction to swap the layer.
	 */
	swap_layers(layer: number, direction: "up" | "down"): LayerScene;
	/**
	 * Changes the active layer.
	 * @param layer The index of the layer to make active.
	 */
	change_active_layer(layer: number): LayerScene;
	/**
	 * Resizes the layers.
	 * @param width The new width of the layers.
	 * @param height The new height of the layers.
	 */
	reset(): void;
	/**
	 * Gets the layers.
	 * @returns The layers.
	 */
	get_layers(): LayerScene[];
	layers: Writable<LayerScene[]>;
	active_layer: Writable<LayerScene | null>;

	add_layer_from_blob(
		container: Container,
		renderer: IRenderer,
		blob: Blob,
		view: HTMLCanvasElement
	): Promise<Command>;
}

/**
 * Swaps two adjacent elements in an array.
 * @param array The array to swap elements in.
 * @param index The index of the first element to swap.
 */
function swap_adjacent(array: any[], index: number): void {
	if (index < 0 || index >= array.length - 1) {
		throw new Error("Index out of bounds");
	}

	[array[index], array[index + 1]] = [array[index + 1], array[index]];
}

/**
 * Creates a layer manager.
 * @param canvas_resize a function to resize the canvas
 * @returns a layer manager
 */
export function layer_manager(): LayerManager {
	let _layers: LayerScene[] = [];
	let current_layer = 0;
	let position = 0;

	return {
		add_layer: function (
			container: Container,
			renderer: IRenderer,
			width: number,
			height: number,
			sprite?: Sprite
		): Command {
			let layer_container: Container & DisplayObject;
			let layer_number: number;
			let that = this;
			return {
				execute: function () {
					layer_container = new Container() as Container & DisplayObject;
					position++;
					layer_container.zIndex = position;

					const composite_texture = RenderTexture.create({
						width,
						height
					});

					const composite = new Sprite(composite_texture) as Sprite &
						DisplayObject;

					layer_container.addChild(composite);

					composite.zIndex = position;

					const layer_scene: LayerScene = {
						draw_texture: RenderTexture.create({
							width,
							height
						}),
						erase_texture: RenderTexture.create({
							width,
							height
						}),
						composite
					};

					const erase_filter = new Filter(undefined, erase_shader, {
						uEraserTexture: layer_scene.erase_texture,
						uDrawingTexture: layer_scene.draw_texture
					});

					composite.filters = [erase_filter];

					container.addChild(layer_container);

					that.layers.update((s) => [...s, layer_scene]);
					that.active_layer.set(layer_scene);

					layer_number = get(that.layers).length - 1;

					if (sprite) {
						renderer.render(sprite, {
							renderTexture: layer_scene.draw_texture
						});
					}
				},
				undo: function () {
					container.removeChild(layer_container);

					const _layers = get(that.layers);
					that.layers.set(_layers.filter((_, i) => i !== layer_number));
					const new_layer = _layers[layer_number - 1] || _layers[0] || null;
					that.active_layer.set(new_layer);
				}
			};
		},

		swap_layers: function (
			layer: number,
			direction: "up" | "down"
		): LayerScene {
			if (direction === "up") {
				swap_adjacent(_layers, layer);
			} else {
				swap_adjacent(_layers, layer - 1);
			}
			return _layers[layer];
		},

		change_active_layer: function (layer: number): LayerScene {
			// current_layer = layer;
			this.active_layer.set(get(this.layers)[layer]);
			return _layers[layer];
		},
		reset() {
			_layers.forEach((layer) => {
				layer.draw_texture.destroy(true);
				layer.erase_texture.destroy(true);
				layer.composite.destroy(true);
			});
			_layers = [];
			current_layer = 0;
			position = 0;
			this.active_layer.set(null);
			this.layers.set([]);
		},
		async add_layer_from_blob(
			container: Container,
			renderer: IRenderer,
			blob: Blob,
			view: HTMLCanvasElement
		): Promise<Command> {
			const img = await createImageBitmap(blob);
			const bitmap_texture = Texture.from(img);

			const [w, h] = resize_to_fit(
				bitmap_texture.width,
				bitmap_texture.height,
				view.width,
				view.height
			);

			const sprite = new Sprite(bitmap_texture) as Sprite & DisplayObject;
			sprite.zIndex = 0;

			sprite.width = w;
			sprite.height = h;

			return this.add_layer(
				container,
				renderer,
				view.width,
				view.height,
				sprite
			);
		},
		get_layers() {
			return _layers;
		},
		layers: writable([]),
		active_layer: writable(null)
	};
}

function resize_to_fit(
	inner_width: number,
	inner_height: number,
	outer_width: number,
	outer_height: number
): [number, number] {
	if (inner_width <= outer_width && inner_height <= outer_height) {
		return [inner_width, inner_height];
	}

	const inner_aspect = inner_width / inner_height;
	const outer_aspect = outer_width / outer_height;

	let new_width, new_height;

	if (inner_aspect > outer_aspect) {
		new_width = outer_width;
		new_height = outer_width / inner_aspect;
	} else {
		new_height = outer_height;
		new_width = outer_height * inner_aspect;
	}

	return [new_width, new_height];
}
