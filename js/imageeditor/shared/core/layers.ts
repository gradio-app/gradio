import {
	Application,
	Container,
	Graphics,
	Sprite,
	RenderTexture,
	SCALE_MODES,
	Texture,
	Assets
} from "pixi.js";

import { get_canvas_blob } from "../utils/pixi";
import type { Writable } from "svelte/store";
import { writable, get } from "svelte/store";
import { type ImageBlobs, type LayerOptions } from "../types";
import { type Command } from "./commands";
import { type ImageEditorContext } from "./editor";

export class LayerManager {
	private layers: {
		name: string;
		id: string;
		container: Container;
		user_created: boolean;
		visible: boolean;
	}[] = [];
	private active_layer: Container | null = null;
	private active_layer_id: string | null = null;
	private draw_textures: Map<Container, RenderTexture> = new Map();
	layer_store: Writable<{
		active_layer: string;
		layers: {
			name: string;
			id: string;
			user_created: boolean;
			visible: boolean;
		}[];
	}> = writable({
		active_layer: "",

		layers: []
	});
	private background_layer: Container | null = null;
	private image_container: Container;
	private app: Application;
	private fixed_canvas: boolean;
	private dark: boolean;
	private border_region: number;
	private layer_options: LayerOptions;
	constructor(
		image_container: Container,
		app: Application,
		fixed_canvas: boolean,
		dark: boolean,
		border_region: number,
		layer_options: LayerOptions
	) {
		this.image_container = image_container;
		this.app = app;
		this.fixed_canvas = fixed_canvas;
		this.dark = dark;
		this.border_region = border_region;
		this.layer_options = layer_options;
	}

	toggle_layer_visibility(id: string): void {
		const layer = this.layers.find((l) => l.id === id);
		if (layer) {
			layer.container.visible = !layer.container.visible;
			layer.visible = layer.container.visible;
			this.layer_store.update((state) => ({
				active_layer: state.active_layer,
				layers: this.layers
			}));
		}
	}

	create_background_layer(width: number, height: number): Container {
		if (this.background_layer) {
			this.background_layer.destroy();
		}

		// Create new background layer
		const layer = new Container();

		this.background_layer = layer;

		// Create a render texture for the background with transparency
		const bg_texture = RenderTexture.create({
			width,
			height,
			resolution: window.devicePixelRatio,
			antialias: true,
			scaleMode: SCALE_MODES.NEAREST
		});

		// Create sprite to display the texture with transparency
		const bg_sprite = new Sprite(bg_texture);
		layer.addChild(bg_sprite);

		// Clear the texture with transparency
		const clear_graphics = new Graphics();
		clear_graphics.clear();

		clear_graphics
			.rect(0, 0, width, height)
			.fill({ color: this.dark ? 0x333333 : 0xffffff, alpha: 1 });

		// Render with transparency
		this.app.renderer.render({
			container: clear_graphics,
			target: bg_texture,
			clear: true
		});

		this.image_container.addChild(layer);

		layer.zIndex = -1;

		this.update_layer_order();
		return layer;
	}

	set_layer_options(
		layer_options: LayerOptions,
		width: number,
		height: number
	): void {
		this.layer_options = layer_options;
		this.reset_layers(width, height);
	}

	/**
	 * Creates a background layer from an image URL
	 * @param url The URL of the image to use as background
	 * @param width The width of the layer (if fixed_canvas is true)
	 * @param height The height of the layer (if fixed_canvas is true)
	 * @param borderRegion Minimum border region to add around the image for outpainting (in pixels)
	 * @returns A Promise that resolves to the background Container when the image is loaded
	 */
	async create_background_layer_from_url(
		url: string,
		width?: number,
		height?: number
	): Promise<Container> {
		const layer = this.create_background_layer(
			width || this.image_container.width,
			height || this.image_container.height
		);

		try {
			const texture = await Texture.from(url);
			const sprite = new Sprite(texture);

			const imageWidth = sprite.texture.width;
			const imageHeight = sprite.texture.height;

			// Calculate dimensions based on whether canvas size is fixed
			const containerWidth = width || this.image_container.width;
			const containerHeight = height || this.image_container.height;

			if (this.fixed_canvas) {
				// If fixed canvas, fit the image within the specified dimensions minus border region
				// Calculate aspect-preserving dimensions
				const effectiveContainerWidth = Math.max(
					containerWidth - this.border_region * 2,
					10
				);
				const effectiveContainerHeight = Math.max(
					containerHeight - this.border_region * 2,
					10
				);

				const imageAspectRatio = imageWidth / imageHeight;
				const containerAspectRatio =
					effectiveContainerWidth / effectiveContainerHeight;

				let finalWidth, finalHeight;
				let posX = this.border_region, // Start with border offset
					posY = this.border_region;

				if (
					imageWidth <= effectiveContainerWidth &&
					imageHeight <= effectiveContainerHeight
				) {
					// Image fits within container without scaling
					finalWidth = imageWidth;
					finalHeight = imageHeight;
				} else {
					if (imageAspectRatio > containerAspectRatio) {
						// Width is the limiting factor
						finalWidth = effectiveContainerWidth;
						finalHeight = effectiveContainerWidth / imageAspectRatio;
					} else {
						// Height is the limiting factor
						finalHeight = effectiveContainerHeight;
						finalWidth = effectiveContainerHeight * imageAspectRatio;
					}
				}

				// Center image within the effective container area (which already accounts for border)
				posX += Math.round((effectiveContainerWidth - finalWidth) / 2);
				posY += Math.round((effectiveContainerHeight - finalHeight) / 2);
				sprite.width = finalWidth;
				sprite.height = finalHeight;
				sprite.position.set(posX, posY);
			} else {
				// If not fixed canvas, use the natural dimensions of the image plus border
				// Position starts at the border offset
				sprite.position.set(this.border_region, this.border_region);

				// We need to re-create the background layer with the actual image dimensions plus border
				if (this.background_layer) {
					this.background_layer.destroy();
				}

				// Create new layer with image dimensions plus border on all sides
				const totalWidth = imageWidth + this.border_region * 2;
				const totalHeight = imageHeight + this.border_region * 2;
				const newLayer = this.create_background_layer(totalWidth, totalHeight);

				sprite.width = imageWidth;
				sprite.height = imageHeight;
				newLayer.addChild(sprite);

				return newLayer;
			}

			layer.addChild(sprite);

			return layer;
		} catch (error) {
			console.error("Error loading image from URL:", error);
			return layer;
		}
	}

	create_layer({
		width,
		height,
		layer_name,
		user_created,
		layer_id = undefined,
		make_active = false
	}: {
		width: number;
		height: number;
		layer_name?: string;
		user_created: boolean;
		layer_id?: string;
		make_active?: boolean;
	}): Container {
		const layer = new Container();
		const _layer_id = layer_id || Math.random().toString(36).substring(2, 15);
		const _layer_name = layer_name || `Layer ${this.layers.length + 1}`;

		this.layers.push({
			name: _layer_name,
			id: _layer_id,
			container: layer,
			user_created,
			visible: true
		});

		this.image_container.addChild(layer);

		// Create a single render texture for drawing with transparency
		const draw_texture = RenderTexture.create({
			width,
			height,
			resolution: window.devicePixelRatio,
			antialias: true,
			scaleMode: SCALE_MODES.NEAREST
		});

		const canvas_sprite = new Sprite(draw_texture);
		layer.addChild(canvas_sprite);

		const clear_graphics = new Graphics();
		clear_graphics.clear();
		clear_graphics.beginFill(0, 0);
		clear_graphics.drawRect(0, 0, width, height);
		clear_graphics.endFill();

		this.app.renderer.render({
			container: clear_graphics,
			target: draw_texture,
			clear: true
		});

		// Store texture for drawing
		this.draw_textures.set(layer, draw_texture);

		this.update_layer_order();
		if (make_active) {
			this.set_active_layer(_layer_id);
		}

		this.layer_store.set({
			active_layer: this.active_layer_id || "",
			layers: this.layers
		});
		return layer;
	}

	/**
	 * Creates a new layer with an image loaded from a URL
	 * @param url The URL of the image to load
	 * @param borderRegion Minimum border region to add around the image for outpainting (in pixels)
	 * @returns A Promise that resolves to the layer ID
	 */
	async add_layer_from_url(url: string): Promise<string> {
		const { width, height } = this.image_container.getLocalBounds();
		const layer = this.create_layer({
			width,
			height,
			layer_name: "Layer 1",
			user_created: true
		});

		const layerIndex = this.layers.findIndex((l) => l.container === layer);
		if (layerIndex === -1) {
			console.error("Could not find newly created layer");
			return "";
		}
		const layerId = this.layers[layerIndex].id;

		try {
			const texture = await Assets.load(url);

			const drawTexture = this.draw_textures.get(layer);
			if (!drawTexture) {
				console.error("No draw texture found for layer");
				return layerId;
			}

			const sprite = new Sprite(texture);
			const imageWidth = sprite.width;
			const imageHeight = sprite.height;

			let posX = this.border_region;
			let posY = this.border_region;

			// Calculate effective dimensions (accounting for border)
			const effectiveWidth = this.fixed_canvas
				? width - this.border_region * 2
				: width;
			const effectiveHeight = this.fixed_canvas
				? height - this.border_region * 2
				: height;

			// If the image is smaller than the effective layer area, center it within that area
			if (imageWidth < effectiveWidth || imageHeight < effectiveHeight) {
				posX = Math.floor((effectiveWidth - imageWidth) / 2);
				posY = Math.floor((effectiveHeight - imageHeight) / 2);
			}

			sprite.position.set(posX, posY);

			// If the image is larger than the effective layer area, scale it down to fit
			if (imageWidth > effectiveWidth || imageHeight > effectiveHeight) {
				const imageAspectRatio = imageWidth / imageHeight;
				const areaAspectRatio = effectiveWidth / effectiveHeight;

				let finalWidth, finalHeight;

				if (imageAspectRatio > areaAspectRatio) {
					// Width is the limiting factor
					finalWidth = effectiveWidth;
					finalHeight = effectiveWidth / imageAspectRatio;
				} else {
					// Height is the limiting factor
					finalHeight = effectiveHeight;
					finalWidth = effectiveHeight * imageAspectRatio;
				}

				sprite.width = finalWidth;
				sprite.height = finalHeight;

				// Recalculate position to center within effective area
				posX =
					this.border_region + Math.floor((effectiveWidth - finalWidth) / 2);
				posY =
					this.border_region + Math.floor((effectiveHeight - finalHeight) / 2);
				sprite.position.set(posX, posY);
			}

			this.app.renderer.render(sprite, { renderTexture: drawTexture });

			this.set_active_layer(layerId);

			return layerId;
		} catch (error) {
			console.error("Error loading image from URL:", error);
			return layerId;
		}
	}

	get_active_layer(): typeof this.active_layer {
		return this.active_layer;
	}

	set_active_layer(id: string): void {
		if (this.layers.some((l) => l.id === id)) {
			this.active_layer =
				this.layers.find((l) => l.id === id)?.container ||
				this.layers[0]?.container ||
				null;
			this.active_layer_id = id;
			this.layer_store.set({
				active_layer: id,
				layers: this.layers
			});
		}
	}

	get_layers(): typeof this.layers {
		return this.layers;
	}

	get_layer_textures(id: string): { draw: RenderTexture } | null {
		const layer = this.layers.find((l) => l.id === id);
		if (layer) {
			const draw = this.draw_textures.get(layer.container);
			if (draw) {
				return { draw };
			}
		}
		return null;
	}

	delete_layer(id: string): void {
		const index = this.layers.findIndex((l) => l.id === id);
		if (index > -1) {
			// Clean up texture
			const draw_texture = this.draw_textures.get(this.layers[index].container);
			if (draw_texture) {
				draw_texture.destroy();
				this.draw_textures.delete(this.layers[index].container);
			}
			this.layers[index].container.destroy();
			if (this.active_layer === this.layers[index].container) {
				const new_active_layer = this.layers[Math.max(0, index - 1)] || null;
				this.active_layer = new_active_layer?.container || null;
				this.active_layer_id = new_active_layer?.id || null;
			}
			this.layers = this.layers.filter((l) => l.id !== id);

			this.layer_store.update((_layers) => ({
				active_layer:
					_layers.active_layer === id
						? this.layers[this.layers.length - 1]?.id
						: _layers.active_layer,
				layers: this.layers
			}));

			this.update_layer_order();
		}
	}

	private update_layer_order(): void {
		// Ensure background layer always has lowest z-index
		if (this.background_layer) {
			this.background_layer.zIndex = -1;
		}
		// Update other layers starting from 0
		this.layers.forEach((layer, index) => {
			layer.container.zIndex = index;
		});
	}

	move_layer(id: string, direction: "up" | "down"): void {
		const index = this.layers.findIndex((l) => l.id === id);
		if (index > -1) {
			const new_index = direction === "up" ? index - 1 : index + 1;

			this.layers = this.layers.map((l, i) => {
				if (i === index) {
					return this.layers[new_index];
				}
				if (i === new_index) {
					return this.layers[index];
				}
				return l;
			});
			this.update_layer_order();
			this.layer_store.update((_layers) => ({
				active_layer: id,
				layers: this.layers
			}));
		}
	}

	/**
	 * Resizes all layers to a new width and height
	 * @param newWidth The new width of the layers
	 * @param newHeight The new height of the layers
	 * @param scale If true, scales the layer content to fit the new dimensions. If false, keeps the content size unchanged.
	 * @param anchor The anchor point to position the content relative to the new size
	 */
	resize_all_layers(
		newWidth: number,
		newHeight: number,
		scale: boolean,
		anchor:
			| "top-left"
			| "top"
			| "top-right"
			| "left"
			| "center"
			| "right"
			| "bottom-left"
			| "bottom"
			| "bottom-right",
		// Add old canvas dimensions for anchor calculations when not scaling
		oldCanvasWidth: number,
		oldCanvasHeight: number
	): void {
		// Create a map of the old layers by ID for reference
		const oldLayersById = new Map(this.layers.map((l) => [l.id, l]));
		const oldBackgroundLayer = this.background_layer;

		// Calculate offset for non-scaling resize based on anchor and dimension change
		const calculateOffset = (): { offsetX: number; offsetY: number } => {
			let offsetX = 0;
			let offsetY = 0;
			const deltaWidth = newWidth - oldCanvasWidth;
			const deltaHeight = newHeight - oldCanvasHeight;

			// Determine X offset based on anchor point
			if (anchor.includes("left")) {
				offsetX = 0;
			} else if (anchor.includes("right")) {
				offsetX = deltaWidth;
			} else {
				// center
				offsetX = Math.floor(deltaWidth / 2);
			}

			// Determine Y offset based on anchor point
			if (anchor.includes("top")) {
				offsetY = 0;
			} else if (anchor.includes("bottom")) {
				offsetY = deltaHeight;
			} else {
				// center
				offsetY = Math.floor(deltaHeight / 2);
			}

			return { offsetX, offsetY };
		};

		// First, handle the background layer using the helper method
		// Note: create_background_layer called inside the helper might destroy the old one
		this.background_layer = this._resize_background_layer(
			oldBackgroundLayer, // Pass the potentially null old layer
			newWidth,
			newHeight,
			scale,
			calculateOffset
		);

		// Now process regular layers
		const processedLayers: {
			name: string;
			id: string;
			container: Container;
			user_created: boolean;
		}[] = [];

		// Store old layer data before clearing the main arrays
		const oldLayerData = this.layers.map((oldLayer) => ({
			id: oldLayer.id,
			name: oldLayer.name,
			user_created: oldLayer.user_created,
			texture: this.draw_textures.get(oldLayer.container),
			container: oldLayer.container
		}));

		// Clear the current layers array and textures map. New layers will be added by the helper.
		this.layers = [];
		this.draw_textures.clear(); // Ensure map is cleared before helpers add to it

		// Rebuild layers in the original order using the helper method
		for (const oldData of oldLayerData) {
			// The helper _resize_single_layer handles creating the new layer,
			// drawing content, cleanup, and adding the new layer to this.layers.
			// It returns null if resizing failed for that layer.
			const newLayer = this._resize_single_layer(
				oldData,
				newWidth,
				newHeight,
				scale,
				calculateOffset
			);
			if (newLayer) {
				processedLayers.push(newLayer);
			}
		}

		// Ensure the active layer still exists, otherwise select the top one
		const currentActiveId = get(this.layer_store).active_layer;
		const activeLayerExists = processedLayers.some(
			(l) => l.id === currentActiveId
		);

		if (!activeLayerExists && processedLayers.length > 0) {
			this.set_active_layer(processedLayers[0].id); // Set to top layer (index 0 is bottom visually)
		} else if (processedLayers.length === 0) {
			this.layer_store.update((s) => ({ ...s, active_layer: "" })); // No layers left
		} else {
			// If the active layer still exists, just trigger an update to ensure consistency
			this.layer_store.update((s) => ({ ...s }));
		}

		// Update Z-indices
		this.update_layer_order();

		// Final cleanup attempt - textures might need explicit destroy calls
		// Using setTimeout allows the current execution stack to clear
		setTimeout(() => {
			// Attempt to force GC or resource cleanup if needed, though Pixi often handles this
			Assets.cache.reset(); // Be careful with this, might clear too much
			this.app.renderer.textureGC.run(); // Force texture garbage collection
		}, 100);
	}

	/**
	 * Helper method to resize the background layer.
	 */
	private _resize_background_layer(
		oldBackgroundLayer: Container | null,
		newWidth: number,
		newHeight: number,
		scale: boolean,
		calculateOffset: () => { offsetX: number; offsetY: number }
	): Container | null {
		if (!oldBackgroundLayer) {
			// If no old background layer existed, create a new one
			return this.create_background_layer(newWidth, newHeight);
		}

		// Identify the actual image sprite within the background container
		let backgroundImage: Sprite | null = oldBackgroundLayer.children.find(
			(child) =>
				child instanceof Sprite &&
				child.texture !== (oldBackgroundLayer.children[0] as Sprite)?.texture
		) as Sprite | null;

		// Create the new background layer first (this also destroys the old one implicitly if it exists)
		const newBackgroundLayer = this.create_background_layer(
			newWidth,
			newHeight
		);

		if (backgroundImage) {
			const newBgImage = new Sprite(backgroundImage.texture);
			newBgImage.width = backgroundImage.width; // Preserve original size unless scaling
			newBgImage.height = backgroundImage.height;

			if (scale) {
				newBgImage.width = newWidth;
				newBgImage.height = newHeight;
				newBgImage.position.set(0, 0);
			} else {
				const { offsetX, offsetY } = calculateOffset();
				newBgImage.position.set(
					backgroundImage.x + offsetX,
					backgroundImage.y + offsetY
				);
			}
			newBackgroundLayer.addChild(newBgImage);
		}
		// If no background image, the new layer created above is already blank and correctly sized.

		return newBackgroundLayer;
	}

	/**
	 * Helper method to resize a single regular layer.
	 */
	private _resize_single_layer(
		oldData: {
			id: string;
			name: string;
			user_created: boolean;
			texture: RenderTexture | undefined;
			container: Container;
		},
		newWidth: number,
		newHeight: number,
		scale: boolean,
		calculateOffset: () => { offsetX: number; offsetY: number }
	): {
		name: string;
		id: string;
		container: Container;
		user_created: boolean;
	} | null {
		if (!oldData.texture) {
			console.warn(
				`No texture found for layer ${oldData.id}, skipping cleanup.`
			);
			// Destroy the old container if it exists and is not destroyed
			if (oldData.container && !oldData.container.destroyed) {
				if (this.image_container.children.includes(oldData.container)) {
					this.image_container.removeChild(oldData.container);
				}
				oldData.container.destroy({ children: true });
			}
			return null;
		}

		// Create a new layer container and associated render texture
		const newContainer = this.create_layer({
			// This adds the layer to this.layers and draw_textures
			width: newWidth,
			height: newHeight,
			layer_name: oldData.name,
			user_created: oldData.user_created
		});

		// Retrieve the newly created layer data (it's the last one added by create_layer)
		const newLayer = this.layers[this.layers.length - 1];
		newLayer.id = oldData.id; // Restore the original ID

		// Get the render texture for the new layer
		const newTexture = this.draw_textures.get(newContainer);

		if (!newTexture) {
			console.error(
				`Failed to get texture for newly created layer ${newLayer.id}. Cleaning up.`
			);
			// Clean up the partially created new layer resources
			if (newContainer && !newContainer.destroyed) {
				if (this.image_container.children.includes(newContainer)) {
					this.image_container.removeChild(newContainer);
				}
				newContainer.destroy({ children: true });
				const idx = this.layers.findIndex((l) => l.container === newContainer);
				if (idx > -1) this.layers.splice(idx, 1);
				this.draw_textures.delete(newContainer);
			}
			// Clean up old resources
			if (oldData.texture && !oldData.texture.destroyed)
				oldData.texture.destroy(true);
			if (oldData.container && !oldData.container.destroyed)
				oldData.container.destroy({ children: true });
			return null;
		}

		// Explicitly clear the new render texture (create_layer might already do this, but explicit is safer)
		this.app.renderer.clear({ target: newTexture, clearColor: [0, 0, 0, 0] });

		// Create a sprite with the old texture content
		const sprite = new Sprite(oldData.texture);

		if (scale) {
			sprite.width = newWidth;
			sprite.height = newHeight;
			sprite.position.set(0, 0);
		} else {
			const { offsetX, offsetY } = calculateOffset();
			sprite.position.set(offsetX, offsetY);
		}

		// Render the sprite onto the new texture
		this.app.renderer.render(sprite, { renderTexture: newTexture });

		// Clean up temporary sprite and old resources
		sprite.destroy();
		if (oldData.texture && !oldData.texture.destroyed) {
			oldData.texture.destroy(true);
		}
		if (oldData.container && !oldData.container.destroyed) {
			if (this.image_container.children.includes(oldData.container)) {
				this.image_container.removeChild(oldData.container);
			}
			oldData.container.destroy({ children: true });
		}

		// Return the data for the successfully resized layer
		return newLayer;
	}

	async get_blobs(width: number, height: number): Promise<ImageBlobs> {
		const blobs = {
			background: await get_canvas_blob(
				this.app.renderer,
				this.background_layer,
				{
					width,
					height,
					x: 0,
					y: 0
				}
			),
			layers: await Promise.all(
				this.layers.map(async (layer) => {
					const blob = await get_canvas_blob(
						this.app.renderer,
						layer.container,
						{
							width,
							height,
							x: 0,
							y: 0
						}
					);
					if (blob) {
						return blob;
					}
					return null;
				})
			),
			composite: await get_canvas_blob(this.app.renderer, this.image_container)
		};

		return blobs;
	}

	reset_layers(width: number, height: number, persist = false): void {
		const _layers_to_recreate = persist
			? this.layers.map((layer) => [layer.name, layer.id])
			: this.layer_options.layers.map((layer) => [layer, undefined]);

		this.layers.forEach((layer) => {
			this.delete_layer(layer.id);
		});

		for (const [layer_name, layer_id] of _layers_to_recreate) {
			this.create_layer({
				width,
				height,
				layer_name: layer_name,
				user_created: this.layer_options.layers.find((l) => l === layer_name)
					? false
					: true,
				layer_id: layer_id
			});
		}

		if (!persist) {
			this.active_layer = this.layers[0].container;
			this.active_layer_id = this.layers[0].id;
		} else {
			// the id is the same but the layer is new, we need to find the new layer
			this.active_layer =
				this.layers.find((l) => l.id === this.active_layer_id)?.container ||
				this.layers[0].container;
		}

		this.layer_store.update((state) => ({
			active_layer: this.active_layer_id || this.layers[0].id,
			layers: this.layers
		}));
	}

	init_layers(width: number, height: number): void {
		for (const layer of this.layers) {
			this.delete_layer(layer.id);
		}
		for (const layer of this.layer_options.layers) {
			this.create_layer({
				width,
				height,
				layer_name: layer,
				user_created: false
			});
		}

		this.active_layer = this.layers[0].container;
		this.active_layer_id = this.layers[0].id;
		this.layer_store.update((_layers) => ({
			active_layer: this.layers[0].id,
			layers: this.layers
		}));
	}
}

/**
 * Command to add a new layer
 */
export class AddLayerCommand implements Command {
	private layer_id: string;
	private layer_name: string;
	private width: number;
	private height: number;
	private user_created: boolean;
	private make_active: boolean;
	private previous_active_layer: string | null = null;
	name: string;
	constructor(
		private context: ImageEditorContext,
		options: {
			width: number;
			height: number;
			layer_name?: string;
			user_created: boolean;
			layer_id?: string;
			make_active?: boolean;
		}
	) {
		this.width = options.width;
		this.height = options.height;
		this.layer_name =
			options.layer_name ||
			`Layer ${this.context.layer_manager.get_layers().length + 1}`;
		this.user_created = options.user_created;
		this.layer_id =
			options.layer_id || Math.random().toString(36).substring(2, 15);
		this.make_active = options.make_active || false;
		this.name = "AddLayer";
		// Store the current active layer ID for undo
		const current_layers = this.context.layer_manager.get_layers();
		const current_active = current_layers.find(
			(l) => l.container === this.context.layer_manager.get_active_layer()
		);
		this.previous_active_layer = current_active?.id || null;
	}

	async execute(): Promise<void> {
		this.context.layer_manager.create_layer({
			width: this.width,
			height: this.height,
			layer_name: this.layer_name,
			user_created: this.user_created,
			layer_id: this.layer_id,
			make_active: this.make_active
		});
	}

	async undo(): Promise<void> {
		// Remove the layer
		this.context.layer_manager.delete_layer(this.layer_id);

		// Restore previous active layer if needed
		if (this.previous_active_layer) {
			this.context.layer_manager.set_active_layer(this.previous_active_layer);
		}
	}
}

/**
 * Command to remove a layer
 */
export class RemoveLayerCommand implements Command {
	private layer_data: {
		id: string;
		name: string;
		user_created: boolean;
		visible: boolean;
		was_active: boolean;
	};
	private previous_active_layer: string | null = null;
	// Store the texture directly instead of as base64
	private texture_copy: RenderTexture | null = null;
	name: string;

	constructor(
		private context: ImageEditorContext,
		layer_id: string
	) {
		this.name = "RemoveLayer";
		// Find the layer to be removed
		const layers = this.context.layer_manager.get_layers();
		const layer_to_remove = layers.find((l) => l.id === layer_id);

		if (!layer_to_remove) {
			throw new Error(`Layer with ID ${layer_id} not found`);
		}

		// Get the active layer info
		const active_layer = this.context.layer_manager.get_active_layer();
		const was_active = layer_to_remove.container === active_layer;

		// Find what would become the active layer after removal (for undo)
		if (was_active) {
			const layer_index = layers.findIndex((l) => l.id === layer_id);
			const next_active = layers[Math.max(0, layer_index - 1)];
			this.previous_active_layer = next_active?.id || null;
		}

		// Store basic information about the layer
		this.layer_data = {
			id: layer_to_remove.id,
			name: layer_to_remove.name,
			user_created: layer_to_remove.user_created,
			visible: layer_to_remove.visible,
			was_active
		};

		// Capture texture data - create a direct copy of the texture
		this.captureTextureData(layer_id);
	}

	/**
	 * Create a direct copy of the layer's texture
	 */
	private captureTextureData(layer_id: string): void {
		const layer_textures =
			this.context.layer_manager.get_layer_textures(layer_id);
		if (!layer_textures) return;

		try {
			// Get the original texture
			const original_texture = layer_textures.draw;

			// Create a new render texture with the same dimensions
			const texture_copy = RenderTexture.create({
				width: original_texture.width,
				height: original_texture.height,
				resolution: window.devicePixelRatio || 1
			});

			// Create a sprite from the original texture
			const sprite = new Sprite(original_texture);

			// Render the sprite to our copied texture
			this.context.app.renderer.render(sprite, { renderTexture: texture_copy });

			// Store the copy
			this.texture_copy = texture_copy;

			// Clean up the sprite
			sprite.destroy();
		} catch (e) {
			console.error("Failed to copy layer texture:", e);
			this.texture_copy = null;
		}
	}

	async execute(): Promise<void> {
		this.context.layer_manager.delete_layer(this.layer_data.id);
	}

	async undo(): Promise<void> {
		// Get current dimensions from the context
		const dimensions = get(this.context.dimensions);

		// Recreate the layer
		const container = this.context.layer_manager.create_layer({
			width: dimensions.width,
			height: dimensions.height,
			layer_name: this.layer_data.name,
			user_created: this.layer_data.user_created,
			layer_id: this.layer_data.id,
			make_active: this.layer_data.was_active
		});

		// Restore the layer content if we have saved texture
		if (this.texture_copy) {
			try {
				const layer_textures = this.context.layer_manager.get_layer_textures(
					this.layer_data.id
				);
				if (layer_textures) {
					// Simply create a sprite from our copied texture and render it to the layer texture
					const sprite = new Sprite(this.texture_copy);

					// Render directly to the layer's texture
					this.context.app.renderer.render(sprite, {
						renderTexture: layer_textures.draw
					});

					// Clean up
					sprite.destroy();
				}
			} catch (e) {
				console.error("Failed to restore layer content:", e);
			}
		}

		// Restore visibility
		if (!this.layer_data.visible) {
			this.context.layer_manager.toggle_layer_visibility(this.layer_data.id);
		}

		// Set the active layer if this wasn't the active layer
		if (!this.layer_data.was_active && this.previous_active_layer) {
			this.context.layer_manager.set_active_layer(this.previous_active_layer);
		}
	}

	/**
	 * Clean up resources when the command is no longer needed
	 * This would need to be called by a garbage collection mechanism
	 */
	destroy(): void {
		// Clean up the texture copy to prevent memory leaks
		if (this.texture_copy) {
			this.texture_copy.destroy();
			this.texture_copy = null;
		}
	}
}

/**
 * Command to reorder layers
 */
export class ReorderLayerCommand implements Command {
	private original_order: string[];
	private new_order: string[];
	private layer_id: string;
	private direction: "up" | "down";
	name: string;

	constructor(
		private context: ImageEditorContext,
		layer_id: string,
		direction: "up" | "down"
	) {
		this.layer_id = layer_id;
		this.direction = direction;
		this.name = "ReorderLayer";
		// Store the original order
		const layers = this.context.layer_manager.get_layers();
		this.original_order = layers.map((l) => l.id);

		// Calculate the new order
		const index = layers.findIndex((l) => l.id === layer_id);
		if (index === -1) {
			throw new Error(`Layer with ID ${layer_id} not found`);
		}

		const new_index = direction === "up" ? index - 1 : index + 1;
		if (new_index < 0 || new_index >= layers.length) {
			// Can't move in this direction, keep the same order
			this.new_order = [...this.original_order];
		} else {
			// Create a new array with the swapped elements
			this.new_order = [...this.original_order];
			[this.new_order[index], this.new_order[new_index]] = [
				this.new_order[new_index],
				this.new_order[index]
			];
		}
	}

	async execute(): Promise<void> {
		this.context.layer_manager.move_layer(this.layer_id, this.direction);
	}

	async undo(): Promise<void> {
		// Get the current layers
		const current_layers = this.context.layer_manager.get_layers();

		// If orders match, no need to do anything
		if (
			this.original_order.join(",") ===
			current_layers.map((l) => l.id).join(",")
		) {
			return;
		}

		// Find the layer position in the current order
		const layer_index = current_layers.findIndex((l) => l.id === this.layer_id);
		if (layer_index === -1) return;

		// Determine if we need to move up or down to restore original order
		const original_index = this.original_order.indexOf(this.layer_id);
		const move_direction = layer_index > original_index ? "up" : "down";

		// Move the layer to restore the original position
		this.context.layer_manager.move_layer(this.layer_id, move_direction);
	}
}
