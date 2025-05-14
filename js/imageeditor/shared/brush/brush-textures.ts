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
export class BrushCommand implements Command {
	private layer_id: string;
	private original_texture: Texture;
	private final_texture: Texture;
	name: string;

	constructor(
		private context: ImageEditorContext,
		layer_id: string,
		original_texture: Texture,
		final_texture: Texture
	) {
		this.name = "Draw";
		this.layer_id = layer_id;

		this.original_texture = this.createTextureFrom(original_texture);
		this.final_texture = this.createTextureFrom(final_texture);
	}

	/**
	 * Creates a new texture with the same content as the source texture
	 */
	private createTextureFrom(source: Texture): Texture {
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

	async execute(): Promise<void> {
		const layer_textures = this.context.layer_manager.get_layer_textures(
			this.layer_id
		);
		if (!layer_textures) return;

		const temp_sprite = new Sprite(this.final_texture);
		const temp_container = new Container();
		temp_container.addChild(temp_sprite);

		this.context.app.renderer.render(temp_container, {
			renderTexture: layer_textures.draw
		});

		temp_container.destroy({ children: true });
	}

	async undo(): Promise<void> {
		const layer_textures = this.context.layer_manager.get_layer_textures(
			this.layer_id
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

	private is_new_stroke = true;

	private current_opacity = 1.0;

	private current_mode: "draw" | "erase" = "draw";

	private original_layer_texture: Texture | null = null;
	private active_layer_id: string | null = null;

	constructor(
		private image_editor_context: ImageEditorContext,
		private app: Application
	) {
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
		this.erase_graphics.beginFill(0xffffff, 1);
		this.erase_graphics.drawRect(
			0,
			0,
			this.dimensions.width,
			this.dimensions.height
		);
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

		const currentOpacity = this.current_opacity;

		if (this.current_mode === "draw") {
			const temp_container = new Container();

			const base_sprite = new Sprite(layer_textures.draw);
			temp_container.addChild(base_sprite);

			const stroke_sprite = new Sprite(this.stroke_texture);
			stroke_sprite.alpha = currentOpacity;
			temp_container.addChild(stroke_sprite);

			this.app.renderer.render(temp_container, {
				renderTexture: layer_textures.draw
			});

			temp_container.destroy({ children: true });
		} else {
			if (!this.stroke_texture) return;

			const erase_container = new Container();

			const content_sprite = new Sprite(layer_textures.draw);
			erase_container.addChild(content_sprite);

			const mask_sprite = new Sprite(this.stroke_texture);

			erase_container.setMask({ mask: mask_sprite, inverse: true });

			this.app.renderer.render(erase_container, {
				renderTexture: layer_textures.draw
			});

			erase_container.destroy({ children: true });
		}

		const final_texture = RenderTexture.create({
			width: this.dimensions.width,
			height: this.dimensions.height,
			resolution: window.devicePixelRatio || 1
		});

		const final_container = new Container();
		const final_sprite = new Sprite(layer_textures.draw);
		final_container.addChild(final_sprite);

		this.app.renderer.render(final_container, {
			renderTexture: final_texture
		});

		final_container.destroy({ children: true });

		const brush_command = new BrushCommand(
			this.image_editor_context,
			this.active_layer_id,
			this.original_layer_texture,
			final_texture
		);

		if (this.stroke_graphics) {
			this.stroke_graphics.clear();
		}
		const clear_container = new Container();
		this.app.renderer.render(clear_container, {
			renderTexture: this.stroke_texture
		});
		clear_container.destroy();

		this.is_new_stroke = true;

		final_texture.destroy();

		this.original_layer_texture = null;
		this.active_layer_id = null;

		this.image_editor_context.command_manager.execute(brush_command);
	}

	/**
	 * Calculates the distance between two points.
	 */
	private calculateDistance(
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

			const clear_container = new Container();
			this.app.renderer.render(clear_container, {
				renderTexture: this.stroke_texture
			});
			clear_container.destroy();

			this.is_new_stroke = false;
		}

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

		const distance = this.calculateDistance(from_x, from_y, to_x, to_y);

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
