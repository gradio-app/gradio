import {
	Container,
	Graphics,
	Sprite,
	type FederatedPointerEvent
} from "pixi.js";
import { type ImageEditorContext } from "../core/editor";
import { type BrushState } from "./types";
import tinycolor from "tinycolor2";
import { clear_timeout } from "./brush-utils";

/**
 * Class to handle all cursor preview-related functionality for the brush tool.
 */
export class BrushCursor {
	private cursor_graphics: Graphics | null = null;
	private cursor_container: Container | null = null;
	private brush_preview_container: Container | null = null;
	private brush_preview_graphics: Graphics | null = null;
	private is_preview_visible = false;
	private is_cursor_over_image = false;
	private cursor_position_check_timeout: number | null = null;
	private is_brush_or_erase_active = false;

	private _bound_update_cursor:
		| ((event: FederatedPointerEvent) => void)
		| null = null;
	private _bound_check_cursor_over_image:
		| ((event: FederatedPointerEvent) => void)
		| null = null;

	constructor(
		private image_editor_context: ImageEditorContext,
		private state: BrushState,
		private scale: number
	) {
		this.initialize_cursor();
		this.initialize_brush_preview();
	}

	/**
	 * Returns whether the cursor is currently over the image.
	 */
	is_over_image(): boolean {
		return this.is_cursor_over_image;
	}

	/**
	 * Sets up cursor-related event listeners.
	 */
	setup_event_listeners(): void {
		this.cleanup_event_listeners();

		this._bound_update_cursor = this.update_cursor_position.bind(this);
		this._bound_check_cursor_over_image =
			this.check_cursor_over_image.bind(this);

		const stage = this.image_editor_context.app.stage;
		stage.on("pointermove", this._bound_update_cursor);
		stage.on("pointermove", this._bound_check_cursor_over_image);

		this.image_editor_context.image_container.on(
			"pointerenter",
			this.on_image_container_pointer_enter.bind(this)
		);
		this.image_editor_context.image_container.on(
			"pointerleave",
			this.on_image_container_pointer_leave.bind(this)
		);
	}

	/**
	 * Removes all cursor-related event listeners.
	 */
	cleanup_event_listeners(): void {
		const stage = this.image_editor_context.app.stage;

		if (this._bound_update_cursor) {
			stage.off("pointermove", this._bound_update_cursor);
			this._bound_update_cursor = null;
		}

		if (this._bound_check_cursor_over_image) {
			stage.off("pointermove", this._bound_check_cursor_over_image);
			this._bound_check_cursor_over_image = null;
		}

		this.image_editor_context.image_container.off("pointerenter");
		this.image_editor_context.image_container.off("pointerleave");

		this.cursor_position_check_timeout = clear_timeout(
			this.cursor_position_check_timeout
		);
	}

	/**
	 * initializes the cursor for the brush tool.
	 */
	initialize_cursor(): void {
		if (this.cursor_container) {
			if (this.cursor_container.parent) {
				this.cursor_container.parent.removeChild(this.cursor_container);
			}
			this.cursor_container.destroy({ children: true });
			this.cursor_container = null;
		}

		this.cursor_container = new Container();
		this.image_editor_context.ui_container.addChild(this.cursor_container);

		this.cursor_graphics = new Graphics();
		this.cursor_container.addChild(this.cursor_graphics);

		this.update_cursor_appearance();
	}

	/**
	 * updates the appearance of the cursor.
	 */
	update_cursor_appearance(): void {
		if (!this.cursor_graphics) return;

		this.cursor_graphics.clear();

		const cursor_color =
			this.state.mode === "draw"
				? tinycolor(this.state.color).toString()
				: 0xffffff;

		this.cursor_graphics
			.circle(0, 0, this.state.brush_size * this.scale)
			.stroke({
				width: 1.5,
				color: cursor_color,
				alpha: 0.8
			});

		this.cursor_graphics.circle(0, 0, 1).fill({
			color: cursor_color,
			alpha: 0.8
		});
	}

	/**
	 * updates the position of the cursor.
	 * @param {FederatedPointerEvent} event - The pointer event.
	 */
	update_cursor_position(event: FederatedPointerEvent): void {
		if (!this.cursor_container) return;

		const local_pos = this.image_editor_context.image_container.toLocal(
			event.global
		);

		const ui_pos = this.image_editor_context.ui_container.toLocal(
			this.image_editor_context.image_container.toGlobal(local_pos)
		);

		this.cursor_container.position.set(ui_pos.x, ui_pos.y);
	}

	/**
	 * checks if the cursor is over the image container.
	 * @param {FederatedPointerEvent} event - The pointer event.
	 */
	check_cursor_over_image(event: FederatedPointerEvent): void {
		if (this.cursor_position_check_timeout !== null) {
			window.clearTimeout(this.cursor_position_check_timeout);
			this.cursor_position_check_timeout = null;
		}

		const image_container = this.image_editor_context.image_container;
		const bounds = image_container.getBounds();

		const was_over_image = this.is_cursor_over_image;
		this.is_cursor_over_image =
			event.global.x >= bounds.x &&
			event.global.x <= bounds.x + bounds.width &&
			event.global.y >= bounds.y &&
			event.global.y <= bounds.y + bounds.height;

		if (was_over_image !== this.is_cursor_over_image) {
			this.update_cursor_and_preview_visibility();
		}
	}

	/**
	 * updates the size of the cursor.
	 */
	update_cursor_size(): void {
		this.update_cursor_appearance();
	}

	/**
	 * Updates whether brush or erase tool is active
	 */
	set_active(is_active: boolean): void {
		this.is_brush_or_erase_active = is_active;
		this.update_cursor_and_preview_visibility();
	}

	/**
	 * updates the visibility of the cursor.
	 */
	update_cursor_visibility(): void {
		if (this.cursor_container) {
			this.cursor_container.visible =
				this.is_cursor_over_image && this.is_brush_or_erase_active;
		}
	}

	/**
	 * Shows or hides the brush preview.
	 * @param {boolean} show - Whether to show the preview.
	 */
	preview_brush(show: boolean): void {
		this.is_preview_visible = show;

		if (this.brush_preview_container) {
			this.brush_preview_container.visible =
				show && this.is_brush_or_erase_active;
		}

		if (show) {
			this.update_brush_preview();
			this.update_brush_preview_position();
		}
	}

	/**
	 * initializes the brush preview.
	 */
	initialize_brush_preview(): void {
		if (this.brush_preview_container) {
			if (this.brush_preview_container.parent) {
				this.brush_preview_container.parent.removeChild(
					this.brush_preview_container
				);
			}
			this.brush_preview_container.destroy({ children: true });
			this.brush_preview_container = null;
		}

		this.brush_preview_container = new Container();
		this.image_editor_context.ui_container.addChild(
			this.brush_preview_container
		);

		this.brush_preview_graphics = new Graphics();
		this.brush_preview_container.addChild(this.brush_preview_graphics);

		this.brush_preview_container.visible = false;
	}

	/**
	 * updates the brush preview appearance.
	 */
	update_brush_preview(): void {
		if (!this.brush_preview_graphics) return;

		this.brush_preview_graphics.clear();

		const preview_size = this.state.brush_size * this.scale;
		const preview_color =
			this.state.mode === "draw"
				? tinycolor(this.state.color).setAlpha(this.state.opacity).toString()
				: 0xffffff;

		this.brush_preview_graphics.circle(0, 0, preview_size).fill({
			color: preview_color,
			alpha: this.state.mode === "draw" ? this.state.opacity : 0.3
		});

		this.brush_preview_graphics.circle(0, 0, preview_size + 1).stroke({
			width: 1,
			color: 0x000000,
			alpha: 0.5
		});
	}

	/**
	 * updates the position of the brush preview to center of canvas.
	 */
	update_brush_preview_position(): void {
		if (!this.brush_preview_container) return;

		const image_container = this.image_editor_context.image_container;
		const center_x = image_container.width / 2;
		const center_y = image_container.height / 2;

		const global_pos = image_container.toGlobal({ x: center_x, y: center_y });

		const ui_pos = this.image_editor_context.ui_container.toLocal(global_pos);

		this.brush_preview_container.position.set(ui_pos.x, ui_pos.y);
	}

	/**
	 * Called when the pointer enters the image container.
	 */
	on_image_container_pointer_enter(): void {
		this.is_cursor_over_image = true;
		this.update_cursor_and_preview_visibility();
	}

	/**
	 * Called when the pointer leaves the image container.
	 */
	on_image_container_pointer_leave(): void {
		this.is_cursor_over_image = false;
		this.update_cursor_and_preview_visibility();
	}

	/**
	 * Updates both cursor and preview visibility based on cursor position.
	 */
	update_cursor_and_preview_visibility(): void {
		this.update_cursor_visibility();
		if (this.brush_preview_container) {
			this.brush_preview_container.visible =
				this.is_preview_visible && this.is_brush_or_erase_active;
		}
	}

	/**
	 * Cleans up all cursor resources.
	 */
	cleanup(): void {
		this.is_brush_or_erase_active = false;

		if (this.cursor_container) {
			if (this.cursor_container.parent) {
				this.cursor_container.parent.removeChild(this.cursor_container);
			}
			this.cursor_container.destroy({ children: true });
			this.cursor_container = null;
		}

		if (this.brush_preview_container) {
			if (this.brush_preview_container.parent) {
				this.brush_preview_container.parent.removeChild(
					this.brush_preview_container
				);
			}
			this.brush_preview_container.destroy({ children: true });
			this.brush_preview_container = null;
		}

		if (this.cursor_position_check_timeout !== null) {
			window.clearTimeout(this.cursor_position_check_timeout);
			this.cursor_position_check_timeout = null;
		}
	}

	/**
	 * Updates the brush state.
	 */
	update_state(state: BrushState, scale: number): void {
		this.state = state;
		this.scale = scale;
		this.update_cursor_appearance();
		if (this.is_preview_visible) {
			this.update_brush_preview();
		}
	}
}
