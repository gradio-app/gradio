import {
	Container,
	RenderTexture,
	Sprite,
	Graphics,
	Application
} from "pixi.js";
import { type ImageEditorContext } from "../core/editor";

/**
 * Class to handle texture operations for the brush tool.
 * Simplified to work directly with layer textures.
 */
export class BrushTextures {
	// Only keep what we need
	private stroke_texture: RenderTexture | null = null;
	private erase_texture: RenderTexture | null = null;
	private display_container: Container | null = null;
	private stroke_container: Container | null = null;
	private stroke_graphics: Graphics | null = null;
	private preview_sprite: Sprite | null = null;
	private erase_graphics: Graphics | null = null;
	private dimensions: { width: number; height: number };

	// Track if a new stroke is starting
	private is_new_stroke = true;

	// Track the current drawing opacity
	private current_opacity = 1.0;

	// Track current drawing mode
	private current_mode: "draw" | "erase" = "draw";

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
		// Clean up any existing resources
		this.cleanup_textures();

		// Get dimensions from the image container
		const local_bounds =
			this.image_editor_context.image_container.getLocalBounds();

		this.dimensions = {
			width: local_bounds.width,
			height: local_bounds.height
		};

		// Create a texture for the current stroke preview
		this.stroke_texture = RenderTexture.create({
			width: this.dimensions.width,
			height: this.dimensions.height,
			resolution: window.devicePixelRatio || 1
		});

		// Create a texture for erasing
		this.erase_texture = RenderTexture.create({
			width: this.dimensions.width,
			height: this.dimensions.height,
			resolution: window.devicePixelRatio || 1
		});

		// Create a container to display preview
		this.display_container = new Container();

		// Get the active layer and add the display container to it
		const active_layer =
			this.image_editor_context.layer_manager.get_active_layer();
		if (active_layer) {
			active_layer.addChild(this.display_container);
		} else {
			this.image_editor_context.image_container.addChild(
				this.display_container
			);
		}

		// Create container for the stroke graphics
		this.stroke_container = new Container();
		this.stroke_graphics = new Graphics();
		this.stroke_container.addChild(this.stroke_graphics);

		// Create graphics for eraser mask
		this.erase_graphics = new Graphics();

		// Create a sprite for the preview of the current stroke
		this.preview_sprite = new Sprite(this.stroke_texture);
		// Start with the preview sprite invisible
		this.preview_sprite.alpha = 0;
		this.display_container.addChild(this.preview_sprite);

		// Clear the stroke texture
		const clear_container = new Container();
		this.app.renderer.render(clear_container, {
			renderTexture: this.stroke_texture
		});
		this.app.renderer.render(clear_container, {
			renderTexture: this.erase_texture
		});
		clear_container.destroy();

		// Reset drawing state
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
		// Clean up stroke texture
		if (this.stroke_texture) {
			this.stroke_texture.destroy();
			this.stroke_texture = null;
		}

		// Clean up erase texture
		if (this.erase_texture) {
			this.erase_texture.destroy();
			this.erase_texture = null;
		}

		// Clean up display container
		if (this.display_container) {
			if (this.display_container.parent) {
				this.display_container.parent.removeChild(this.display_container);
			}
			this.display_container.destroy({ children: true });
			this.display_container = null;
		}

		// Nullify other references
		this.stroke_container = null;
		this.stroke_graphics = null;
		this.preview_sprite = null;
		this.erase_graphics = null;
	}

	/**
	 * Preserve the canvas state when starting a new stroke.
	 */
	preserve_canvas_state(): void {
		// Reset for a new stroke
		this.is_new_stroke = true;
	}

	/**
	 * Resets the eraser mask.
	 */
	reset_eraser_mask(): void {
		if (!this.erase_graphics || !this.erase_texture) return;

		// Clear and reset the eraser graphics
		this.erase_graphics.clear();
		this.erase_graphics.beginFill(0xffffff, 1);
		this.erase_graphics.drawRect(
			0,
			0,
			this.dimensions.width,
			this.dimensions.height
		);
		this.erase_graphics.endFill();

		// Render the eraser graphics to the erase texture
		this.app.renderer.render(this.erase_graphics, {
			renderTexture: this.erase_texture
		});
	}

	/**
	 * Commits the current stroke to the active layer.
	 */
	commit_stroke(): void {
		if (!this.stroke_texture || !this.preview_sprite || !this.stroke_graphics)
			return;

		// Hide the preview sprite
		this.preview_sprite.visible = false;

		// Get the active layer's texture
		const active_layer =
			this.image_editor_context.layer_manager.get_active_layer();

		if (!active_layer) return;

		// Get all layers to find the ID of the active layer
		const layers = this.image_editor_context.layer_manager.get_layers();
		const layer = layers.find((l) => l.container === active_layer);
		if (!layer) return;

		// Get the active layer's draw texture
		const layer_textures =
			this.image_editor_context.layer_manager.get_layer_textures(layer.id);
		if (!layer_textures) return;

		// Save the current opacity for use in committing
		const currentOpacity = this.current_opacity;

		// Handle drawing or erasing
		if (this.current_mode === "draw") {
			// Drawing mode - simple composition
			const temp_container = new Container();

			// Add current layer texture as base
			const base_sprite = new Sprite(layer_textures.draw);
			temp_container.addChild(base_sprite);

			// Add the current stroke with proper opacity
			const stroke_sprite = new Sprite(this.stroke_texture);
			stroke_sprite.alpha = currentOpacity;
			temp_container.addChild(stroke_sprite);

			// Render the composited result directly to the layer texture
			this.app.renderer.render(temp_container, {
				renderTexture: layer_textures.draw
			});

			// Clean up
			temp_container.destroy({ children: true });
		} else {
			// Erasing mode - use proper masking with setMask
			if (!this.stroke_texture) return;

			// Create a container for the erase operation
			const erase_container = new Container();

			// Add the current layer content
			const content_sprite = new Sprite(layer_textures.draw);
			erase_container.addChild(content_sprite);

			// Create the mask sprite from our stroke texture
			const mask_sprite = new Sprite(this.stroke_texture);

			// Apply the mask to the container using setMask with inverse: true
			// This will only show content where the mask is NOT (inverse: true)
			erase_container.setMask({ mask: mask_sprite, inverse: true });

			// Render the masked content back to layer texture
			this.app.renderer.render(erase_container, {
				renderTexture: layer_textures.draw
			});

			// Clean up
			erase_container.destroy({ children: true });
		}

		// Clear the stroke graphics and texture for the next stroke
		if (this.stroke_graphics) {
			this.stroke_graphics.clear();
		}
		const clear_container = new Container();
		this.app.renderer.render(clear_container, {
			renderTexture: this.stroke_texture
		});
		clear_container.destroy();

		// Reset state for the next stroke
		this.is_new_stroke = true;
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

		// Store the current mode and opacity
		this.current_mode = mode;
		this.current_opacity =
			mode === "draw" ? Math.min(Math.max(opacity, 0), 1) : 0.5;

		// Apply scale to brush size for consistent rendering
		const scaled_size = size;

		// For new strokes, clear the graphics and texture completely
		if (this.is_new_stroke) {
			// Clean up for a new stroke
			this.stroke_graphics.clear();

			// Clear the stroke texture
			const clear_container = new Container();
			this.app.renderer.render(clear_container, {
				renderTexture: this.stroke_texture
			});
			clear_container.destroy();

			this.is_new_stroke = false;
		}

		// Set fill color and opacity for drawing
		if (mode === "draw") {
			// For drawing, use the specified color, but always full opacity in the graphics
			// We need to convert the color string to a number
			let colorValue = 0xffffff; // Default to white
			try {
				if (color.startsWith("#")) {
					colorValue = parseInt(color.replace("#", "0x"), 16);
				}
			} catch (e) {
				// Default to white if there's an error
				colorValue = 0xffffff;
			}
			this.stroke_graphics.setFillStyle({
				color: colorValue,
				alpha: 1.0
			});
		} else {
			// For erasing, always use white
			this.stroke_graphics.setFillStyle({
				color: 0xffffff,
				alpha: 1.0
			});
		}

		// Calculate the distance between the points
		const distance = this.calculateDistance(from_x, from_y, to_x, to_y);

		// If the points are the same, just draw a single circle
		if (distance < 0.1) {
			// Draw a circle at the point - use scaled_size as RADIUS
			this.stroke_graphics.circle(from_x, from_y, scaled_size).fill();
		} else {
			// Calculate how many circles to draw along the path
			// Adaptive spacing that balances quality and performance
			const spacing = Math.max(scaled_size / 3, 2);
			const steps = Math.max(Math.ceil(distance / spacing), 2);

			// Draw a circle at each point along the path
			for (let i = 0; i < steps; i++) {
				const t = i / (steps - 1);
				const x = from_x + (to_x - from_x) * t;
				const y = from_y + (to_y - from_y) * t;

				// Create a circle at this point - use scaled_size as RADIUS
				this.stroke_graphics.circle(x, y, scaled_size).fill();
			}
		}

		// End the fill after all circles are drawn
		this.stroke_graphics.endFill();

		// Render the stroke to the texture
		this.app.renderer.render(this.stroke_container, {
			renderTexture: this.stroke_texture
		});

		// Update the preview based on mode
		if (mode === "draw") {
			// For drawing, show the stroke directly with proper opacity
			this.preview_sprite.texture = this.stroke_texture;
			this.preview_sprite.alpha = this.current_opacity;

			// Set tint to white (no tint) instead of trying to tint the texture
			this.preview_sprite.tint = 0xffffff;
		} else {
			// For erasing, create a preview that shows what will be erased

			// Get the active layer's texture for preview
			const active_layer =
				this.image_editor_context.layer_manager.get_active_layer();
			if (!active_layer) return;

			const layers = this.image_editor_context.layer_manager.get_layers();
			const layer = layers.find((l) => l.container === active_layer);
			if (!layer) return;

			const layer_textures =
				this.image_editor_context.layer_manager.get_layer_textures(layer.id);
			if (!layer_textures) return;

			// Create a temporary texture for the preview
			const preview_texture = RenderTexture.create({
				width: this.dimensions.width,
				height: this.dimensions.height,
				resolution: window.devicePixelRatio || 1
			});

			// First, create a copy of the current layer content
			const base_container = new Container();
			const content_sprite = new Sprite(layer_textures.draw);
			base_container.addChild(content_sprite);
			this.app.renderer.render(base_container, {
				renderTexture: preview_texture
			});
			base_container.destroy({ children: true });

			// Create a container for the eraser preview with red overlay
			const preview_container = new Container();

			// Add our current stroke as the content
			const mask_sprite = new Sprite(this.stroke_texture);

			// Add a red overlay to show what's being erased
			const overlay = new Graphics();
			overlay.setFillStyle({ color: 0xffffff, alpha: 0.5 });
			overlay.rect(0, 0, this.dimensions.width, this.dimensions.height).fill();

			// Use setMask with inverse: false to only show overlay where the stroke is
			// We want to show the red overlay ONLY where the stroke will erase
			overlay.setMask({ mask: mask_sprite, inverse: false });

			preview_container.addChild(overlay);

			// Render the overlay on top of the base content
			this.app.renderer.render(preview_container, {
				renderTexture: preview_texture
			});

			// Update the preview sprite with our preview texture
			this.preview_sprite.texture = preview_texture;
			this.preview_sprite.alpha = 1.0;

			// Clean up
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
