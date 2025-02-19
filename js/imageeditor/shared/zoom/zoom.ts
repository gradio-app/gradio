import {
	Point,
	type FederatedWheelEvent,
	type FederatedPointerEvent
} from "pixi.js";
import { type ImageEditorContext, type Tool } from "../core/editor";
import { type ToolbarTool, type Subtool } from "../Toolbar.svelte";
export class ZoomTool implements Tool {
	name = "zoom";
	private image_editor_context!: ImageEditorContext;

	// Constants
	private readonly max_zoom = 10;
	private readonly border_padding = 45;

	// State
	private is_pinching = false;
	private is_dragging = false;
	private last_touch_position: Point | null = null;
	private last_pinch_distance = 0;
	private is_pointer_dragging = false;
	private drag_start = new Point();
	private current_tool!: ToolbarTool;
	private current_subtool!: Subtool;

	private local_dimensions: { width: number; height: number } = {
		width: 0,
		height: 0
	};
	private local_scale = 1;
	private local_position: { x: number; y: number } = { x: 0, y: 0 };

	prevent_default(event: FederatedWheelEvent | FederatedPointerEvent): void {
		event.preventDefault();
		event.stopPropagation();
	}

	set_tool(tool: ToolbarTool, subtool: Subtool): void {
		this.current_tool = tool;
		this.current_subtool = subtool;

		console.log(tool, subtool);
	}

	async setup(context: ImageEditorContext): Promise<void> {
		this.image_editor_context = context;

		// Initialize zoom and position
		const { width, height } = await this.get_container_dimensions();
		const min_zoom = this.calculate_min_zoom(width, height);

		// Set initial zoom
		this.local_scale = min_zoom;

		// Use simple center positioning
		const canvas = this.image_editor_context.app.screen;

		const center_x = canvas.width / 2;
		const center_y = canvas.height / 2;
		console.log("center_x", center_x);
		console.log("center_y", center_y);
		// Calculate initial position to center the scaled image
		const scaled_width = width * min_zoom;
		const scaled_height = height * min_zoom;
		const initial_x = center_x - scaled_width / 2;
		const initial_y = center_y - scaled_height / 2;

		this.local_position = { x: initial_x, y: initial_y };

		// Setup event listeners
		this.setup_event_listeners();

		// Update context with initial valuesw
		console.log("initial_x", initial_x);
		console.log("initial_y", initial_y);
		this.image_editor_context.set_image_properties({
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

	private setup_event_listeners(): void {
		const stage = this.image_editor_context.app.stage;
		const canvas = this.image_editor_context.app.canvas;

		canvas.addEventListener("wheel", this.prevent_default, { passive: false });

		// Configure stage for interaction
		stage.eventMode = "static";
		stage.hitArea = this.image_editor_context.app.screen;

		// Add wheel event with options
		const wheel_listener = this.handle_wheel.bind(this);
		stage.addEventListener("wheel", wheel_listener, { passive: false });

		// Setup touch/pointer events based on device
		if ("ontouchstart" in window) {
			stage.addEventListener("touchstart", this.handle_touch_start.bind(this));
			stage.addEventListener("touchmove", this.handle_touch_move.bind(this));
			stage.addEventListener("touchend", this.handle_touch_end.bind(this));
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

	private handle_wheel(event: FederatedWheelEvent): void {
		const is_trackpad = event.deltaMode === 0 && Math.abs(event.deltaY) < 50;
		const scroll_speed = is_trackpad ? 30 : 10;

		if (event.altKey || event.metaKey) {
			// Handle zooming with our new simplified logic
			const local_point = this.image_editor_context.app.stage.toLocal(
				event.global
			);
			const zoom_delta = -event.deltaY * (is_trackpad ? 0.001 : 0.0005);
			const new_scale = this.local_scale * (1 + zoom_delta);
			this.zoom_to_point(new_scale, local_point, true);
		} else {
			// Handle panning with bounds
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
			const available_height = canvas.height - this.border_padding * 2;

			let final_position = { ...raw_position };

			// If image is smaller than available space, center it
			if (scaled_width <= available_width) {
				final_position.x = (canvas.width - scaled_width) / 2;
			} else {
				// Apply 50% rule for horizontal bounds
				const max_offset = canvas.width / 2;
				const left_bound = max_offset;
				const right_bound = canvas.width - max_offset - scaled_width;
				final_position.x = Math.min(
					Math.max(raw_position.x, right_bound),
					left_bound
				);
			}

			if (scaled_height <= available_height) {
				final_position.y = (canvas.height - scaled_height) / 2;
			} else {
				// Apply 50% rule for vertical bounds
				const max_offset = canvas.height / 2;
				const top_bound = max_offset;
				const bottom_bound = canvas.height - max_offset - scaled_height;
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

	cleanup(): void {
		const stage = this.image_editor_context.app.stage;
		stage.removeEventListener("wheel", this.handle_wheel.bind(this));

		if ("ontouchstart" in window) {
			stage.removeEventListener(
				"touchstart",
				this.handle_touch_start.bind(this)
			);
			stage.removeEventListener("touchmove", this.handle_touch_move.bind(this));
			stage.removeEventListener("touchend", this.handle_touch_end.bind(this));
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

	private calculate_min_zoom(
		container_width: number,
		container_height: number
	): number {
		const canvas = this.image_editor_context.app.screen;
		const viewport_width = canvas.width;
		const viewport_height = canvas.height;

		console.log(this.image_editor_context.app);

		if (
			!container_width ||
			!viewport_width ||
			!container_height ||
			!viewport_height
		) {
			return 1;
		}

		// Calculate available space accounting for padding
		const available_width = viewport_width - this.border_padding * 2;
		const available_height = viewport_height - this.border_padding * 2;

		console.log(
			"Available space:",
			available_width,
			available_height,
			container_width,
			container_height
		);

		// Calculate zoom ratios for both dimensions
		const width_ratio = available_width / container_width;
		const height_ratio = available_height / container_height;

		// Use the smaller ratio to ensure the image fits in both dimensions
		return Math.min(width_ratio, height_ratio);
	}

	// private setup_touch_events(): void {
	// 	const canvas = this.image_editor_context.app.view;

	// 	canvas.addEventListener("touchstart", this.handle_touch_start.bind(this), {
	// 		passive: false
	// 	});
	// 	canvas.addEventListener("touchmove", this.handle_touch_move.bind(this), {
	// 		passive: false
	// 	});
	// 	canvas.addEventListener("touchend", this.handle_touch_end.bind(this), {
	// 		passive: false
	// 	});
	// }

	// private setup_pointer_events(): void {
	// 	const stage = this.image_editor_context.app.stage;

	// 	stage.eventMode = "static";
	// 	stage.hitArea = this.image_editor_context.app.screen;

	// 	stage.addEventListener("pointerdown", this.handle_pointer_down.bind(this));
	// 	stage.addEventListener("pointermove", this.handle_pointer_move.bind(this));
	// 	stage.addEventListener("pointerup", this.handle_pointer_up.bind(this));
	// 	stage.addEventListener(
	// 		"pointerupoutside",
	// 		this.handle_pointer_up.bind(this)
	// 	);
	// }

	private handle_touch_start(event: TouchEvent): void {
		event.preventDefault();

		if (event.touches.length === 2) {
			this.is_pinching = true;
			this.last_pinch_distance = Math.hypot(
				event.touches[0].pageX - event.touches[1].pageX,
				event.touches[0].pageY - event.touches[1].pageY
			);
		} else if (event.touches.length === 1) {
			this.is_dragging = true;
			const rect = this.image_editor_context.app.view.getBoundingClientRect();
			this.last_touch_position = new Point(
				event.touches[0].pageX - rect.left,
				event.touches[0].pageY - rect.top
			);
		}
	}

	private handle_touch_move(event: TouchEvent): void {
		event.preventDefault();

		if (this.is_pinching && event.touches.length === 2) {
			const rect = this.image_editor_context.app.view.getBoundingClientRect();
			const current_distance = Math.hypot(
				event.touches[0].pageX - event.touches[1].pageX,
				event.touches[0].pageY - event.touches[1].pageY
			);

			const pinch_center = {
				x: (event.touches[0].pageX + event.touches[1].pageX) / 2 - rect.left,
				y: (event.touches[0].pageY + event.touches[1].pageY) / 2 - rect.top
			};

			const scale_val = current_distance / this.last_pinch_distance;
			const new_zoom = this.local_scale * scale_val;

			this.zoom_to_point(new_zoom, pinch_center, false);
			this.last_pinch_distance = current_distance;
		} else if (
			this.is_dragging &&
			event.touches.length === 1 &&
			this.last_touch_position
		) {
			const rect = this.image_editor_context.app.view.getBoundingClientRect();
			const current_position = new Point(
				event.touches[0].pageX - rect.left,
				event.touches[0].pageY - rect.top
			);

			const dx = current_position.x - this.last_touch_position.x;
			const dy = current_position.y - this.last_touch_position.y;

			const new_position = {
				x: this.local_position.x + dx,
				y: this.local_position.y + dy
			};

			this.image_editor_context.set_image_properties({
				scale: this.local_scale,
				position: new_position
			});

			this.last_touch_position = current_position;
		}
	}

	private handle_touch_end(event: TouchEvent): void {
		event.preventDefault();

		if (event.touches.length < 2) {
			this.is_pinching = false;
			if (event.touches.length === 1) {
				const rect = this.image_editor_context.app.view.getBoundingClientRect();
				this.last_touch_position = new Point(
					event.touches[0].pageX - rect.left,
					event.touches[0].pageY - rect.top
				);
				this.is_dragging = true;
			}
		}
		if (event.touches.length === 0) {
			this.is_dragging = false;
			this.last_touch_position = null;
			this.last_pinch_distance = 0;

			// Apply bounds when touch ends
			const bounded_position = this.get_bounded_position(this.local_position);

			this.image_editor_context.set_image_properties({
				scale: this.local_scale,
				position: bounded_position
			});
		}
	}

	private handle_pointer_down(event: any): void {
		// Only allow dragging if the current tool is 'pan'
		if (event.button === 0 && this.current_tool === "pan") {
			this.is_pointer_dragging = true;
			this.drag_start.copyFrom(event.global);
			this.drag_start.x -= this.local_position.x;
			this.drag_start.y -= this.local_position.y;
		}
	}

	private handle_pointer_move(event: any): void {
		// Only handle move if we're dragging and the tool is 'pan'
		if (this.is_pointer_dragging && this.current_tool === "pan") {
			const raw_position = {
				x: event.global.x - this.drag_start.x,
				y: event.global.y - this.drag_start.y
			};

			const canvas = this.image_editor_context.app.screen;
			const scaled_width = this.local_dimensions.width * this.local_scale;
			const scaled_height = this.local_dimensions.height * this.local_scale;
			const available_width = canvas.width - this.border_padding * 2;
			const available_height = canvas.height - this.border_padding * 2;

			let final_position = { ...raw_position };

			// If image is smaller than available space, center it
			if (scaled_width <= available_width) {
				final_position.x = (canvas.width - scaled_width) / 2;
			} else {
				// Allow free movement during drag, bounds will be applied on pointer up
				final_position.x = raw_position.x;
			}

			if (scaled_height <= available_height) {
				final_position.y = (canvas.height - scaled_height) / 2;
			} else {
				// Allow free movement during drag, bounds will be applied on pointer up
				final_position.y = raw_position.y;
			}

			this.image_editor_context.set_image_properties({
				scale: this.local_scale,
				position: final_position
			});
		}
	}

	private handle_pointer_up(event: any): void {
		// Only handle up if we're dragging and the tool is 'pan'
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
			const available_height = canvas.height - this.border_padding * 2;

			let final_position = { ...raw_position };

			// If image is smaller than available space, center it
			if (scaled_width <= available_width) {
				final_position.x = (canvas.width - scaled_width) / 2;
			} else {
				// Apply 50% rule for horizontal snapping
				const max_offset = canvas.width / 2;
				const left_bound = max_offset;
				const right_bound = canvas.width - max_offset - scaled_width;
				final_position.x = Math.min(
					Math.max(raw_position.x, right_bound),
					left_bound
				);
			}

			if (scaled_height <= available_height) {
				final_position.y = (canvas.height - scaled_height) / 2;
			} else {
				// Apply 50% rule for vertical snapping
				const max_offset = canvas.height / 2;
				const top_bound = max_offset;
				const bottom_bound = canvas.height - max_offset - scaled_height;
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

	private get_bounded_position(position: { x: number; y: number }): {
		x: number;
		y: number;
	} {
		const canvas = this.image_editor_context.app.screen;
		const scaled_width = this.local_dimensions.width * this.local_scale;
		const scaled_height = this.local_dimensions.height * this.local_scale;

		// Calculate center position
		const center_position = {
			x: (canvas.width - scaled_width) / 2,
			y: (canvas.height - scaled_height) / 2
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

		if (scaled_height <= canvas.height) {
			y = center_position.y;
		} else {
			const min_y = canvas.height - scaled_height;
			const max_y = 0;
			y = Math.max(min_y, Math.min(max_y, position.y));
		}

		return { x, y };
	}

	private zoom_to_point(
		new_zoom: number,
		point: { x: number; y: number },
		hard = false
	): void {
		console.group("Zoom Calculations");

		// Get the cursor position relative to the image's top-left corner
		const cursor_relative_to_image = {
			x: (point.x - this.local_position.x) / this.local_scale,
			y: (point.y - this.local_position.y) / this.local_scale
		};

		// Calculate what percentage of the image width/height this represents
		const image_percentages = {
			x: cursor_relative_to_image.x / this.local_dimensions.width,
			y: cursor_relative_to_image.y / this.local_dimensions.height
		};

		console.log("Cursor percentages:", image_percentages);

		// Apply zoom limits
		const min_zoom = this.calculate_min_zoom(
			this.local_dimensions.width,
			this.local_dimensions.height
		);
		new_zoom = Math.min(Math.max(new_zoom, min_zoom), this.max_zoom);

		// Calculate new dimensions
		const new_scaled_width = this.local_dimensions.width * new_zoom;
		const new_scaled_height = this.local_dimensions.height * new_zoom;

		// Calculate new position maintaining the same relative cursor position
		let new_position = {
			x: point.x - new_scaled_width * image_percentages.x,
			y: point.y - new_scaled_height * image_percentages.y
		};

		// Only apply bounds and center if we're at minimum zoom
		if (new_zoom === min_zoom) {
			const canvas_width = this.image_editor_context.app.screen.width;
			const canvas_height = this.image_editor_context.app.screen.height;

			// Center the image
			new_position = {
				x: (canvas_width - new_scaled_width) / 2,
				y: (canvas_height - new_scaled_height) / 2
			};
		}

		console.log("Final position:", new_position);

		this.image_editor_context.set_image_properties({
			scale: new_zoom,
			position: new_position,
			animate: new_zoom === min_zoom
		});
		console.groupEnd();
	}
}
