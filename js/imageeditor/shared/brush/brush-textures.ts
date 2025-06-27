import {
	Container,
	RenderTexture,
	Sprite,
	Graphics,
	Application,
	Texture
} from "pixi.js";
import { type ImageEditorContext } from "../core/editor";
import { type Command } from "../core/commands";

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
		original_texture?: Texture
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
			resolution: window.devicePixelRatio || 1
		});

		const sprite = new Sprite(source);
		const container = new Container();
		container.addChild(sprite);

		this.context.app.renderer.render(container, {
			renderTexture: texture
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
		target_texture: RenderTexture
	): void {
		// Process segments in order to preserve draw/erase sequence
		for (let i = 0; i < stroke_data.segments.length; i++) {
			const segment = stroke_data.segments[i];

			if (segment.mode === "draw") {
				this.apply_draw_segment(segment, target_texture);
			} else {
				this.apply_erase_segment(segment, target_texture);
			}
		}
	}

	/**
	 * Apply a single draw segment to the target texture
	 */
	private apply_draw_segment(
		segment: BrushSegment,
		target_texture: RenderTexture
	): void {
		const graphics = new Graphics();
		const container = new Container();
		container.addChild(graphics);

		// Set up color
		let colorValue = 0xffffff;
		try {
			if (segment.color.startsWith("#")) {
				colorValue = parseInt(segment.color.replace("#", "0x"), 16);
			}
		} catch (e) {
			colorValue = 0xffffff;
		}

		graphics.setFillStyle({
			color: colorValue,
			alpha: 1.0
		});

		// Render the segment
		this.render_segment_to_graphics(graphics, segment);

		// Create temp texture for this segment
		const segment_texture = RenderTexture.create({
			width: target_texture.width,
			height: target_texture.height,
			resolution: window.devicePixelRatio || 1
		});

		// Render segment to temp texture
		this.context.app.renderer.render(container, {
			renderTexture: segment_texture
		});

		// Composite temp texture onto target with opacity
		const composite_container = new Container();
		const existing_sprite = new Sprite(target_texture);
		composite_container.addChild(existing_sprite);

		const segment_sprite = new Sprite(segment_texture);
		segment_sprite.alpha = segment.opacity;
		composite_container.addChild(segment_sprite);

		// Clear target and render composite
		const clear_container = new Container();
		this.context.app.renderer.render(clear_container, {
			renderTexture: target_texture
		});
		clear_container.destroy();

		this.context.app.renderer.render(composite_container, {
			renderTexture: target_texture
		});

		// Cleanup
		container.destroy({ children: true });
		composite_container.destroy({ children: true });
		segment_texture.destroy();
	}

	/**
	 * Apply a single erase segment to the target texture
	 */
	private apply_erase_segment(
		segment: BrushSegment,
		target_texture: RenderTexture
	): void {
		const graphics = new Graphics();
		const container = new Container();
		container.addChild(graphics);

		// Set up white for erase mask
		graphics.setFillStyle({
			color: 0xffffff,
			alpha: 1.0
		});

		// Render the segment
		this.render_segment_to_graphics(graphics, segment);

		// Create temp texture for erase mask
		const mask_texture = RenderTexture.create({
			width: target_texture.width,
			height: target_texture.height,
			resolution: window.devicePixelRatio || 1
		});

		// Render erase mask to temp texture
		this.context.app.renderer.render(container, {
			renderTexture: mask_texture
		});

		// Apply inverse mask to target texture
		const mask_container = new Container();
		const content_sprite = new Sprite(target_texture);
		mask_container.addChild(content_sprite);

		const mask_sprite = new Sprite(mask_texture);
		mask_container.setMask({ mask: mask_sprite, inverse: true });

		// Clear target and render masked result
		const clear_container = new Container();
		this.context.app.renderer.render(clear_container, {
			renderTexture: target_texture
		});
		clear_container.destroy();

		this.context.app.renderer.render(mask_container, {
			renderTexture: target_texture
		});

		// Cleanup
		container.destroy({ children: true });
		mask_container.destroy({ children: true });
		mask_texture.destroy();
	}

	/**
	 * Renders a segment to a graphics object (extracted from renderSegment)
	 */
	private render_segment_to_graphics(
		graphics: Graphics,
		segment: BrushSegment
	): void {
		const distance = Math.sqrt(
			Math.pow(segment.to_x - segment.from_x, 2) +
				Math.pow(segment.to_y - segment.from_y, 2)
		);

		if (distance < 0.1) {
			graphics.circle(segment.from_x, segment.from_y, segment.size).fill();
		} else {
			const spacing = Math.max(segment.size / 3, 2);
			const steps = Math.max(Math.ceil(distance / spacing), 2);

			for (let i = 0; i < steps; i++) {
				const t = i / (steps - 1);
				const x = segment.from_x + (segment.to_x - segment.from_x) * t;
				const y = segment.from_y + (segment.to_y - segment.from_y) * t;

				graphics.circle(x, y, segment.size).fill();
			}
		}
	}

	async execute(context: ImageEditorContext): Promise<void> {
		if (context) {
			this.context = context;
		}

		let layer_textures = this.context.layer_manager.get_layer_textures(
			this.stroke_data.layer_id
		);

		if (!layer_textures) {
			const all_layers = this.context.layer_manager.get_layers();
			const top_layer = all_layers[all_layers.length - 1];
			layer_textures = this.context.layer_manager.get_layer_textures(
				top_layer.id
			);
		}

		if (!layer_textures) return;

		// Create a temporary texture to render the stroke
		const temp_texture = RenderTexture.create({
			width: layer_textures.draw.width,
			height: layer_textures.draw.height,
			resolution: window.devicePixelRatio || 1
		});

		// Copy current layer content to temp texture
		const current_sprite = new Sprite(layer_textures.draw);
		const temp_container = new Container();
		temp_container.addChild(current_sprite);

		this.context.app.renderer.render(temp_container, {
			renderTexture: temp_texture
		});

		temp_container.destroy({ children: true });

		// Render the stroke from stored parameters
		this.render_stroke_from_data(this.stroke_data, temp_texture);

		// Copy result back to layer texture
		const final_sprite = new Sprite(temp_texture);
		const final_container = new Container();
		final_container.addChild(final_sprite);

		this.context.app.renderer.render(final_container, {
			renderTexture: layer_textures.draw
		});

		final_container.destroy({ children: true });
		temp_texture.destroy();
	}

	async undo(): Promise<void> {
		if (!this.original_texture) return;

		const layer_textures = this.context.layer_manager.get_layer_textures(
			this.stroke_data.layer_id
		);
		if (!layer_textures) return;

		const temp_sprite = new Sprite(this.original_texture);
		const temp_container = new Container();
		temp_container.addChild(temp_sprite);

		this.context.app.renderer.render(temp_container, {
			renderTexture: layer_textures.draw
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
	private is_new_stroke = true;

	private current_opacity = 1.0;

	private current_mode: "draw" | "erase" = "draw";

	private original_layer_texture: Texture | null = null;
	private active_layer_id: string | null = null;

	// New: Store stroke segments for parameter-based history
	private current_stroke_segments: BrushSegment[] = [];

	constructor(image_editor_context: ImageEditorContext, app: Application) {
		this.image_editor_context = image_editor_context;
		this.app = app;

		this.dimensions = {
			width: this.image_editor_context.image_container.width,
			height: this.image_editor_context.image_container.height
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
			height: local_bounds.height
		};

		this.stroke_texture = RenderTexture.create({
			width: this.dimensions.width,
			height: this.dimensions.height,
			resolution: window.devicePixelRatio || 1
		});

		this.erase_texture = RenderTexture.create({
			width: this.dimensions.width,
			height: this.dimensions.height,
			resolution: window.devicePixelRatio || 1
		});

		this.display_container = new Container();

		const active_layer =
			this.image_editor_context.layer_manager.get_active_layer();
		if (active_layer) {
			active_layer.addChild(this.display_container);
		} else {
			this.image_editor_context.image_container.addChild(
				this.display_container
			);
		}

		this.stroke_container = new Container();
		this.stroke_graphics = new Graphics();
		this.stroke_container.addChild(this.stroke_graphics);

		this.erase_graphics = new Graphics();

		this.preview_sprite = new Sprite(this.stroke_texture);
		this.preview_sprite.alpha = 0;
		this.display_container.addChild(this.preview_sprite);

		const clear_container = new Container();
		this.app.renderer.render(clear_container, {
			renderTexture: this.stroke_texture
		});
		this.app.renderer.render(clear_container, {
			renderTexture: this.erase_texture
		});
		clear_container.destroy();

		this.is_new_stroke = true;
		this.current_opacity = 1.0;
	}

	/**
	 * Reinitializes textures when needed (e.g., after resizing).
	 */
	reinitialize(): void {
		if (
			this.image_editor_context.image_container.width !==
				this.dimensions.width ||
			this.image_editor_context.image_container.height !==
				this.dimensions.height
		) {
			this.initialize_textures();
		}
	}

	/**
	 * Cleans up texture resources.
	 */
	cleanup_textures(): void {
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
			resolution: window.devicePixelRatio || 1
		});

		const temp_sprite = new Sprite(layer_textures.draw);
		const temp_container = new Container();
		temp_container.addChild(temp_sprite);

		this.app.renderer.render(temp_container, {
			renderTexture: this.original_layer_texture
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
			renderTexture: this.erase_texture
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

		// Create the stroke data with all segments
		const stroke_data: BrushStroke = {
			segments: [...this.current_stroke_segments],
			layer_id: this.active_layer_id
		};

		// Create the brush command with the original texture for undo
		const brush_command = new BrushCommand(
			this.image_editor_context,
			stroke_data,
			this.original_layer_texture
		);

		// Clean up the stroke graphics and texture
		if (this.stroke_graphics) {
			this.stroke_graphics.clear();
		}
		const clear_container = new Container();
		this.app.renderer.render(clear_container, {
			renderTexture: this.stroke_texture
		});
		clear_container.destroy();

		// Reset state for next stroke
		this.is_new_stroke = true;
		this.original_layer_texture = null;
		this.active_layer_id = null;
		this.current_stroke_segments = [];

		// Execute the command - this will apply the stroke using the proper logic
		this.image_editor_context.command_manager.execute(
			brush_command,
			this.image_editor_context
		);
	}

	/**
	 * Calculates the distance between two points.
	 */
	private calculate_distance(
		x1: number,
		y1: number,
		x2: number,
		y2: number
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
		mode: "draw" | "erase"
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

		this.current_mode = mode;
		this.current_opacity =
			mode === "draw" ? Math.min(Math.max(opacity, 0), 1) : 0.5;

		const scaled_size = size;

		if (this.is_new_stroke) {
			this.stroke_graphics.clear();
			// Clear the stroke segments array for new stroke
			this.current_stroke_segments = [];

			const clear_container = new Container();
			this.app.renderer.render(clear_container, {
				renderTexture: this.stroke_texture
			});
			clear_container.destroy();

			this.is_new_stroke = false;
		}

		// Store segment parameters for history
		this.current_stroke_segments.push({
			from_x,
			from_y,
			to_x,
			to_y,
			size: scaled_size,
			color,
			opacity: this.current_opacity,
			mode
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
				alpha: 1.0
			});
		} else {
			this.stroke_graphics.setFillStyle({
				color: 0xffffff,
				alpha: 1.0
			});
		}

		const distance = this.calculate_distance(from_x, from_y, to_x, to_y);

		if (distance < 0.1) {
			this.stroke_graphics.circle(from_x, from_y, scaled_size).fill();
		} else {
			const spacing = Math.max(scaled_size / 3, 2);
			const steps = Math.max(Math.ceil(distance / spacing), 2);

			for (let i = 0; i < steps; i++) {
				const t = i / (steps - 1);
				const x = from_x + (to_x - from_x) * t;
				const y = from_y + (to_y - from_y) * t;

				this.stroke_graphics.circle(x, y, scaled_size).fill();
			}
		}

		this.stroke_graphics.endFill();

		this.app.renderer.render(this.stroke_container, {
			renderTexture: this.stroke_texture
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
				resolution: window.devicePixelRatio || 1
			});

			const base_container = new Container();
			const content_sprite = new Sprite(layer_textures.draw);
			base_container.addChild(content_sprite);
			this.app.renderer.render(base_container, {
				renderTexture: preview_texture
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
				renderTexture: preview_texture
			});

			this.preview_sprite.texture = preview_texture;
			this.preview_sprite.alpha = 1.0;

			preview_container.destroy({ children: true });
			preview_texture.destroy();
		}

		this.preview_sprite.visible = true;
	}

	/**
	 * Gets current dimensions of the texture.
	 */
	get_dimensions(): { width: number; height: number } {
		return this.dimensions;
	}

	/**
	 * Cleanup all resources.
	 */
	cleanup(): void {
		this.cleanup_textures();
	}
}
