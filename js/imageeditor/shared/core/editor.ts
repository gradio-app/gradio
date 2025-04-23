import {
	Application,
	Container,
	Graphics,
	Sprite,
	Filter,
	RenderTexture,
	GlProgram,
	defaultFilterVert,
	SCALE_MODES,
	Texture,
	type ALPHA_MODES,
	Assets
} from "pixi.js";

import { DropShadowFilter as BlurFilter } from "pixi-filters/drop-shadow";

import { ImageTool } from "../image/image";
import { AddImageCommand } from "../image/image";

import { ZoomTool } from "../zoom/zoom";
import type { Subtool, Tool as ToolbarTool } from "../Toolbar.svelte";
import type { Readable, Writable } from "svelte/store";
import { spring, type Spring } from "svelte/motion";
import { writable, get } from "svelte/store";
import { Rectangle } from "pixi.js";
import { type ImageBlobs, type LayerOptions } from "../types";
import { get_canvas_blob } from "../utils/pixi";
import type { BrushTool } from "../brush/brush";
import type { CropTool } from "../crop/crop";
export interface Command {
	execute: () => Promise<void>;
	undo: () => Promise<void>;
}

export interface Tool {
	name: string;
	setup(
		context: ImageEditorContext,
		tool: ToolbarTool,
		subtool: Subtool
	): Promise<void>;
	cleanup(): void;
	set_tool(tool: ToolbarTool, subtool: Subtool): void;
	on?: (event: string, callback: () => void) => void;
	off?: (event: string, callback: () => void) => void;
}

export class CommandManager {
	private undo_stack: Command[] = [];
	private redo_stack: Command[] = [];

	async execute(command: Command): Promise<void> {
		await command.execute();
		this.undo_stack.push(command);
		this.redo_stack = []; // Clear redo stack when new command is executed
	}

	async undo(): Promise<void> {
		const command = this.undo_stack.pop();
		if (command) {
			await command.undo();
			this.redo_stack.push(command);
		}
	}

	async redo(): Promise<void> {
		const command = this.redo_stack.pop();
		if (command) {
			await command.execute();
			this.undo_stack.push(command);
		}
	}
}

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

const core_tools = ["image", "zoom"] as const;

interface ImageEditorOptions {
	target_element: HTMLElement;
	width: number;
	height: number;
	tools: ((typeof core_tools)[number] | Tool)[];
	fixed_canvas?: boolean;
	dark?: boolean;
	border_region?: number;
	layer_options?: LayerOptions;
	pad_bottom?: number;
	theme_mode?: "dark" | "light";
}

const core_tool_map = {
	image: () => new ImageTool(),
	zoom: () => new ZoomTool()
} as const;

export interface ImageEditorContext {
	app: Application;
	ui_container: Container;
	image_container: Container;
	background_image?: Sprite;
	command_manager: CommandManager;
	layer_manager: LayerManager;
	dimensions: Readable<{ width: number; height: number }>;
	scale: Readable<number>;
	position: Readable<{ x: number; y: number }>;
	set_image_properties: (properties: {
		width?: number;
		height?: number;
		scale?: number;
		position?: { x: number; y: number };
		animate?: boolean;
	}) => Promise<void>;
	execute_command: (command: Command) => Promise<void> | void;
	resize_canvas: (width: number, height: number) => void;
	reset: () => void;
	set_background_image: (image: Sprite) => void;
	pad_bottom: number;
}

const spring_config = {
	stiffness: 0.45,
	damping: 0.8
};

interface EditorStatePublic {
	position: { x: number; y: number };
	scale: number;
	subscribe: (callback: (value: any) => void) => () => void;
	current_tool: ToolbarTool;
	current_subtool: Subtool;
}

class EditorState {
	state: EditorStatePublic;
	private scale: number;
	private position: { x: number; y: number };
	private subscribers: Set<(value: any) => void>;
	constructor(editor: ImageEditor) {
		if (!(editor instanceof ImageEditor)) {
			throw new Error("EditorState must be created by ImageEditor");
		}

		// Store private data
		this.scale = 1.0;
		this.position = { x: 0, y: 0 };
		this.subscribers = new Set();
		// @ts-ignore
		this.state = Object.freeze({
			get position() {
				return { ...this.position };
			},
			get scale() {
				return this.scale;
			},
			get current_tool() {
				return this.current_tool;
			},
			get current_subtool() {
				return this.current_subtool;
			},
			subscribe: this.subscribe.bind(this)
		});
	}

	// Internal methods - only accessible to EditorState class
	_set_position(x: number, y: number): void {
		const oldPosition = { ...this.position };
		this.position = { x, y };
		this._notify_subscribers("position", oldPosition, this.position);
	}

	_set_scale(scale: number): void {
		const oldScale = this.scale;
		this.scale = scale;
		this._notify_subscribers("scale", oldScale, scale);
	}

	_notify_subscribers(property: string, oldValue: any, newValue: any): void {
		this.subscribers.forEach((callback) => {
			callback({
				property,
				oldValue,
				newValue,
				timestamp: Date.now()
			});
		});
	}

	// Public method but only affects notifications
	subscribe(callback: (value: any) => void): () => void {
		this.subscribers.add(callback);
		return () => this.subscribers.delete(callback);
	}
}

export class ImageEditor {
	public ready: Promise<void>;
	public background_image_present = writable(false);
	public min_zoom = writable(true);

	private app!: Application;
	private ui_container!: Container;
	private image_container!: Container;
	private command_manager: CommandManager;
	private layer_manager!: LayerManager;
	private tools: Map<string, Tool> = new Map<string, Tool>();
	private current_tool!: ToolbarTool;
	private current_subtool!: Subtool;
	private target_element: HTMLElement;
	private width: number;
	private height: number;
	dimensions: Spring<{ width: number; height: number }>;
	scale: Spring<number>;
	private position: Spring<{ x: number; y: number }>;
	private state: EditorState;
	private scale_value = 1;
	private position_value: { x: number; y: number } = { x: 0, y: 0 };
	private dimensions_value: { width: number; height: number } = {
		width: 0,
		height: 0
	};
	layers: Writable<{
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
	private outline_container!: Container;
	private outline_graphics!: Graphics;
	private background_image?: Sprite;
	private ready_resolve!: (value: void | PromiseLike<void>) => void;
	private event_callbacks: Map<string, (() => void)[]> = new Map();
	private fixed_canvas: boolean;
	private dark: boolean;
	private border_region: number;
	private layer_options: LayerOptions;
	private overlay_container!: Container;
	private overlay_graphics!: Graphics;
	private pad_bottom: number;
	private theme_mode: "dark" | "light";
	constructor(options: ImageEditorOptions) {
		this.pad_bottom = options.pad_bottom || 0;
		this.dark = options.dark || false;
		this.theme_mode = options.theme_mode || "dark";
		this.target_element = options.target_element;
		this.width = options.width;
		this.height = options.height;
		this.command_manager = new CommandManager();
		this.ready = new Promise((resolve) => {
			this.ready_resolve = resolve;
		});
		this.fixed_canvas = options.fixed_canvas || false;
		this.tools = new Map<string, Tool>(
			options.tools.map((tool) => {
				if (typeof tool === "string") {
					return [tool, core_tool_map[tool]()];
				}

				return [tool.name, tool];
			})
		);

		for (const tool of this.tools.values()) {
			if (tool?.on) {
				tool.on("change", () => {
					this.notify("change");
				});
			}
		}

		this.dimensions = spring(
			{ width: this.width, height: this.height },
			spring_config
		);
		this.scale = spring(1, spring_config);
		this.position = spring({ x: 0, y: 0 }, spring_config);
		this.state = new EditorState(this);
		this.border_region = options.border_region || 0;
		this.layer_options = options.layer_options || {
			allow_additional_layers: true,
			layers: ["Layer 1"],
			disabled: false
		};
		this.scale.subscribe((scale) => {
			this.state._set_scale(scale);
		});
		this.position.subscribe((position) => {
			this.state._set_position(position.x, position.y);
		});
		this.init();
	}

	private get context(): ImageEditorContext {
		const editor = this;
		return {
			app: this.app,
			ui_container: this.ui_container,
			image_container: this.image_container,
			get background_image() {
				return editor.background_image;
			},
			pad_bottom: this.pad_bottom,
			command_manager: this.command_manager,
			layer_manager: this.layer_manager,
			dimensions: { subscribe: this.dimensions.subscribe },
			scale: { subscribe: this.scale.subscribe },
			position: { subscribe: this.position.subscribe },
			set_image_properties: this.set_image_properties.bind(this),
			execute_command: this.execute_command.bind(this),
			resize_canvas: this.resize_canvas.bind(this),
			reset: this.reset.bind(this),
			set_background_image: this.set_background_image.bind(this)
		};
	}

	async init(): Promise<void> {
		const container_box = this.target_element.getBoundingClientRect();
		new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				this.resize_canvas(
					entry.contentBoxSize[0].inlineSize,
					entry.contentBoxSize[0].blockSize
				);
			});
		}).observe(this.target_element);

		this.app = new Application();
		await this.app.init({
			width: container_box.width,
			height: container_box.height,
			backgroundAlpha: this.dark ? 0 : 1,
			backgroundColor: this.theme_mode === "dark" ? "#27272a" : "#ffffff",
			resolution: window.devicePixelRatio,
			autoDensity: true,
			antialias: true,
			powerPreference: "high-performance"
		});

		// Set canvas properties
		const canvas = this.app.canvas as HTMLCanvasElement;
		canvas.style.background = "transparent";

		await this.setup_containers();

		//create background layer
		this.layer_manager.create_background_layer(this.width, this.height);

		// Create initial layer
		this.layer_manager.init_layers(this.width, this.height);

		for (const tool of this.tools.values()) {
			await tool.setup(this.context, this.current_tool, this.current_subtool);
		}

		const zoom = this.tools.get("zoom") as ZoomTool;
		if (zoom) {
			zoom.min_zoom.subscribe((is_min_zoom) => {
				this.min_zoom.set(is_min_zoom);
			});
		}

		this.target_element.appendChild(canvas);

		// Ensure parent element is transparent
		this.target_element.style.background = "transparent";

		this.dimensions.subscribe((dimensions) => {
			this.dimensions_value = dimensions;
			this.image_container.width = dimensions.width;
			this.image_container.height = dimensions.height;
		});

		this.scale.subscribe((scale) => {
			this.scale_value = scale;
		});

		this.position.subscribe((position) => {
			this.position_value = position;
		});

		this.app.ticker.add(() => {
			this.image_container.scale.set(this.scale_value);
			this.image_container.position.set(
				this.position_value.x,
				this.position_value.y
			);

			const effective_width = this.dimensions_value.width * this.scale_value;
			const effective_height = this.dimensions_value.height * this.scale_value;

			// Convert image_container's position (in stage space) to outline_container local coordinates.
			const local_x = Math.round(
				this.image_container.position.x - this.outline_container.position.x
			);
			const local_y = Math.round(
				this.image_container.position.y - this.outline_container.position.y
			);

			// Make sure overlay container follows the same position as outline container
			this.overlay_container.position.set(
				this.outline_container.position.x,
				this.outline_container.position.y
			);

			this.outline_graphics.clear();
			this.outline_graphics
				.rect(local_x, local_y, effective_width, effective_height)
				.fill({
					color: this.dark ? 0x333333 : 0xffffff,
					alpha: 1
				});

			// Draw border region indicator if border_region > 0
			if (this.border_region > 0) {
				const scaled_border = this.border_region * this.scale_value;
				const border_x = local_x + scaled_border - 1;
				const border_y = local_y + scaled_border - 1;
				const border_width = effective_width - scaled_border * 2 + 1;
				const border_height = effective_height - scaled_border * 2 + 1;

				// Clear previous overlay graphics
				this.overlay_graphics.clear();

				// Draw border rectangle using pixelLine for crisp 1px outline
				this.overlay_graphics
					.rect(border_x, border_y, border_width, border_height)
					.stroke({
						color: 0x999999,
						width: 1,
						alpha: 0,
						pixelLine: true
					});

				// Create dashed line effect by drawing small rects along the border
				const dashLength = 5;
				const gapLength = 5;
				const totalLength = dashLength + gapLength;
				const lineColor = 0x999999;

				// Draw dashed horizontal lines (top and bottom)
				for (let x = border_x; x < border_x + border_width; x += totalLength) {
					// Top dash
					this.overlay_graphics
						.rect(
							x,
							border_y,
							Math.min(dashLength, border_x + border_width - x),
							1
						)
						.fill({ color: lineColor, alpha: 0.7 });

					// Bottom dash
					this.overlay_graphics
						.rect(
							x,
							border_y + border_height,
							Math.min(dashLength, border_x + border_width - x),
							1
						)
						.fill({ color: lineColor, alpha: 0.7 });
				}

				// Draw dashed vertical lines (left and right)
				for (let y = border_y; y < border_y + border_height; y += totalLength) {
					// Left dash
					this.overlay_graphics
						.rect(
							border_x,
							y,
							1,
							Math.min(dashLength, border_y + border_height - y)
						)
						.fill({ color: lineColor, alpha: 0.7 });

					// Right dash
					this.overlay_graphics
						.rect(
							border_x + border_width,
							y,
							1,
							Math.min(dashLength, border_y + border_height - y)
						)
						.fill({ color: lineColor, alpha: 0.7 });
				}
			} else {
				// Clear overlay graphics if no border region
				this.overlay_graphics.clear();
			}
		});

		this.ready_resolve();
	}

	private async setup_containers(): Promise<void> {
		this.image_container = new Container({
			eventMode: "static",
			sortableChildren: true
		});

		this.image_container.width = this.width;
		this.image_container.height = this.height;

		this.app.stage.sortableChildren = true;
		this.app.stage.alpha = 1;
		this.app.stage.addChild(this.image_container);

		this.image_container.scale.set(1);

		this.ui_container = new Container({
			eventMode: "static"
		});
		this.app.stage.addChild(this.ui_container);
		this.ui_container.width = this.width;
		this.ui_container.height = this.height;

		this.outline_container = new Container();
		this.outline_container.zIndex = -10;

		this.outline_graphics = new Graphics();

		this.outline_graphics.rect(0, 0, this.width, this.height).fill({
			color: this.dark ? 0x333333 : 0xffffff,
			alpha: 0
		});

		if (!this.dark) {
			const blurFilter = new BlurFilter({
				alpha: 0.1,
				blur: 2,
				color: 0x000000,
				offset: { x: 0, y: 0 },
				quality: 4,
				shadowOnly: false
			});

			this.outline_graphics.filters = [blurFilter];
		}

		this.outline_container.addChild(this.outline_graphics);
		this.app.stage.addChild(this.outline_container);

		this.overlay_container = new Container();
		this.app.stage.addChild(this.overlay_container);
		this.overlay_container.width = this.width;
		this.overlay_container.height = this.height;

		this.overlay_container.zIndex = 999;
		this.overlay_container.eventMode = "static";
		this.overlay_container.interactiveChildren = true;
		this.overlay_graphics = new Graphics();
		this.overlay_container.addChild(this.overlay_graphics);

		this.overlay_graphics.rect(0, 0, this.width, this.height).fill({
			color: 0x000000,
			alpha: 0
		});

		const app_center_x = this.app.screen.width / 2;
		const app_center_y = this.app.screen.height / 2;

		this.image_container.position.set(app_center_x, app_center_y);
		this.outline_container.position.set(app_center_x, app_center_y);

		this.layer_manager = new LayerManager(
			this.image_container,
			this.app,
			this.fixed_canvas,
			this.dark,
			this.border_region,
			this.layer_options
		);
		this.layers = this.layer_manager.layer_store;
	}

	resize_canvas(width: number, height: number): void {
		if (this.app.renderer) {
			this.app.renderer.resize(width, height);
		}

		// Instead, update the container position to stay centered
		const app_center_x = width / 2;
		const app_center_y = height / 2;

		if (this.image_container) {
			this.image_container.position.set(app_center_x, app_center_y);
		}
		if (this.outline_container) {
			this.outline_container.position.set(app_center_x, app_center_y);
		}
	}

	reset(): void {
		const zoom = this.tools.get("zoom");

		if (zoom) {
			zoom.cleanup();
			zoom.setup(this.context, this.current_tool, this.current_subtool);
		}
	}

	async set_image_properties(properties: {
		width?: number;
		height?: number;
		scale?: number;
		position?: { x: number; y: number };
		animate?: boolean;
	}): Promise<void> {
		let hard =
			typeof properties.animate !== "undefined" ? !properties.animate : true;
		if (properties.position) {
			const pos = this.position.set(properties.position, { hard });
			if (hard) {
				await pos;
			}
		}
		if (properties.scale) {
			const scale = this.scale.set(properties.scale, { hard });
			if (hard) {
				await scale;
			}
		}
		if (properties.width && properties.height) {
			this.width = properties.width;
			this.height = properties.height;
			const dimensions = this.dimensions.set(
				{ width: properties.width, height: properties.height },
				{ hard }
			);
			if (hard) {
				await dimensions;
			}
		}
	}

	async execute_command(command: Command): Promise<void> {
		await this.command_manager.execute(command);
	}

	undo(): void {
		this.command_manager.undo();
		this.notify("change");
	}

	redo(): void {
		this.command_manager.redo();
		this.notify("change");
	}

	async add_image({
		image,
		resize = true
	}: {
		image: Blob | File;
		resize?: boolean;
	}): Promise<void> {
		const image_tool = this.tools.get("image") as ImageTool;
		await image_tool.add_image({
			image,
			fixed_canvas: this.fixed_canvas,
			border_region: this.border_region
		});
	}

	/**
	 * Adds an image from a URL as the background layer
	 * @param url The URL of the image to add
	 */
	async add_image_from_url(url: string): Promise<void> {
		const image_tool = this.tools.get("image") as ImageTool;
		const texture = await Assets.load(url);
		await image_tool.add_image({
			image: texture,
			fixed_canvas: this.fixed_canvas,
			border_region: this.border_region
		});

		// Update resize tool if present
		const resize_tool = this.tools.get("resize") as any;
		if (resize_tool && typeof resize_tool.set_border_region === "function") {
			resize_tool.set_border_region(this.border_region);
		}

		this.notify("change");
		this.notify("input");
	}

	set_tool(tool: ToolbarTool): void {
		this.current_tool = tool;

		for (const tool of this.tools.values()) {
			tool.set_tool(this.current_tool, this.current_subtool);
		}
	}

	set_subtool(subtool: Subtool): void {
		this.current_subtool = subtool;

		for (const tool of this.tools.values()) {
			tool.set_tool(this.current_tool, this.current_subtool);
		}
	}

	set_background_image(image: Sprite): void {
		this.background_image = image;
	}

	async reset_canvas(): Promise<void> {
		this.layer_manager.reset_layers(this.width, this.height);
		// Clear background image
		this.background_image = undefined;
		this.background_image_present.set(false);

		// Reset position, scale and dimensions to default values
		await this.set_image_properties({
			width: this.width,
			height: this.height,
			scale: 1,
			position: { x: 0, y: 0 },
			animate: false
		});

		// Reset command stacks
		this.command_manager = new CommandManager();

		//create background layer
		this.layer_manager.create_background_layer(this.width, this.height);

		// Reset tools
		for (const tool of this.tools.values()) {
			tool.cleanup();
			tool.setup(this.context, this.current_tool, this.current_subtool);
		}

		const zoom_tool = this.tools.get("zoom") as ZoomTool;
		if (zoom_tool) {
			zoom_tool.min_zoom.subscribe((is_min_zoom) => {
				this.min_zoom.set(is_min_zoom);
			});
		}

		this.notify("change");
	}

	add_layer(): void {
		this.layer_manager.create_layer({
			width: this.width,
			height: this.height,
			layer_name: undefined,
			user_created: true,
			layer_id: undefined,
			make_active: true
		});
		this.notify("change");
	}

	/**
	 * Adds a new layer with an image loaded from a URL
	 * @param layer_urls The URLs of the images to load
	 * @returns A Promise that resolves when all layers are added
	 */
	async add_layers_from_url(layer_urls: string[] | undefined): Promise<void> {
		const _layers = this.layer_manager.get_layers();
		_layers.forEach((l) => this.layer_manager.delete_layer(l.id));
		if (layer_urls === undefined || layer_urls.length === 0) {
			this.layer_manager.create_layer({
				width: this.width,
				height: this.height,
				layer_name: undefined,
				user_created: false
			});
			return;
		}

		for await (const url of layer_urls) {
			await this.layer_manager.add_layer_from_url(url);
		}

		this.layer_manager.set_active_layer(_layers[0].id);

		// Update resize tool if present with border region
		const resize_tool = this.tools.get("resize") as any;
		if (resize_tool && typeof resize_tool.set_border_region === "function") {
			resize_tool.set_border_region(this.border_region);
		}

		this.notify("change");
		this.notify("input");
	}

	set_layer(id: string): void {
		this.layer_manager.set_active_layer(id);
		this.notify("change");
	}

	move_layer(id: string, direction: "up" | "down"): void {
		this.layer_manager.move_layer(id, direction);
		this.notify("change");
	}

	delete_layer(id: string): void {
		this.layer_manager.delete_layer(id);
		this.notify("change");
	}

	modify_canvas_size(
		width: number,
		height: number,
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
		scale: boolean
	): void {
		// Store old dimensions before updating
		const oldWidth = this.width;
		const oldHeight = this.height;

		// Resize layers first, passing old dimensions for anchor calculation
		this.layer_manager.resize_all_layers(
			width,
			height,
			scale,
			anchor,
			oldWidth,
			oldHeight
		);

		// Update the editor's main dimension tracking *after* resizing layers
		this.width = width;
		this.height = height;

		// Update the dimensions store and reset view scale/position
		this.set_image_properties({
			width,
			height,
			scale: 1, // Reset scale
			position: { x: 0, y: 0 }, // Reset pan/position of the image_container
			animate: false
		});
		this.notify("change");
	}

	async get_blobs(): Promise<ImageBlobs> {
		const blobs = await this.layer_manager.get_blobs(this.width, this.height);
		return blobs;
	}

	on(event: "change" | "input", callback: () => void): void {
		this.event_callbacks.set(event, [
			...(this.event_callbacks.get(event) || []),
			callback
		]);
	}

	off(event: "change", callback: () => void): void {
		this.event_callbacks.set(
			event,
			this.event_callbacks.get(event)?.filter((cb) => cb !== callback) || []
		);
	}

	private notify(event: "change" | "input"): void {
		for (const callback of this.event_callbacks.get(event) || []) {
			callback();
		}
	}

	destroy(): void {
		if (!this.app) return;
		// for (const tool of this.tools) {
		// 	tool[1]?.cleanup();
		// }

		this.app?.destroy();
	}

	resize(width: number, height: number): void {
		this.set_image_properties({
			width,
			height
		});

		this.reset();
	}

	async get_crop_bounds(): Promise<{
		image: Blob | null;
		crop_dimensions: { width: number; height: number };
		image_dimensions: { width: number; height: number };
		x: number;
		y: number;
	}> {
		const crop_tool = this.tools.get("crop") as CropTool;
		const crop_bounds = crop_tool.get_crop_bounds();
		const image = await crop_tool.get_image();

		return {
			image,
			...crop_bounds
		};
	}

	get background_image_sprite(): Sprite | undefined {
		return this.background_image;
	}

	set_layer_options(layer_options: LayerOptions): void {
		this.layer_options = layer_options;
		this.layer_manager.set_layer_options(
			layer_options,
			this.width,
			this.height
		);
	}

	toggle_layer_visibility(id: string): void {
		this.layer_manager.toggle_layer_visibility(id);
	}
}
