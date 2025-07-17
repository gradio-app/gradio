import {
	Point,
	type FederatedWheelEvent,
	type FederatedPointerEvent
} from "pixi.js";
import { type ImageEditorContext, type Tool } from "../core/editor";
import { type Tool as ToolbarTool, type Subtool } from "../Toolbar.svelte";
import { get, writable } from "svelte/store";

/**
 * ZoomTool class for handling zoom and pan functionality in the image editor
 * Implements the Tool interface
 */
export class ZoomTool implements Tool {
	name = "zoom";
	min_zoom = writable(true);

	private image_editor_context!: ImageEditorContext;

	private readonly max_zoom = 10;
	private readonly border_padding = 30;

	private pad_bottom = 0;
	private is_pinching = false;
	private is_dragging = false;
	private is_pointer_dragging = false;
	private last_touch_position: Point | null = null;
	private last_pinch_distance = 0;
	private drag_start = new Point();
	private current_tool!: ToolbarTool;
	private current_subtool!: Subtool;
	private local_scale = 1;
	private local_dimensions: { width: number; height: number } = {
		width: 0,
		height: 0
	};
	private local_position: { x: number; y: number } = { x: 0, y: 0 };

	/**
	 * Prevents default behavior for events
	 * @param {FederatedWheelEvent | FederatedPointerEvent} event - The event to prevent default behavior for
	 */
	prevent_default(
		event: FederatedWheelEvent | FederatedPointerEvent | WheelEvent
	): void {
		event.preventDefault();
		event.stopPropagation();
	}

	/**
	 * Sets the current tool and subtool
	 * @param {ToolbarTool} tool - The tool to set
	 * @param {Subtool} subtool - The subtool to set
	 */
	set_tool(tool: ToolbarTool, subtool: Subtool): void {
		this.current_tool = tool;
		this.current_subtool = subtool;
	}

	/**
	 * Sets the zoom level to a specific percentage or fits the image to the screen
	 * @param {number | 'fit'} zoom_level - The zoom level to set (0-1) or 'fit' to use min_zoom
	 * @returns {void}
	 */
	set_zoom(zoom_level: number | "fit"): void {
		const fit_zoom = this.calculate_min_zoom(
			this.local_dimensions.width,
			this.local_dimensions.height
		);

		let target_zoom: number;
		const is_fit_zoom = zoom_level === "fit";
		if (is_fit_zoom) {
			target_zoom = fit_zoom;
		} else {
			target_zoom = Math.max(0, Math.min(this.max_zoom, zoom_level));
		}

		const canvas = this.image_editor_context.app.screen;
		const canvas_width = canvas.width;
		const canvas_height = canvas.height;

		let center_point: { x: number; y: number };

		center_point = {
			x: canvas_width / 2,
			y: canvas_height / 2
		};

		this.zoom_to_point(target_zoom, center_point, true, is_fit_zoom);
	}

	/**
	 * Sets up the zoom tool with the given context and state
	 * @param {ImageEditorContext} context - The image editor context
	 * @param {ToolbarTool} tool - The current tool
	 * @param {Subtool} subtool - The current subtool
	 * @returns {Promise<void>}
	 */
	async setup(
		context: ImageEditorContext,
		tool: ToolbarTool,
		subtool: Subtool
	): Promise<void> {
		this.image_editor_context = context;
		this.current_tool = tool;
		this.current_subtool = subtool;
		this.pad_bottom = context.pad_bottom;
		const { width, height } = await this.get_container_dimensions();
		const fit_zoom = this.calculate_min_zoom(width, height);
		const min_zoom = Math.min(fit_zoom, 1);

		this.local_scale = min_zoom;

		const canvas = this.image_editor_context.app.screen;

		const center_x = canvas.width / 2;
		const center_y = canvas.height / 2;

		const scaled_width = width * min_zoom;
		const scaled_height = height * min_zoom;
		const initial_x = center_x - scaled_width / 2;
		const initial_y = center_y - scaled_height / 2;

		this.local_position = { x: initial_x, y: initial_y };

		this.setup_event_listeners();

		await this.image_editor_context.set_image_properties({
			scale: min_zoom,
			position: { x: initial_x, y: initial_y }
		});

		this.image_editor_context.dimensions.subscribe((dimensions) => {
			this.local_dimensions = dimensions;
		});

		this.image_editor_context.scale.subscribe((scale) => {
			this.local_scale = scale;
		});

		this.image_editor_context.position.subscribe((position) => {
			this.local_position = position;
		});
	}

	/**
	 * Sets up event listeners for zoom and pan functionality
	 * @private
	 */
	private setup_event_listeners(): void {
		const stage = this.image_editor_context.app.stage;
		const canvas = this.image_editor_context.app.canvas;

		canvas.addEventListener("wheel", this.prevent_default, { passive: false });

		stage.eventMode = "static";
		stage.hitArea = this.image_editor_context.app.screen;

		const wheel_listener = this.handle_wheel.bind(this);
		stage.addEventListener("wheel", wheel_listener, { passive: false });

		if ("ontouchstart" in window) {
			stage.addEventListener(
				"touchstart",
				this.handle_touch_start.bind(this) as EventListener
			);
			stage.addEventListener(
				"touchmove",
				this.handle_touch_move.bind(this) as EventListener
			);
			stage.addEventListener(
				"touchend",
				this.handle_touch_end.bind(this) as EventListener
			);
		} else {
			stage.addEventListener(
				"pointerdown",
				this.handle_pointer_down.bind(this)
			);
			stage.addEventListener(
				"pointermove",
				this.handle_pointer_move.bind(this)
			);
			stage.addEventListener("pointerup", this.handle_pointer_up.bind(this));
			stage.addEventListener(
				"pointerupoutside",
				this.handle_pointer_up.bind(this)
			);
		}
	}

	/**
	 * Handles wheel events for zooming
	 * @param {FederatedWheelEvent} event - The wheel event
	 * @private
	 */
	private handle_wheel(event: FederatedWheelEvent): void {
		const is_trackpad = event.deltaMode === 0 && Math.abs(event.deltaY) < 50;
		const scroll_speed = is_trackpad ? 30 : 10;

		if (event.altKey || event.metaKey) {
			const local_point = this.image_editor_context.app.stage.toLocal(
				event.global
			);
			const zoom_delta = -event.deltaY * (is_trackpad ? 0.001 : 0.0005);
			const new_scale = this.local_scale * (1 + zoom_delta);
			this.zoom_to_point(new_scale, local_point, true);
		} else {
			const delta_x = event.deltaX;
			const delta_y = event.deltaY;
			const raw_position = {
				x: this.local_position.x - (delta_x / 100) * scroll_speed,
				y: this.local_position.y - (delta_y / 100) * scroll_speed
			};

			const canvas = this.image_editor_context.app.screen;
			const scaled_width = this.local_dimensions.width * this.local_scale;
			const scaled_height = this.local_dimensions.height * this.local_scale;
			const available_width = canvas.width - this.border_padding * 2;
			const available_height =
				canvas.height - this.border_padding * 2 - this.pad_bottom;

			let final_position = { ...raw_position };

			if (scaled_width <= available_width) {
				final_position.x = (canvas.width - scaled_width) / 2;
			} else {
				const max_offset = canvas.width / 2;
				const left_bound = max_offset;
				const right_bound = canvas.width - max_offset - scaled_width;
				final_position.x = Math.min(
					Math.max(raw_position.x, right_bound),
					left_bound
				);
			}

			if (scaled_height <= available_height) {
				final_position.y =
					(canvas.height - this.pad_bottom - scaled_height) / 2;
			} else {
				const max_offset = (canvas.height - this.pad_bottom) / 2;
				const top_bound = max_offset;
				const bottom_bound =
					canvas.height - this.pad_bottom - max_offset - scaled_height;
				final_position.y = Math.min(
					Math.max(raw_position.y, bottom_bound),
					top_bound
				);
			}

			this.image_editor_context.set_image_properties({
				scale: this.local_scale,
				position: final_position
			});
		}
	}

	/**
	 * Cleans up resources and event listeners
	 */
	cleanup(): void {
		const stage = this?.image_editor_context?.app?.stage;
		if (!stage) return;
		stage.removeEventListener("wheel", this.handle_wheel.bind(this));

		if ("ontouchstart" in window) {
			stage.removeEventListener(
				"touchstart",
				this.handle_touch_start.bind(this) as EventListener
			);
			stage.removeEventListener(
				"touchmove",
				this.handle_touch_move.bind(this) as EventListener
			);
			stage.removeEventListener(
				"touchend",
				this.handle_touch_end.bind(this) as EventListener
			);
		} else {
			stage.removeEventListener(
				"pointerdown",
				this.handle_pointer_down.bind(this)
			);
			stage.removeEventListener(
				"pointermove",
				this.handle_pointer_move.bind(this)
			);
			stage.removeEventListener("pointerup", this.handle_pointer_up.bind(this));
			stage.removeEventListener(
				"pointerupoutside",
				this.handle_pointer_up.bind(this)
			);
		}
	}

	/**
	 * Gets the dimensions of the container
	 * @returns {Promise<{width: number, height: number}>} The container dimensions
	 * @private
	 */
	private async get_container_dimensions(): Promise<{
		width: number;
		height: number;
	}> {
		const bounds = this.image_editor_context.image_container.getLocalBounds();
		return {
			width: bounds.width,
			height: bounds.height
		};
	}

	/**
	 * Calculates the minimum zoom level to fit the image in the viewport
	 * @param {number} container_width - The width of the container
	 * @param {number} container_height - The height of the container
	 * @returns {number} The minimum zoom level
	 * @private
	 */
	private calculate_min_zoom(
		container_width: number,
		container_height: number
	): number {
		const canvas = this.image_editor_context.app.screen;
		const viewport_width = canvas.width;
		const viewport_height = canvas.height;

		if (
			!container_width ||
			!viewport_width ||
			!container_height ||
			!viewport_height
		) {
			return 1;
		}

		const available_width = viewport_width - this.border_padding * 2;
		const available_height =
			viewport_height - this.border_padding * 2 - this.pad_bottom;

		const width_ratio = available_width / container_width;
		const height_ratio = available_height / container_height;

		return Math.min(width_ratio, height_ratio);
	}

	/**
	 * Handles touch start events
	 * @param {TouchEvent} event - The touch event
	 * @private
	 */
	private handle_touch_start(event: FederatedPointerEvent): void {
		event.preventDefault();

		const touchEvent = event as any;

		if (touchEvent.touches && touchEvent.touches.length === 2) {
			this.is_pinching = true;
			this.last_pinch_distance = Math.hypot(
				touchEvent.touches[0].pageX - touchEvent.touches[1].pageX,
				touchEvent.touches[0].pageY - touchEvent.touches[1].pageY
			);
		} else if (touchEvent.touches && touchEvent.touches.length === 1) {
			this.is_dragging = true;
			const rect = this.image_editor_context.app.view.getBoundingClientRect();
			this.last_touch_position = new Point(
				touchEvent.touches[0].pageX - rect.left,
				touchEvent.touches[0].pageY - rect.top
			);
		}
	}

	/**
	 * Handles touch move events
	 * @param {TouchEvent} event - The touch event
	 * @private
	 */
	private handle_touch_move(event: FederatedPointerEvent): void {
		event.preventDefault();

		const touchEvent = event as any;

		if (
			this.is_pinching &&
			touchEvent.touches &&
			touchEvent.touches.length === 2
		) {
			const rect = this.image_editor_context.app.view.getBoundingClientRect();
			const current_distance = Math.hypot(
				touchEvent.touches[0].pageX - touchEvent.touches[1].pageX,
				touchEvent.touches[0].pageY - touchEvent.touches[1].pageY
			);

			const pinch_center = {
				x:
					(touchEvent.touches[0].pageX + touchEvent.touches[1].pageX) / 2 -
					rect.left,
				y:
					(touchEvent.touches[0].pageY + touchEvent.touches[1].pageY) / 2 -
					rect.top
			};

			const scale_val = current_distance / this.last_pinch_distance;
			this.last_pinch_distance = current_distance;

			this.zoom_to_point(this.local_scale * scale_val, pinch_center);
		} else if (
			this.is_dragging &&
			touchEvent.touches &&
			touchEvent.touches.length === 1 &&
			this.last_touch_position
		) {
			const rect = this.image_editor_context.app.view.getBoundingClientRect();
			const current_position = new Point(
				touchEvent.touches[0].pageX - rect.left,
				touchEvent.touches[0].pageY - rect.top
			);

			const dx = current_position.x - this.last_touch_position.x;
			const dy = current_position.y - this.last_touch_position.y;

			this.image_editor_context.set_image_properties({
				position: {
					x: this.local_position.x + dx,
					y: this.local_position.y + dy
				}
			});

			this.last_touch_position = current_position;
		}
	}

	/**
	 * Handles touch end events
	 * @param {TouchEvent} event - The touch event
	 * @private
	 */
	private handle_touch_end(event: FederatedPointerEvent): void {
		event.preventDefault();

		const touchEvent = event as any;

		if (touchEvent.touches && touchEvent.touches.length < 2) {
			this.is_pinching = false;
			if (touchEvent.touches && touchEvent.touches.length === 1) {
				const rect = this.image_editor_context.app.view.getBoundingClientRect();
				this.last_touch_position = new Point(
					touchEvent.touches[0].pageX - rect.left,
					touchEvent.touches[0].pageY - rect.top
				);
				this.is_dragging = true;
			}
		}
		if (touchEvent.touches && touchEvent.touches.length === 0) {
			this.is_dragging = false;
			this.last_touch_position = null;
			this.last_pinch_distance = 0;
		}
	}

	/**
	 * Gets the bounded position to keep the image within the viewport
	 * @param {Object} position - The position to bound
	 * @param {number} position.x - The x coordinate
	 * @param {number} position.y - The y coordinate
	 * @returns {Object} The bounded position
	 * @private
	 */
	private get_bounded_position(position: { x: number; y: number }): {
		x: number;
		y: number;
	} {
		const canvas = this.image_editor_context.app.screen;
		const scaled_width = this.local_dimensions.width * this.local_scale;
		const scaled_height = this.local_dimensions.height * this.local_scale;

		const center_position = {
			x: (canvas.width - scaled_width) / 2,
			y: (canvas.height - scaled_height - this.pad_bottom) / 2
		};

		if (scaled_width <= canvas.width && scaled_height <= canvas.height) {
			return center_position;
		}

		let x = position.x;
		let y = position.y;

		if (scaled_width <= canvas.width) {
			x = center_position.x;
		} else {
			const min_x = canvas.width - scaled_width;
			const max_x = 0;
			x = Math.max(min_x, Math.min(max_x, position.x));
		}

		if (scaled_height <= canvas.height - this.pad_bottom) {
			y = center_position.y;
		} else {
			const min_y = canvas.height - scaled_height - this.pad_bottom;
			const max_y = 0;
			y = Math.max(min_y, Math.min(max_y, position.y));
		}

		return { x, y };
	}

	/**
	 * Zooms to a specific point with a new zoom level
	 * @param {number} new_zoom - The new zoom level
	 * @param {Object} point - The point to zoom to
	 * @param {number} point.x - The x coordinate of the point
	 * @param {number} point.y - The y coordinate of the point
	 * @param {boolean} hard - Whether to apply a hard zoom (no animation)
	 * @param {boolean} is_fit_zoom - Whether this is a fit zoom operation
	 * @private
	 */
	private zoom_to_point(
		new_zoom: number,
		point: { x: number; y: number },
		hard?: boolean,
		is_fit_zoom?: boolean
	): void {
		const cursor_relative_to_image = {
			x: (point.x - this.local_position.x) / this.local_scale,
			y: (point.y - this.local_position.y) / this.local_scale
		};

		const image_percentages = {
			x: cursor_relative_to_image.x / this.local_dimensions.width,
			y: cursor_relative_to_image.y / this.local_dimensions.height
		};

		const fit_zoom = this.calculate_min_zoom(
			this.local_dimensions.width,
			this.local_dimensions.height
		);
		const min_zoom = Math.min(fit_zoom, 1);
		new_zoom = Math.min(Math.max(new_zoom, min_zoom), this.max_zoom);

		const new_scaled_width = this.local_dimensions.width * new_zoom;
		const new_scaled_height = this.local_dimensions.height * new_zoom;

		let new_position = {
			x: point.x - new_scaled_width * image_percentages.x,
			y: point.y - new_scaled_height * image_percentages.y
		};

		if (new_zoom === min_zoom || is_fit_zoom) {
			const canvas_width = this.image_editor_context.app.screen.width;
			const canvas_height = this.image_editor_context.app.screen.height;

			new_position = {
				x: (canvas_width - new_scaled_width) / 2,
				y: (canvas_height - this.pad_bottom - new_scaled_height) / 2
			};
		}

		this.image_editor_context.set_image_properties({
			scale: new_zoom,
			position: new_position,
			animate: typeof hard === "boolean" ? !hard : new_zoom === min_zoom
		});
		this.min_zoom.set(new_zoom === min_zoom);
	}

	/**
	 * Handles pointer down events
	 * @param {FederatedPointerEvent} event - The pointer event
	 * @private
	 */
	private handle_pointer_down(event: FederatedPointerEvent): void {
		if (event.button === 0 && this.current_tool === "pan") {
			this.is_pointer_dragging = true;
			this.drag_start.copyFrom(event.global);
			this.drag_start.x -= this.local_position.x;
			this.drag_start.y -= this.local_position.y;
		}
	}

	/**
	 * Handles pointer move events
	 * @param {FederatedPointerEvent} event - The pointer event
	 * @private
	 */
	private handle_pointer_move(event: FederatedPointerEvent): void {
		if (this.is_pointer_dragging && this.current_tool === "pan") {
			const raw_position = {
				x: event.global.x - this.drag_start.x,
				y: event.global.y - this.drag_start.y
			};

			const canvas = this.image_editor_context.app.screen;
			const scaled_width = this.local_dimensions.width * this.local_scale;
			const scaled_height = this.local_dimensions.height * this.local_scale;
			const available_width = canvas.width - this.border_padding * 2;
			const available_height =
				canvas.height - this.border_padding * 2 - this.pad_bottom;

			let final_position = { ...raw_position };

			if (scaled_width <= available_width) {
				final_position.x = (canvas.width - scaled_width) / 2;
			} else {
				final_position.x = raw_position.x;
			}

			if (scaled_height <= available_height) {
				final_position.y =
					(canvas.height - this.pad_bottom - scaled_height) / 2;
			} else {
				final_position.y = raw_position.y;
			}

			this.image_editor_context.set_image_properties({
				scale: this.local_scale,
				position: final_position
			});
		}
	}

	/**
	 * Handles pointer up events
	 * @param {FederatedPointerEvent} event - The pointer event
	 * @private
	 */
	private handle_pointer_up(event: FederatedPointerEvent): void {
		if (this.is_pointer_dragging && this.current_tool === "pan") {
			this.is_pointer_dragging = false;

			const raw_position = {
				x: event.global.x - this.drag_start.x,
				y: event.global.y - this.drag_start.y
			};

			const canvas = this.image_editor_context.app.screen;
			const scaled_width = this.local_dimensions.width * this.local_scale;
			const scaled_height = this.local_dimensions.height * this.local_scale;
			const available_width = canvas.width - this.border_padding * 2;
			const available_height =
				canvas.height - this.border_padding * 2 - this.pad_bottom;

			let final_position = { ...raw_position };

			if (scaled_width <= available_width) {
				final_position.x = (canvas.width - scaled_width) / 2;
			} else {
				const max_offset = canvas.width / 2;
				const left_bound = max_offset;
				const right_bound = canvas.width - max_offset - scaled_width;
				final_position.x = Math.min(
					Math.max(raw_position.x, right_bound),
					left_bound
				);
			}

			if (scaled_height <= available_height) {
				final_position.y =
					(canvas.height - this.pad_bottom - scaled_height) / 2;
			} else {
				const max_offset = (canvas.height - this.pad_bottom) / 2;
				const top_bound = max_offset;
				const bottom_bound =
					canvas.height - this.pad_bottom - max_offset - scaled_height;
				final_position.y = Math.min(
					Math.max(raw_position.y, bottom_bound),
					top_bound
				);
			}

			this.image_editor_context.set_image_properties({
				scale: this.local_scale,
				position: final_position,
				animate: true
			});
		}
	}
}
