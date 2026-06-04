import {
	Container,
	RenderTexture,
	Sprite,
	Graphics,
	Application,
	Texture,
} from "pixi.js";
import { type ImageEditorContext } from "../core/editor";
import { type Command } from "../core/commands";

function parse_color(color: string): [number, number, number] {
	if (!color.startsWith("#")) {
		return [255, 255, 255];
	}

	const value = parseInt(color.slice(1), 16);
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function create_hard_stamp_sprite(
	x: number,
	y: number,
	size: number,
	color: string,
): Sprite {
	const min_x = Math.floor(x - size);
	const max_x = Math.ceil(x + size);
	const min_y = Math.floor(y - size);
	const max_y = Math.ceil(y + size);
	const width = max_x - min_x + 1;
	const height = max_y - min_y + 1;
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext("2d");
	if (!context) {
		return new Sprite(Texture.EMPTY);
	}

	const [r, g, b] = parse_color(color);
	const image_data = context.createImageData(width, height);
	const size_squared = size * size;

	for (let py = min_y; py <= max_y; py++) {
		for (let px = min_x; px <= max_x; px++) {
			const dx = px + 0.5 - x;
			const dy = py + 0.5 - y;
			if (dx * dx + dy * dy <= size_squared) {
				const index = ((py - min_y) * width + (px - min_x)) * 4;
				image_data.data[index] = r;
				image_data.data[index + 1] = g;
				image_data.data[index + 2] = b;
				image_data.data[index + 3] = 255;
			}
		}
	}

	context.putImageData(image_data, 0, 0);

	const texture = Texture.from(
		{
			resource: canvas,
			scaleMode: "nearest",
		},
		true,
	);
	const sprite = new Sprite({ texture, roundPixels: true });
	sprite.position.set(min_x, min_y);
	return sprite;
}

/**
 * Represents a single drawing segment with all its parameters
 */
interface BrushSegment {
	from_x: number;
	from_y: number;
	to_x: number;
	to_y: number;
	size: number;
	color: string;
	opacity: number;
	mode: "draw" | "erase";
	antialias: boolean;
}

/**
 * Represents a complete brush stroke containing multiple segments
 */
interface BrushStroke {
	segments: BrushSegment[];
	layer_id: string;
}

export class BrushCommand implements Command {
	private stroke_data: BrushStroke;
	private context: ImageEditorContext;
	private original_texture: Texture | null = null;

	name: string;

	constructor(
		context: ImageEditorContext,
		stroke_data: BrushStroke,
		original_texture?: Texture,
	) {
		this.name = "Draw";
		this.stroke_data = stroke_data;
		this.context = context;
		if (original_texture) {
			this.original_texture = this.create_texture_from(original_texture);
		}
	}

	/**
	 * Creates a new texture with the same content as the source texture
	 */
	private create_texture_from(source: Texture): Texture {
		const texture = RenderTexture.create({
			width: source.width,
			height: source.height,
			resolution: window.devicePixelRatio || 1,
			antialias: this.stroke_data.segments[0]?.antialias ?? true,
		});

		const sprite = new Sprite(source);
		const container = new Container();
		container.addChild(sprite);

		this.context.app.renderer.render(container, {
			renderTexture: texture,
		});

		container.destroy({ children: true });
		return texture;
	}

	/**
	 * Recreates the stroke by rendering all segments from the stored parameters
	 * Preserves the exact order of draw/erase operations
	 */
	private render_stroke_from_data(
		stroke_data: BrushStroke,
		target_texture: RenderTexture,
	): void {
		const draw_segments = stroke_data.segments.filter((s) => s.mode === "draw");
		const erase_segments = stroke_data.segments.filter(
			(s) => s.mode === "erase",
		);

		if (draw_segments.length > 0) {
			const graphics = new Graphics();
			const container = new Container();
			container.addChild(graphics);
			let alpha = 1;

			for (const segment of draw_segments) {
				if (segment.opacity < alpha) {
					alpha = segment.opacity;
				}
				let colorValue = 0xffffff;
				if (segment.color.startsWith("#")) {
					colorValue = parseInt(segment.color.replace("#", "0x"), 16);
				}

				graphics.setFillStyle({
					color: colorValue,
					alpha: 1,
				});

				this.render_segment(container, graphics, segment, segment.color);
			}

			// we need a sprite in order to set the alpha and for that we need a texture
			// i'm not entirely sure why other approaches didn't work
			const alpha_sprite_texture = RenderTexture.create({
				width: target_texture.width,
				height: target_texture.height,
				resolution: window.devicePixelRatio || 1,
				antialias: draw_segments[0]?.antialias ?? true,
			});

			const alpha_sprite = new Sprite(alpha_sprite_texture);
			this.context.app.renderer.render({
				container: container,
				target: alpha_sprite_texture,
			});

			alpha_sprite.alpha = alpha;

			this.context.app.renderer.render({
				container: alpha_sprite,
				target: target_texture,
				clear: false,
			});

			container.destroy({ children: true });
			alpha_sprite.destroy();
			alpha_sprite_texture.destroy();
		}

		if (erase_segments.length > 0) {
			// create a temp texture to work with
			const temp_content_texture = RenderTexture.create({
				width: target_texture.width,
				height: target_texture.height,
				resolution: window.devicePixelRatio || 1,
				antialias: erase_segments[0]?.antialias ?? true,
			});

			const copy_sprite = new Sprite(target_texture);
			const copy_container = new Container();
			copy_container.addChild(copy_sprite);

			this.context.app.renderer.render({
				container: copy_container,
				target: temp_content_texture,
				clear: true,
			});

			// create a graphics object to draw the erase segments
			const erase_graphics = new Graphics();
			const erase_container = new Container();
			erase_container.addChild(erase_graphics);

			erase_graphics.setFillStyle({
				color: 0xffffff,
				alpha: 1.0,
			});

			for (const segment of erase_segments) {
				this.render_segment(
					erase_container,
					erase_graphics,
					segment,
					"#ffffff",
				);
			}

			// create a separate texture to hold the mask
			const mask_texture = RenderTexture.create({
				width: target_texture.width,
				height: target_texture.height,
				resolution: window.devicePixelRatio || 1,
				antialias: erase_segments[0]?.antialias ?? true,
			});

			this.context.app.renderer.render({
				container: erase_container,
				target: mask_texture,
				clear: true,
			});

			const content_sprite = new Sprite(temp_content_texture);
			const mask_sprite = new Sprite(mask_texture);

			// only now do we create a sprite from the original texture and add the mask
			const masked_container = new Container();
			masked_container.addChild(content_sprite);
			masked_container.setMask({ mask: mask_sprite, inverse: true }); // inverse mask = erase

			// now we can render the masked content back to the target texture
			this.context.app.renderer.render({
				container: masked_container,
				target: target_texture,
				clear: true,
			});

			copy_container.destroy({ children: true });
			erase_container.destroy({ children: true });
			masked_container.destroy({ children: true });
			temp_content_texture.destroy();
			mask_texture.destroy();
		}
	}

	/**
	 * Renders a segment to a container.
	 */
	private render_segment(
		container: Container,
		graphics: Graphics,
		segment: BrushSegment,
		color: string,
	): void {
		const distance = Math.sqrt(
			Math.pow(segment.to_x - segment.from_x, 2) +
				Math.pow(segment.to_y - segment.from_y, 2),
		);

		if (distance < 0.1) {
			this.render_stamp(
				container,
				graphics,
				segment.from_x,
				segment.from_y,
				segment.size,
				color,
				segment.antialias,
			);
		} else {
			const spacing = Math.max(segment.size / 3, 2);
			const steps = Math.max(Math.ceil(distance / spacing), 2);

			for (let i = 0; i < steps; i++) {
				const t = i / (steps - 1);
				const x = segment.from_x + (segment.to_x - segment.from_x) * t;
				const y = segment.from_y + (segment.to_y - segment.from_y) * t;

				this.render_stamp(
					container,
					graphics,
					x,
					y,
					segment.size,
					color,
					segment.antialias,
				);
			}
		}
	}

	private render_stamp(
		container: Container,
		graphics: Graphics,
		x: number,
		y: number,
		size: number,
		color: string,
		antialias: boolean,
	): void {
		if (antialias) {
			graphics.circle(x, y, size).fill();
			return;
		}

		container.addChild(create_hard_stamp_sprite(x, y, size, color));
	}

	async execute(context: ImageEditorContext): Promise<void> {
		if (context) {
			this.context = context;
		}

		let layer_textures = this.context.layer_manager.get_layer_textures(
			this.stroke_data.layer_id,
		);

		if (!layer_textures) {
			const all_layers = this.context.layer_manager.get_layers();
			const top_layer = all_layers[all_layers.length - 1];
			layer_textures = this.context.layer_manager.get_layer_textures(
				top_layer.id,
			);
		}

		if (!layer_textures) return;

		// create a temporary texture to render the stroke
		const temp_texture = RenderTexture.create({
			width: layer_textures.draw.width,
			height: layer_textures.draw.height,
			resolution: window.devicePixelRatio || 1,
			antialias: this.stroke_data.segments[0]?.antialias ?? true,
		});

		// copy current layer content to temp texture
		const current_sprite = new Sprite(layer_textures.draw);
		const temp_container = new Container();
		temp_container.addChild(current_sprite);

		this.context.app.renderer.render({
			container: temp_container,
			target: temp_texture,
			clear: true,
		});

		temp_container.destroy({ children: true });

		this.render_stroke_from_data(this.stroke_data, temp_texture);

		// copy final result back to layer texture
		const final_sprite = new Sprite(temp_texture);
		const final_container = new Container();
		final_container.addChild(final_sprite);

		this.context.app.renderer.render({
			container: final_container,
			target: layer_textures.draw,
			clear: true,
		});

		final_container.destroy({ children: true });
		temp_texture.destroy();
	}

	async undo(): Promise<void> {
		if (!this.original_texture) return;

		const layer_textures = this.context.layer_manager.get_layer_textures(
			this.stroke_data.layer_id,
		);
		if (!layer_textures) return;

		const temp_sprite = new Sprite(this.original_texture);
		const temp_container = new Container();
		temp_container.addChild(temp_sprite);

		this.context.app.renderer.render({
			container: temp_container,
			target: layer_textures.draw,
			clear: true,
		});

		temp_container.destroy({ children: true });
	}
}

/**
 * Class to handle texture operations for the brush tool.
 * Simplified to work directly with layer textures.
 */
export class BrushTextures {
	private stroke_texture: RenderTexture | null = null;
	private erase_texture: RenderTexture | null = null;
	private display_container: Container | null = null;
	private stroke_container: Container | null = null;
	private stroke_graphics: Graphics | null = null;
	private preview_sprite: Sprite | null = null;
	private erase_graphics: Graphics | null = null;
	private dimensions: { width: number; height: number };
	private image_editor_context: ImageEditorContext;
	private app: Application;
	private antialias: boolean;
	private is_new_stroke = true;

	private current_opacity = 1.0;
	private original_layer_texture: Texture | null = null;
	private active_layer_id: string | null = null;
	private current_stroke_segments: BrushSegment[] = [];
	private hard_stamp_sprites: Sprite[] = [];

	constructor(
		image_editor_context: ImageEditorContext,
		app: Application,
		antialias = true,
	) {
		this.image_editor_context = image_editor_context;
		this.app = app;
		this.antialias = antialias;

		this.dimensions = {
			width: this.image_editor_context.image_container.width,
			height: this.image_editor_context.image_container.height,
		};
	}

	/**
	 * Initializes textures needed for the brush tool.
	 */
	initialize_textures(): void {
		this.cleanup_textures();

		const local_bounds =
			this.image_editor_context.image_container.getLocalBounds();

		this.dimensions = {
			width: local_bounds.width,
			height: local_bounds.height,
		};

		this.stroke_texture = RenderTexture.create({
			width: this.dimensions.width,
			height: this.dimensions.height,
			resolution: window.devicePixelRatio || 1,
			antialias: this.antialias,
		});

		this.erase_texture = RenderTexture.create({
			width: this.dimensions.width,
			height: this.dimensions.height,
			resolution: window.devicePixelRatio || 1,
			antialias: this.antialias,
		});

		this.display_container = new Container();

		this.image_editor_context.image_container.addChild(this.display_container);

		this.stroke_container = new Container();
		this.stroke_graphics = new Graphics();
		this.stroke_container.addChild(this.stroke_graphics);

		this.erase_graphics = new Graphics();

		this.preview_sprite = new Sprite(this.stroke_texture);
		this.preview_sprite.alpha = 0;
		this.display_container.addChild(this.preview_sprite);

		const clear_container = new Container();
		this.app.renderer.render(clear_container, {
			renderTexture: this.stroke_texture,
		});
		this.app.renderer.render(clear_container, {
			renderTexture: this.erase_texture,
		});
		clear_container.destroy();

		this.is_new_stroke = true;
		this.current_opacity = 1.0;
	}

	/**
	 * Reinitializes textures when needed (e.g., after resizing).
	 */
	reinitialize(): void {
		const local_bounds =
			this.image_editor_context.image_container.getLocalBounds();
		if (
			Math.round(local_bounds.width) !== Math.round(this.dimensions.width) ||
			Math.round(local_bounds.height) !== Math.round(this.dimensions.height)
		) {
			this.initialize_textures();
		}
	}

	/**
	 * Cleans up texture resources.
	 */
	cleanup_textures(): void {
		this.clear_hard_stamp_sprites();

		if (this.stroke_texture) {
			this.stroke_texture.destroy();
			this.stroke_texture = null;
		}

		if (this.erase_texture) {
			this.erase_texture.destroy();
			this.erase_texture = null;
		}

		if (this.display_container) {
			if (this.display_container.parent) {
				this.display_container.parent.removeChild(this.display_container);
			}
			this.display_container.destroy({ children: true });
			this.display_container = null;
		}

		if (this.original_layer_texture) {
			this.original_layer_texture.destroy();
			this.original_layer_texture = null;
		}

		this.stroke_container = null;
		this.stroke_graphics = null;
		this.preview_sprite = null;
		this.erase_graphics = null;
		this.active_layer_id = null;
		this.hard_stamp_sprites = [];
	}

	private clear_hard_stamp_sprites(): void {
		for (const sprite of this.hard_stamp_sprites) {
			if (sprite.parent) {
				sprite.parent.removeChild(sprite);
			}
			sprite.destroy({ texture: true, textureSource: true });
		}
		this.hard_stamp_sprites = [];
	}

	/**
	 * Preserve the canvas state when starting a new stroke.
	 */
	preserve_canvas_state(): void {
		const active_layer =
			this.image_editor_context.layer_manager.get_active_layer();
		if (!active_layer) return;

		const layers = this.image_editor_context.layer_manager.get_layers();
		const layer = layers.find((l) => l.container === active_layer);
		if (!layer) return;

		this.active_layer_id = layer.id;

		const layer_textures =
			this.image_editor_context.layer_manager.get_layer_textures(layer.id);
		if (!layer_textures) return;

		if (this.original_layer_texture) {
			this.original_layer_texture.destroy();
		}

		this.original_layer_texture = RenderTexture.create({
			width: this.dimensions.width,
			height: this.dimensions.height,
			resolution: window.devicePixelRatio || 1,
			antialias: this.antialias,
		});

		const temp_sprite = new Sprite(layer_textures.draw);
		const temp_container = new Container();
		temp_container.addChild(temp_sprite);

		this.app.renderer.render(temp_container, {
			renderTexture: this.original_layer_texture,
		});

		temp_container.destroy({ children: true });

		this.is_new_stroke = true;
	}

	/**
	 * Resets the eraser mask.
	 */
	reset_eraser_mask(): void {
		if (!this.erase_graphics || !this.erase_texture) return;

		this.erase_graphics.clear();
		this.erase_graphics.setFillStyle({ color: 0xffffff, alpha: 1.0 });
		this.erase_graphics
			.rect(0, 0, this.dimensions.width, this.dimensions.height)
			.fill();
		this.erase_graphics.endFill();

		this.app.renderer.render(this.erase_graphics, {
			renderTexture: this.erase_texture,
		});
	}

	/**
	 * Commits the current stroke to the active layer and returns a command for undo/redo.
	 */
	commit_stroke(): void {
		if (
			!this.stroke_texture ||
			!this.preview_sprite ||
			!this.stroke_graphics ||
			!this.original_layer_texture ||
			!this.active_layer_id
		)
			return;

		this.preview_sprite.visible = false;

		const active_layer =
			this.image_editor_context.layer_manager.get_active_layer();

		if (!active_layer) return;

		const layers = this.image_editor_context.layer_manager.get_layers();
		const layer = layers.find((l) => l.container === active_layer);
		if (!layer) return;

		if (layer.id !== this.active_layer_id) return;

		const layer_textures =
			this.image_editor_context.layer_manager.get_layer_textures(layer.id);
		if (!layer_textures) return;

		const stroke_data: BrushStroke = {
			segments: [...this.current_stroke_segments],
			layer_id: this.active_layer_id,
		};

		const brush_command = new BrushCommand(
			this.image_editor_context,
			stroke_data,
			this.original_layer_texture,
		);

		if (this.stroke_graphics) {
			this.stroke_graphics.clear();
		}
		this.clear_hard_stamp_sprites();
		const clear_container = new Container();
		this.app.renderer.render(clear_container, {
			renderTexture: this.stroke_texture,
		});
		clear_container.destroy();

		this.is_new_stroke = true;
		this.original_layer_texture = null;
		this.active_layer_id = null;
		this.current_stroke_segments = [];

		this.image_editor_context.command_manager.execute(
			brush_command,
			this.image_editor_context,
		);
	}

	/**
	 * Calculates the distance between two points.
	 */
	private calculate_distance(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
	): number {
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}

	/**
	 * Draws a segment for the current stroke using a simple "stamp" approach.
	 */
	draw_segment(
		from_x: number,
		from_y: number,
		to_x: number,
		to_y: number,
		size: number,
		color: string,
		opacity: number,
		mode: "draw" | "erase",
	): void {
		if (
			!this.stroke_graphics ||
			!this.stroke_texture ||
			!this.stroke_container ||
			!this.preview_sprite
		)
			return;

		if (this.is_new_stroke && !this.original_layer_texture) {
			this.preserve_canvas_state();
		}

		this.current_opacity =
			mode === "draw" ? Math.min(Math.max(opacity, 0), 1) : 0.5;

		const scaled_size = size;

		if (this.is_new_stroke) {
			this.stroke_graphics.clear();
			this.clear_hard_stamp_sprites();
			this.current_stroke_segments = [];

			const clear_container = new Container();
			this.app.renderer.render(clear_container, {
				renderTexture: this.stroke_texture,
			});
			clear_container.destroy();

			this.is_new_stroke = false;
		}

		this.current_stroke_segments.push({
			from_x,
			from_y,
			to_x,
			to_y,
			size: scaled_size,
			color,
			opacity: this.current_opacity,
			mode,
			antialias: this.antialias,
		});

		if (mode === "draw") {
			let colorValue = 0xffffff;
			try {
				if (color.startsWith("#")) {
					colorValue = parseInt(color.replace("#", "0x"), 16);
				}
			} catch (e) {
				colorValue = 0xffffff;
			}
			this.stroke_graphics.setFillStyle({
				color: colorValue,
				alpha: 1.0,
			});
		} else {
			this.stroke_graphics.setFillStyle({
				color: 0xffffff,
				alpha: 1.0,
			});
		}

		const distance = this.calculate_distance(from_x, from_y, to_x, to_y);
		const stamp_color = mode === "draw" ? color : "#ffffff";

		if (distance < 0.1) {
			this.render_stamp_to_graphics(
				this.stroke_graphics,
				from_x,
				from_y,
				scaled_size,
				stamp_color,
			);
		} else {
			const spacing = Math.max(scaled_size / 3, 2);
			const steps = Math.max(Math.ceil(distance / spacing), 2);

			for (let i = 0; i < steps; i++) {
				const t = i / (steps - 1);
				const x = from_x + (to_x - from_x) * t;
				const y = from_y + (to_y - from_y) * t;

				this.render_stamp_to_graphics(
					this.stroke_graphics,
					x,
					y,
					scaled_size,
					stamp_color,
				);
			}
		}

		this.stroke_graphics.endFill();

		this.app.renderer.render(this.stroke_container, {
			renderTexture: this.stroke_texture,
		});

		if (mode === "draw") {
			this.preview_sprite.texture = this.stroke_texture;
			this.preview_sprite.alpha = this.current_opacity;

			this.preview_sprite.tint = 0xffffff;
		} else {
			const active_layer =
				this.image_editor_context.layer_manager.get_active_layer();
			if (!active_layer) return;

			const layers = this.image_editor_context.layer_manager.get_layers();
			const layer = layers.find((l) => l.container === active_layer);
			if (!layer) return;

			const layer_textures =
				this.image_editor_context.layer_manager.get_layer_textures(layer.id);
			if (!layer_textures) return;

			const preview_texture = RenderTexture.create({
				width: this.dimensions.width,
				height: this.dimensions.height,
				resolution: window.devicePixelRatio || 1,
				antialias: this.antialias,
			});

			const base_container = new Container();
			const content_sprite = new Sprite(layer_textures.draw);
			base_container.addChild(content_sprite);
			this.app.renderer.render(base_container, {
				renderTexture: preview_texture,
			});
			base_container.destroy({ children: true });

			const preview_container = new Container();

			const mask_sprite = new Sprite(this.stroke_texture);

			const overlay = new Graphics();
			overlay.setFillStyle({ color: 0xffffff, alpha: 0.5 });
			overlay.rect(0, 0, this.dimensions.width, this.dimensions.height).fill();

			overlay.setMask({ mask: mask_sprite, inverse: false });

			preview_container.addChild(overlay);

			this.app.renderer.render(preview_container, {
				renderTexture: preview_texture,
			});

			this.preview_sprite.texture = preview_texture;
			this.preview_sprite.alpha = 1.0;

			preview_container.destroy({ children: true });
			preview_texture.destroy();
		}

		this.preview_sprite.visible = true;
	}

	private render_stamp_to_graphics(
		graphics: Graphics,
		x: number,
		y: number,
		size: number,
		color: string,
	): void {
		if (this.antialias) {
			graphics.circle(x, y, size).fill();
			return;
		}

		const sprite = create_hard_stamp_sprite(x, y, size, color);
		this.hard_stamp_sprites.push(sprite);
		this.stroke_container?.addChild(sprite);
	}

	/**
	 * Gets current dimensions of the texture.
	 */
	get_dimensions(): { width: number; height: number } {
		return this.dimensions;
	}

	/**
	 * Checks if textures are properly initialized.
	 */
	get textures_initialized(): boolean {
		return !!(
			this.stroke_texture &&
			this.display_container &&
			this.preview_sprite
		);
	}

	/**
	 * Cleanup all resources.
	 */
	cleanup(): void {
		this.cleanup_textures();
	}
}
