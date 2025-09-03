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
import { type Command } from "../core/commands";
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
	start: () => Promise<void>;
}

export class AddImageCommand implements BgImageCommand {
	sprite: Sprite | null = null;
	fixed_canvas: boolean;
	context: ImageEditorContext;
	background: Blob | File | Texture;
	current_canvas_size: { width: number; height: number };
	computed_dimensions: { width: number; height: number };
	current_scale: number;
	current_position: { x: number; y: number };
	border_region: number;

	scaled_width!: number;
	scaled_height!: number;

	private previous_image: {
		texture: Texture;
		width: number;
		height: number;
		x: number;
		y: number;
		border_region: number;
	} | null = null;
	name: string;

	constructor(
		context: ImageEditorContext,
		background: Blob | File | Texture,
		fixed_canvas: boolean,
		border_region = 0
	) {
		this.name = "AddImage";
		this.context = context;
		this.background = background;
		this.fixed_canvas = fixed_canvas;
		this.border_region = border_region;
		this.current_canvas_size = get(this.context.dimensions);
		this.current_scale = get(this.context.scale);
		this.current_position = get(this.context.position);

		this.computed_dimensions = { width: 0, height: 0 };

		if (
			this.context.background_image &&
			this.context.background_image.texture
		) {
			const bg = this.context.background_image;
			const stored_border_region = (bg as any).borderRegion || 0;

			this.previous_image = {
				texture: this.clone_texture(bg.texture),
				width: bg.width,
				height: bg.height,
				x: bg.position.x,
				y: bg.position.y,
				border_region: stored_border_region
			};
		}
	}

	/**
	 * Creates a copy of a texture to avoid reference issues
	 */
	private clone_texture(texture: Texture): Texture {
		const render_texture = RenderTexture.create({
			width: texture.width,
			height: texture.height,
			resolution: window.devicePixelRatio || 1
		});

		const sprite = new Sprite(texture);
		const container = new Container();
		container.addChild(sprite);

		this.context.app.renderer.render(container, {
			renderTexture: render_texture
		});

		container.destroy({ children: true });
		return render_texture;
	}

	async start(): Promise<void> {
		let image_texture: Texture;
		if (this.background instanceof Texture) {
			image_texture = this.background;
		} else {
			const img = await createImageBitmap(this.background);
			image_texture = Texture.from(img);
		}

		this.sprite = new Sprite(image_texture);

		const [width, height] = this.handle_image();
		this.computed_dimensions = { width, height };
	}

	private handle_image(): [number, number] {
		if (this.sprite === null) {
			return [0, 0];
		}
		if (this.fixed_canvas) {
			const effectiveCanvasWidth = Math.max(
				this.current_canvas_size.width - this.border_region * 2,
				10
			);
			const effectiveCanvasHeight = Math.max(
				this.current_canvas_size.height - this.border_region * 2,
				10
			);

			const { width, height, x, y } = fit_image_to_canvas(
				this.sprite.width,
				this.sprite.height,
				effectiveCanvasWidth,
				effectiveCanvasHeight
			);

			this.sprite.width = width;
			this.sprite.height = height;

			this.sprite.x = x + this.border_region;
			this.sprite.y = y + this.border_region;
		} else {
			const width = this.sprite.width;
			const height = this.sprite.height;

			this.sprite.x = this.border_region;
			this.sprite.y = this.border_region;

			return [width + this.border_region * 2, height + this.border_region * 2];
		}

		return [this.current_canvas_size.width, this.current_canvas_size.height];
	}

	async execute(context?: ImageEditorContext): Promise<void> {
		if (context) {
			this.context = context;
		}

		await this.start();

		if (this.sprite === null) {
			return;
		}

		const { width, height } = this.computed_dimensions;

		await this.context.set_image_properties({
			scale: 1,
			position: {
				x: this.context.app.screen.width / 2,
				y: this.context.app.screen.height / 2
			},
			width: this.fixed_canvas ? this.current_canvas_size.width : width,
			height: this.fixed_canvas ? this.current_canvas_size.height : height
		});

		const background_layer = this.context.layer_manager.create_background_layer(
			this.fixed_canvas ? this.current_canvas_size.width : width,
			this.fixed_canvas ? this.current_canvas_size.height : height
		);
		this.sprite.zIndex = 0;
		background_layer.addChild(this.sprite);

		this.context.layer_manager.reset_layers(
			this.fixed_canvas ? this.current_canvas_size.width : width,
			this.fixed_canvas ? this.current_canvas_size.height : height,
			true
		);

		if (this.border_region > 0) {
			(this.sprite as any).borderRegion = this.border_region;
		}

		this.context.set_background_image(this.sprite);

		this.context.reset();
	}

	async undo(): Promise<void> {
		if (this.sprite) {
			this.sprite.destroy();

			if (this.previous_image) {
				const previous_sprite = new Sprite(this.previous_image.texture);
				previous_sprite.width = this.previous_image.width;
				previous_sprite.height = this.previous_image.height;
				previous_sprite.position.set(
					this.previous_image.x,
					this.previous_image.y
				);

				if (this.previous_image.border_region > 0) {
					(previous_sprite as any).borderRegion =
						this.previous_image.border_region;
				}

				await this.context.set_image_properties({
					scale: 1,
					position: {
						x: this.context.app.screen.width / 2,
						y: this.context.app.screen.height / 2
					},
					width: this.previous_image.width,
					height: this.previous_image.height
				});

				const background_layer =
					this.context.layer_manager.create_background_layer(
						this.previous_image.width,
						this.previous_image.height
					);

				previous_sprite.zIndex = 0;
				background_layer.addChild(previous_sprite);

				this.context.layer_manager.reset_layers(
					this.previous_image.width,
					this.previous_image.height,
					true
				);

				this.context.set_background_image(previous_sprite);
			} else {
				await this.context.set_image_properties({
					scale: 1,
					position: {
						x: this.context.app.screen.width / 2,
						y: this.context.app.screen.height / 2
					},
					width: this.current_canvas_size.width,
					height: this.current_canvas_size.height
				});

				this.context.layer_manager.create_background_layer(
					this.current_canvas_size.width,
					this.current_canvas_size.height
				);

				this.context.layer_manager.reset_layers(
					this.current_canvas_size.width,
					this.current_canvas_size.height
				);
			}

			this.context.reset();
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
		name: "AddBgColor",
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

	const x = Math.round((canvas_width - new_width) / 2);
	const y = Math.round((canvas_height - new_height) / 2);

	return {
		width: Math.round(new_width),
		height: Math.round(new_height),
		x,
		y
	};
}
