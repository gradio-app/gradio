import { Container, type FederatedPointerEvent } from "pixi.js";
import { type ImageEditorContext, type Tool } from "../core/editor";
import { type Tool as ToolbarTool, type Subtool } from "../Toolbar.svelte";
import type { ColorInput } from "tinycolor2";
import tinycolor from "tinycolor2";
import { BrushCursor } from "./brush-cursor";
import { BrushTextures } from "./brush-textures";
import { recurse_set_cursor } from "./brush-utils";
import { type BrushState } from "./types";

/**
 * BrushTool class implements the Tool interface for drawing and erasing.
 * @class
 * @implements {Tool}
 */
export class BrushTool implements Tool {
	/**
	 * The name of the tool.
	 * @type {string}
	 */
	name = "brush" as const;

	/**
	 * The context of the image editor.
	 * @private
	 */
	private image_editor_context!: ImageEditorContext;

	/**
	 * The current tool selected in the toolbar.
	 * @private
	 */
	private current_tool!: ToolbarTool;

	/**
	 * The current subtool selected in the toolbar.
	 * @private
	 */
	private current_subtool!: Subtool;

	/**
	 * The state of the brush tool.
	 * @private
	 */
	private state: BrushState = {
		opacity: 1,
		brush_size: 10,
		color: "#000000",
		mode: "draw"
	};

	/**
	 * Size settings for brush and eraser
	 * @private
	 */
	private brush_size = 10;
	private eraser_size = 20;

	/**
	 * Drawing state
	 * @private
	 */
	private is_drawing = false;
	private last_x = 0;
	private last_y = 0;
	private scale = 1;

	/**
	 * Event listeners
	 * @private
	 */
	private _bound_pointer_down: ((event: FederatedPointerEvent) => void) | null =
		null;
	private _bound_pointer_move: ((event: FederatedPointerEvent) => void) | null =
		null;
	private _bound_pointer_up: (() => void) | null = null;
	private event_callbacks: Map<string, (() => void)[]> = new Map();
	/**
	 * Utility modules
	 * @private
	 */
	private brush_cursor: BrushCursor | null = null;
	private brush_textures: BrushTextures | null = null;

	/**
	 * Sets up the brush tool with the given context, tool, and subtool.
	 * @param {ImageEditorContext} context - The image editor context.
	 * @param {ToolbarTool} tool - The tool from the toolbar.
	 * @param {Subtool} subtool - The subtool from the toolbar.
	 * @returns {Promise<void>}
	 */
	async setup(
		context: ImageEditorContext,
		tool: ToolbarTool,
		subtool: Subtool
	): Promise<void> {
		// Store context and tool information
		this.image_editor_context = context;
		this.current_tool = tool;
		this.current_subtool = subtool;

		// Set mode based on tool
		this.state.mode = tool === "erase" ? "erase" : "draw";

		// Set size based on mode
		if (this.state.mode === "draw") {
			this.state.brush_size = this.brush_size;
		} else {
			this.state.brush_size = this.eraser_size;
		}

		// Subscribe to scale changes
		context.scale.subscribe((scale) => {
			this.scale = scale;
			if (this.brush_cursor) {
				this.brush_cursor.update_state(this.state, this.scale);
			}
		});

		// Initialize brush cursor
		this.brush_cursor = new BrushCursor(
			this.image_editor_context,
			this.state,
			this.scale
		);

		// Set initial active state
		this.brush_cursor.set_active(tool === "draw" || tool === "erase");

		// Initialize brush textures
		this.brush_textures = new BrushTextures(
			this.image_editor_context,
			context.app
		);
		this.brush_textures.initialize_textures();

		// Set up event listeners
		this.setup_event_listeners();

		// Set cursor style for image container
		this.handle_cursors(tool);
	}

	/**
	 * Handles cursor styles for the brush tool.
	 * @param {ToolbarTool} tool - The current tool.
	 * @private
	 */
	private handle_cursors(tool: ToolbarTool): void {
		// Set cursor style to 'none' for all children of the image container
		recurse_set_cursor(
			this.image_editor_context.image_container.children as Container[],
			"none"
		);
	}

	/**
	 * Sets the current tool and subtool.
	 * @param {ToolbarTool} tool - The current tool.
	 * @param {Subtool} subtool - The current subtool.
	 */
	set_tool(tool: ToolbarTool, subtool: Subtool): void {
		// Update current tool and subtool
		this.current_tool = tool;
		this.current_subtool = subtool;

		if (this.current_tool !== "erase" && this.current_tool !== "draw") {
			this.commit_pending_changes();
		}

		// Commit any pending changes

		// Set brush cursor active state
		if (this.brush_cursor) {
			this.brush_cursor.set_active(tool === "draw" || tool === "erase");
		}

		// Update mode based on tool
		const new_mode = tool === "erase" ? "erase" : "draw";
		if (tool === "erase" || tool === "draw") {
			this.brush_textures?.initialize_textures();
		}
		if (this.state.mode !== new_mode) {
			this.state.mode = new_mode;

			// Update brush size based on mode
			if (this.state.mode === "draw") {
				this.state.brush_size = this.brush_size;
			} else {
				this.state.brush_size = this.eraser_size;
			}

			// Update cursor
			if (this.brush_cursor) {
				this.brush_cursor.update_state(this.state, this.scale);
			}
		}
	}

	/**
	 * Commits any pending changes to the canvas.
	 * @private
	 */
	private commit_pending_changes(): void {
		if (this.is_drawing) {
			this.on_pointer_up();
		}
	}

	/**
	 * Called when the user presses the mouse button.
	 * @param {FederatedPointerEvent} event - The pointer event.
	 * @private
	 */
	private on_pointer_down(event: FederatedPointerEvent): void {
		// Don't draw if not over image
		if (this.current_tool !== "erase" && this.current_tool !== "draw") {
			return;
		}

		if (this.brush_cursor && !this.brush_cursor.is_over_image()) return;

		// Preserve the current canvas state
		if (this.brush_textures) {
			this.brush_textures.preserve_canvas_state();
		}

		// Get the local position
		const local_pos = this.image_editor_context.image_container.toLocal(
			event.global
		);

		// Start drawing
		this.is_drawing = true;
		this.last_x = local_pos.x;
		this.last_y = local_pos.y;

		// Draw a single point
		if (this.brush_textures) {
			this.brush_textures.draw_segment(
				local_pos.x,
				local_pos.y,
				local_pos.x,
				local_pos.y,
				this.state.brush_size,
				this.state.color,
				this.state.opacity,
				this.state.mode
			);
		}
	}

	/**
	 * Called when the user moves the mouse while drawing.
	 * @param {FederatedPointerEvent} event - The pointer event.
	 * @private
	 */
	private on_pointer_move(event: FederatedPointerEvent): void {
		// Update cursor position
		if (this.brush_cursor) {
			this.brush_cursor.update_cursor_position(event);
		}

		// If not drawing, exit
		if (!this.is_drawing) return;

		// Get the local position
		const local_pos = this.image_editor_context.image_container.toLocal(
			event.global
		);

		// Draw line from last position to current position
		if (this.brush_textures) {
			this.brush_textures.draw_segment(
				this.last_x,
				this.last_y,
				local_pos.x,
				local_pos.y,
				this.state.brush_size,
				this.state.color,
				this.state.opacity,
				this.state.mode
			);
		}

		// Update last position
		this.last_x = local_pos.x;
		this.last_y = local_pos.y;
	}

	/**
	 * Called when the user releases the mouse button.
	 * @private
	 */
	private on_pointer_up(): void {
		// If not drawing, exit
		if (!this.is_drawing) return;

		// Stop drawing
		this.is_drawing = false;

		// Commit the stroke
		if (this.brush_textures) {
			this.brush_textures.commit_stroke();
		}

		this.notify("change");
	}

	/**
	 * Sets up event listeners for drawing.
	 * @private
	 */
	private setup_event_listeners(): void {
		// Remove existing listeners if they exist
		this.cleanup_event_listeners();

		// Create bound event handlers
		this._bound_pointer_down = this.on_pointer_down.bind(this);
		this._bound_pointer_move = this.on_pointer_move.bind(this);
		this._bound_pointer_up = this.on_pointer_up.bind(this);

		// Set interactive mode for image container
		const image_container = this.image_editor_context.image_container;
		image_container.eventMode = "static";
		image_container.interactiveChildren = true;

		// Setup for stage
		const stage = this.image_editor_context.app.stage;
		stage.eventMode = "static";

		// Add pointer events to the stage for global tracking
		stage.on("pointerdown", this._bound_pointer_down);
		stage.on("pointermove", this._bound_pointer_move);
		stage.on("pointerup", this._bound_pointer_up);
		stage.on("pointerupoutside", this._bound_pointer_up);

		// Set up cursor event listeners
		if (this.brush_cursor) {
			this.brush_cursor.setup_event_listeners();
		}
	}

	/**
	 * Cleans up event listeners.
	 * @private
	 */
	private cleanup_event_listeners(): void {
		const stage = this.image_editor_context.app.stage;

		// Remove event listeners if they exist
		if (this._bound_pointer_down) {
			stage.off("pointerdown", this._bound_pointer_down);
			this._bound_pointer_down = null;
		}

		if (this._bound_pointer_move) {
			stage.off("pointermove", this._bound_pointer_move);
			this._bound_pointer_move = null;
		}

		if (this._bound_pointer_up) {
			stage.off("pointerup", this._bound_pointer_up);
			stage.off("pointerupoutside", this._bound_pointer_up);
			this._bound_pointer_up = null;
		}

		// Clean up cursor event listeners
		if (this.brush_cursor) {
			this.brush_cursor.cleanup_event_listeners();
		}
	}

	/**
	 * Sets the brush size.
	 * @param {number} size - The new brush size.
	 */
	set_brush_size(size: number): void {
		// Set brush size
		this.brush_size = size;

		// Update state if in draw mode
		if (this.state.mode === "draw") {
			this.state.brush_size = size;

			// Update cursor
			if (this.brush_cursor) {
				this.brush_cursor.update_state(this.state, this.scale);
			}
		}
	}

	/**
	 * Sets the brush color.
	 * @param {string|ColorInput} color - The new brush color.
	 */
	set_brush_color(color: string | ColorInput): void {
		// Convert to hex string
		const color_string = tinycolor(color).toHexString();

		// Set color
		this.state.color = color_string;

		// Update cursor
		if (this.brush_cursor) {
			this.brush_cursor.update_state(this.state, this.scale);
		}
	}

	/**
	 * Sets the brush opacity.
	 * @param {number} opacity - The new brush opacity.
	 */
	set_brush_opacity(opacity: number): void {
		// Clamp opacity between 0 and 1
		const clamped_opacity = Math.max(0, Math.min(1, opacity));

		// Set opacity
		this.state.opacity = clamped_opacity;

		// Update cursor
		if (this.brush_cursor) {
			this.brush_cursor.update_state(this.state, this.scale);
		}
	}

	/**
	 * Sets the eraser size.
	 * @param {number} size - The new eraser size.
	 */
	set_eraser_size(size: number): void {
		// Store the new eraser size
		this.eraser_size = size;

		// Update state if in erase mode
		if (this.state.mode === "erase") {
			this.state.brush_size = size;

			// Update cursor
			if (this.brush_cursor) {
				this.brush_cursor.update_state(this.state, this.scale);
			}
		}
	}

	/**
	 * Gets the current size based on mode (brush or eraser).
	 * @returns {number} The current size.
	 */
	get_current_size(): number {
		return this.state.mode === "draw" ? this.brush_size : this.eraser_size;
	}

	/**
	 * Shows or hides the brush preview.
	 * @param {boolean} show - Whether to show the preview.
	 */
	preview_brush(show: boolean): void {
		if (this.brush_cursor) {
			this.brush_cursor.preview_brush(show);
		}
	}

	/**
	 * Cleans up resources used by the brush tool.
	 */
	cleanup(): void {
		// Commit any pending changes
		this.commit_pending_changes();

		// Clean up event listeners
		this.cleanup_event_listeners();

		// Clean up brush textures
		if (this.brush_textures) {
			this.brush_textures.cleanup();
			this.brush_textures = null;
		}

		// Clean up brush cursor
		if (this.brush_cursor) {
			this.brush_cursor.cleanup();
			this.brush_cursor = null;
		}
	}

	on<T extends string>(event: T, callback: () => void): void {
		this.event_callbacks.set(event, [
			...(this.event_callbacks.get(event) || []),
			callback
		]);
	}

	off<T extends string>(event: T, callback: () => void): void {
		this.event_callbacks.set(
			event,
			this.event_callbacks.get(event)?.filter((cb) => cb !== callback) || []
		);
	}

	private notify<T extends string>(event: T): void {
		for (const callback of this.event_callbacks.get(event) || []) {
			callback();
		}
	}
}
