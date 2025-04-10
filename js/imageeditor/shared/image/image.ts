import {
	Container,
	Graphics,
	Color,
	type ColorSource,
	RenderTexture,
	Sprite,
	type Renderer,
	Texture
} from "pixi.js";
import { type ImageEditorContext, type Tool } from "../core/editor";
import { type Tool as ToolbarTool, type Subtool } from "../Toolbar.svelte";
import { type Command } from "../utils/commands";
import { make_graphics } from "../utils/pixi";
import { get } from "svelte/store";

/**
 * Handles adding images to the editor
 * Only a single image can be added at a time
 * Adding an image removes the current image is one exists
 */
export class ImageTool implements Tool {
	name = "image";
	context!: ImageEditorContext;
	current_tool!: ToolbarTool;
	current_subtool!: Subtool;
	async setup(
		context: ImageEditorContext,
		tool: ToolbarTool,
		subtool: Subtool
	): Promise<void> {
		this.context = context;
		this.current_tool = tool;
		this.current_subtool = subtool;
	}

	cleanup(): void {}

	async add_image({
		image,
		fixed_canvas,
		border_region = 0
	}: {
		image: Blob | File | Texture;
		fixed_canvas: boolean;
		border_region?: number;
	}): Promise<void> {
		const image_command = new AddImageCommand(
			this.context,
			image,
			fixed_canvas,
			border_region
		);

		await this.context.execute_command(image_command);
	}

	set_tool(tool: ToolbarTool, subtool: Subtool): void {
		this.current_tool = tool;
		this.current_subtool = subtool;
	}
}

interface BgImageCommand extends Command {
	/**
	 * Initial setup for the bg command
	 * @returns
	 */
	start: () => Promise<[number, number]>;
}

export class AddImageCommand implements BgImageCommand {
	sprite: Sprite;
	fixed_canvas: boolean;
	context: ImageEditorContext;
	background: Blob | File | Texture;
	current_canvas_size: { width: number; height: number };
	current_scale: number;
	current_position: { x: number; y: number };
	border_region: number;

	scaled_width!: number;
	scaled_height!: number;

	constructor(
		context: ImageEditorContext,
		background: Blob | File | Texture,
		fixed_canvas: boolean,
		border_region = 0
	) {
		this.context = context;
		this.background = background;
		this.fixed_canvas = fixed_canvas;
		this.border_region = border_region;
		this.current_canvas_size = get(this.context.dimensions);
		this.current_scale = get(this.context.scale);
		this.current_position = get(this.context.position);
		this.sprite = new Sprite();
	}

	async start(): Promise<[number, number]> {
		// Create the sprite from the blob
		let image_texture: Texture;
		if (this.background instanceof Texture) {
			image_texture = this.background;
		} else {
			const img = await createImageBitmap(this.background);
			image_texture = Texture.from(img);
		}

		this.sprite = new Sprite(image_texture);

		return this.handle_image();
	}

	private handle_image(): [number, number] {
		// Handle fixed canvas differently when border region is present
		if (this.fixed_canvas) {
			// Calculate the effective canvas size accounting for border region
			const effectiveCanvasWidth = Math.max(
				this.current_canvas_size.width - this.border_region * 2,
				10
			);
			const effectiveCanvasHeight = Math.max(
				this.current_canvas_size.height - this.border_region * 2,
				10
			);

			// Fit the image to the canvas while maintaining aspect ratio

			const { width, height, x, y } = fit_image_to_canvas(
				this.sprite.width,
				this.sprite.height,
				effectiveCanvasWidth,
				effectiveCanvasHeight
			);

			this.sprite.width = width;
			this.sprite.height = height;

			// Center the image in the canvas
			this.sprite.x = x + this.border_region;
			this.sprite.y = y + this.border_region;
		} else {
			// For non-fixed canvas, use natural dimensions plus border
			const width = this.sprite.width;
			const height = this.sprite.height;

			// Position at the border's offset from origin
			this.sprite.x = this.border_region;
			this.sprite.y = this.border_region;

			return [width + this.border_region * 2, height + this.border_region * 2];
		}

		return [this.current_canvas_size.width, this.current_canvas_size.height];
	}

	async execute(): Promise<void> {
		// First ensure we have run start() to create the sprite and get dimensions
		const [width, height] = await this.start();

		// Update image properties with the original dimensions and center in viewport
		await this.context.set_image_properties({
			scale: 1, // Start at 1:1 scale
			position: {
				x: this.context.app.screen.width / 2,
				y: this.context.app.screen.height / 2
			},
			width: this.fixed_canvas ? this.current_canvas_size.width : width,
			height: this.fixed_canvas ? this.current_canvas_size.height : height
		});

		// Create new background layer and add the sprite
		const background_layer = this.context.layer_manager.create_background_layer(
			this.fixed_canvas ? this.current_canvas_size.width : width,
			this.fixed_canvas ? this.current_canvas_size.height : height
		);
		this.sprite.zIndex = 0;
		background_layer.addChild(this.sprite);

		// Resize and preserve content of existing layers
		this.context.layer_manager.reset_layers(
			this.fixed_canvas ? this.current_canvas_size.width : width,
			this.fixed_canvas ? this.current_canvas_size.height : height,
			true
		);

		this.context.set_background_image(this.sprite);

		this.context.reset();
	}

	async undo(): Promise<void> {
		if (this.sprite) {
			this.sprite.destroy();
		}
	}
}

/**
 * Command that sets a background
 */
interface BgColorCommand extends Command {
	/**
	 * Initial setup for the bg command
	 * @returns
	 */
	start: () => [number, number];
}

/**
 * Adds a background color to the canvas.
 * @param container The container to add the image to.
 * @param renderer The renderer to use for the image.
 * @param color The background color to add.
 * @param width The width of the background.
 * @param height The height of the background.
 * @param resize The function to resize the canvas.
 * @returns A command that can be used to undo the action.
 */
export function add_bg_color(
	container: Container,
	renderer: Renderer,
	color: ColorSource,
	width: number,
	height: number,
	resize: (width: number, height: number) => void
): BgColorCommand {
	let sprite: Sprite;
	return {
		start() {
			container.removeChildren();
			const graphics = make_graphics(1);
			const texture = RenderTexture.create({
				width,
				height
			});

			renderer.render(graphics, { renderTexture: texture });
			sprite = new Sprite(texture);
			return [sprite.width, sprite.height];
		},
		async execute() {
			resize(sprite.width, sprite.height);
			sprite.zIndex = 1;
			container.addChild(sprite);
		},
		undo() {
			container.removeChildren();
		}
	};
}

/**
 * Calculates new dimensions and position for an image to fit within a canvas while maintaining aspect ratio
 * @param image_width Original width of the image
 * @param image_height Original height of the image
 * @param canvas_width Width of the canvas
 * @param canvas_height Height of the canvas
 * @returns Object containing new dimensions and position
 */
export function fit_image_to_canvas(
	image_width: number,
	image_height: number,
	canvas_width: number,
	canvas_height: number
): {
	width: number;
	height: number;
	x: number;
	y: number;
} {
	const image_aspect_ratio = image_width / image_height;
	const canvas_aspect_ratio = canvas_width / canvas_height;

	let new_width: number;
	let new_height: number;

	if (image_aspect_ratio > canvas_aspect_ratio) {
		new_width = canvas_width;
		new_height = canvas_width / image_aspect_ratio;
	} else {
		new_height = canvas_height;
		new_width = canvas_height * image_aspect_ratio;
	}

	// center image
	const x = Math.round((canvas_width - new_width) / 2);
	const y = Math.round((canvas_height - new_height) / 2);

	return {
		width: Math.round(new_width),
		height: Math.round(new_height),
		x,
		y
	};
}
