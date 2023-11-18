import {
	Container,
	type IRenderer,
	type DisplayObject,
	RenderTexture,
	Texture,
	Sprite,
	Filter
} from "pixi.js";

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
		height: number
	): [LayerScene, LayerScene[]];
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

	add_layer_from_blob(
		container: Container,
		renderer: IRenderer,
		blob: Blob
	): Promise<[LayerScene, LayerScene[]]>;
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
			height: number
		): [LayerScene, LayerScene[]] {
			const layer_container = new Container() as Container & DisplayObject;
			position++;
			layer_container.zIndex = position;

			const composite_texture = RenderTexture.create({
				width,
				height
			});

			const composite = new Sprite(composite_texture) as Sprite & DisplayObject;

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

			_layers.push(layer_scene);

			return [layer_scene, _layers];
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
			current_layer = layer;
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
		},
		async add_layer_from_blob(
			container: Container,
			renderer: IRenderer,
			blob: Blob
		) {
			const img = await createImageBitmap(blob);
			const bitmap_texture = Texture.from(img);
			const sprite = new Sprite(bitmap_texture) as Sprite & DisplayObject;
			sprite.zIndex = 0;

			const [layer, layers] = this.add_layer(
				container,
				renderer,
				sprite.width,
				sprite.height
			);
			renderer.render(sprite, {
				renderTexture: layer.draw_texture
			});

			return [layer, layers];
		},
		get_layers() {
			return _layers;
		}
	};
}
