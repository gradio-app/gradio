import {
	Container,
	Graphics,
	Point,
	Rectangle,
	FederatedPointerEvent
} from "pixi.js";
import { type ImageEditorContext, type Tool } from "../core/editor";

import { type Tool as ToolbarTool, type Subtool } from "../Toolbar.svelte";

/**
 * @interface CropBounds
 * @description Defines the bounds of a crop area
 * @property {number} x - The x-coordinate of the crop area
 * @property {number} y - The y-coordinate of the crop area
 * @property {number} width - The width of the crop area
 * @property {number} height - The height of the crop area
 */
interface CropBounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * @interface EditorState
 * @description Defines the state of the editor
 * @property {ToolbarTool} current_tool - The currently selected tool
 * @property {Subtool} current_subtool - The currently selected subtool
 */
interface EditorState {
	current_tool: ToolbarTool;
	current_subtool: Subtool;
}

/**
 * @class ResizeTool
 * @implements {Tool}
 * @description Implements the resize tool functionality for the image editor
 */
export class ResizeTool implements Tool {
	name = "resize" as const;
	private image_editor_context!: ImageEditorContext;
	current_tool: ToolbarTool = "image";
	current_subtool: Subtool = "size";

	// Constants
	private readonly CORNER_SIZE = 25;
	private readonly LINE_THICKNESS = 5;
	private readonly HANDLE_COLOR = 0x000000;
	private readonly HIT_AREA_SIZE = 40;

	// State
	private is_dragging = false;
	private selected_handle: Container | null = null;
	private active_corner_index = -1;
	private active_edge_index = -1;
	private last_pointer_position: Point | null = null;
	private resize_ui_container: Container | null = null;
	private dimensions: { width: number; height: number } = {
		width: 0,
		height: 0
	};
	private position: { x: number; y: number } = { x: 0, y: 0 };
	private scale = 1;
	private is_moving = false;
	private move_start_position: Point | null = null;

	/**
	 * @method setup
	 * @async
	 * @description Sets up the resize tool with the given context and state
	 * @param {ImageEditorContext} context - The image editor context
	 * @param {EditorState} state - The current editor state
	 * @returns {Promise<void>}
	 */
	async setup(context: ImageEditorContext, state: EditorState): Promise<void> {
		this.image_editor_context = context;

		context.dimensions.subscribe((dimensions) => {
			this.dimensions = dimensions;
			// Force UI update if it exists
			if (this.resize_ui_container) {
				this.update_resize_ui();
			}
		});

		context.position.subscribe((position) => {
			this.position = position;
		});

		context.scale.subscribe((scale) => {
			this.scale = scale;
		});

		// Initialize resize UI
		await this.init_resize_ui();
		this.setup_event_listeners();
	}

	/**
	 * @method cleanup
	 * @description Cleans up the resize tool resources and removes event listeners
	 * @returns {void}
	 */
	cleanup(): void {
		if (this.resize_ui_container) {
			this.image_editor_context.app.stage.removeChild(this.resize_ui_container);
		}
		// Remove event listeners
		this.cleanup_event_listeners();
	}

	/**
	 * @method set_tool
	 * @description Sets the current tool and subtool, updating UI visibility
	 * @param {ToolbarTool} tool - The tool to set
	 * @param {Subtool} subtool - The subtool to set
	 * @returns {void}
	 */
	set_tool(tool: ToolbarTool, subtool: Subtool): void {
		this.current_subtool = subtool;

		// Show/hide resize UI based on tool and subtool
		if (this.resize_ui_container) {
			this.resize_ui_container.visible = tool === "image" && subtool === "size";
		}

		// Setup or cleanup background image event listeners based on tool state
		if (tool === "image" && subtool === "size") {
			// Add move functionality to the background image if it exists
			if (this.image_editor_context.background_image) {
				const bg = this.image_editor_context.background_image;
				bg.eventMode = "static";
				bg.cursor = "move";
				bg.interactive = true;
				bg.on("pointerdown", this.handle_image_pointer_down.bind(this));
			}
		} else {
			// Clean up event listeners if tool is not active
			if (this.image_editor_context.background_image) {
				const bg = this.image_editor_context.background_image;
				bg.eventMode = "none";
				bg.cursor = "default";
				bg.interactive = false;
				bg.off("pointerdown", this.handle_image_pointer_down.bind(this));
			}
		}
	}

	/**
	 * @method init_resize_ui
	 * @private
	 * @async
	 * @description Initializes the resize UI elements and sets up the update loop
	 * @returns {Promise<void>}
	 */
	private async init_resize_ui(): Promise<void> {
		// Create resize UI with scaled dimensions
		this.resize_ui_container = this.make_resize_ui(
			this.dimensions.width * this.scale,
			this.dimensions.height * this.scale
		);

		// Position the resize UI container at the image position
		this.resize_ui_container.position.set(this.position.x, this.position.y);

		// Initially hide the resize UI until explicitly enabled by set_tool
		this.resize_ui_container.visible = false;

		this.image_editor_context.app.stage.addChild(this.resize_ui_container);

		// Start the update loop
		this.image_editor_context.app.ticker.add(this.update_resize_ui.bind(this));
	}

	/**
	 * @method make_resize_ui
	 * @private
	 * @description Creates the resize UI with the specified dimensions
	 * @param {number} width - Width of the resize area
	 * @param {number} height - Height of the resize area
	 * @returns {Container} The created resize UI container
	 */
	private make_resize_ui(width: number, height: number): Container {
		const resize_container = new Container();
		resize_container.eventMode = "static";
		resize_container.interactiveChildren = true;

		// Create outline
		const outline = new Graphics()
			.rect(0, 0, width, height)
			.stroke({ width: 1, color: 0x000000, alignment: 0, alpha: 0.5 });

		resize_container.addChild(outline);

		// Create handles
		this.create_corner_handles(resize_container, width, height);
		this.create_edge_handles(resize_container, width, height);

		return resize_container;
	}

	/**
	 * @method create_handle
	 * @private
	 * @description Creates a handle for the resize UI
	 * @param {boolean} [is_edge=false] - Whether the handle is an edge handle
	 * @returns {Container} The created handle container
	 */
	private create_handle(is_edge = false): Container {
		const handle = new Container();
		handle.eventMode = "static";
		handle.cursor = "pointer";

		const handle_graphics = new Graphics();

		if (is_edge) {
			// Create a shorter bar for edge handles (2x instead of 3x)
			handle_graphics
				.rect(0, 0, this.CORNER_SIZE * 1.5, this.LINE_THICKNESS)
				.fill(this.HANDLE_COLOR);
		} else {
			// Create L-shaped corner handles
			handle_graphics
				.rect(0, 0, this.CORNER_SIZE, this.LINE_THICKNESS)
				.rect(0, 0, this.LINE_THICKNESS, this.CORNER_SIZE)
				.fill(this.HANDLE_COLOR);
		}

		handle.addChild(handle_graphics);

		// Adjust hit area based on handle type
		const hit_size = is_edge ? this.HIT_AREA_SIZE * 1.5 : this.HIT_AREA_SIZE;
		handle.hitArea = new Rectangle(
			-hit_size / 2 + this.LINE_THICKNESS,
			-hit_size / 2 + this.LINE_THICKNESS,
			hit_size,
			hit_size
		);

		return handle;
	}

	/**
	 * @method create_edge_handles
	 * @private
	 * @description Creates edge handles for the resize UI
	 * @param {Container} container - The container to add handles to
	 * @param {number} width - Width of the resize area
	 * @param {number} height - Height of the resize area
	 * @returns {void}
	 */
	private create_edge_handles(
		container: Container,
		width: number,
		height: number
	): void {
		// Horizontal handles at top and bottom
		[-1, 1].forEach((i, index) => {
			const handle = this.create_handle(true); // true for edge handle
			handle.rotation = 0;

			handle.on("pointerdown", (event: FederatedPointerEvent) => {
				this.handle_pointer_down(event, handle, -1, index); // 0 for top, 1 for bottom
			});

			// Center the handle
			handle.x = width / 2 - (this.CORNER_SIZE * 3) / 2;
			handle.y = i < 0 ? -this.LINE_THICKNESS : height;

			container.addChild(handle);
		});

		// Vertical handles at left and right
		[-1, 1].forEach((i, index) => {
			const handle = this.create_handle(true); // true for edge handle
			handle.rotation = Math.PI / 2; // Rotate 90 degrees

			handle.on("pointerdown", (event: FederatedPointerEvent) => {
				this.handle_pointer_down(event, handle, -1, index + 2); // 2 for left, 3 for right
			});

			// Center the handle
			handle.x = i < 0 ? -this.LINE_THICKNESS : width;
			handle.y = height / 2 - (this.CORNER_SIZE * 3) / 2;

			container.addChild(handle);
		});
	}

	/**
	 * @method create_corner_handles
	 * @private
	 * @description Creates corner handles for the resize UI
	 * @param {Container} container - The container to add handles to
	 * @param {number} width - Width of the resize area
	 * @param {number} height - Height of the resize area
	 * @returns {void}
	 */
	private create_corner_handles(
		container: Container,
		width: number,
		height: number
	): void {
		const corners = [
			{ x: 0, y: 0, xScale: 1, yScale: 1 }, // Top-left
			{ x: width, y: 0, xScale: -1, yScale: 1 }, // Top-right
			{ x: 0, y: height, xScale: 1, yScale: -1 }, // Bottom-left
			{ x: width, y: height, xScale: -1, yScale: -1 } // Bottom-right
		];

		corners.forEach(({ x, y, xScale, yScale }, i) => {
			const corner = this.create_handle(false); // false for corner handle
			corner.x = x - (xScale < 0 ? -this.LINE_THICKNESS : this.LINE_THICKNESS);
			corner.y = y - (yScale < 0 ? -this.LINE_THICKNESS : this.LINE_THICKNESS);
			corner.scale.set(xScale, yScale);

			corner.on("pointerdown", (event: FederatedPointerEvent) => {
				this.handle_pointer_down(event, corner, i, -1);
			});

			container.addChild(corner);
		});
	}

	/**
	 * @method handle_pointer_down
	 * @private
	 * @description Handles pointer down events on handles
	 * @param {FederatedPointerEvent} event - The pointer event
	 * @param {Container} handle - The handle that was clicked
	 * @param {number} corner_index - Index of the corner (-1 if not a corner)
	 * @param {number} edge_index - Index of the edge (-1 if not an edge)
	 * @returns {void}
	 */
	private handle_pointer_down(
		event: FederatedPointerEvent,
		handle: Container,
		corner_index: number,
		edge_index: number
	): void {
		// Only handle resize events if resize tool is active
		if (this.current_subtool !== "size") return;

		event.stopPropagation();

		this.is_dragging = true;
		this.selected_handle = handle;
		this.active_corner_index = corner_index;
		this.active_edge_index = edge_index;

		// Convert global position to the container's local coordinates.
		const local_pos = this.image_editor_context.image_container.toLocal(
			event.global
		);
		this.last_pointer_position = new Point(local_pos.x, local_pos.y);
	}

	/**
	 * updates the resize bounds based on pointer movement
	 * @param delta - the change in position
	 */
	private update_resize_bounds(delta: Point): void {
		// The delta is already in local coordinates, no need to scale it further
		const background_image = this.image_editor_context.background_image;

		if (!background_image) return;

		let new_width = background_image.width;
		let new_height = background_image.height;

		if (this.active_corner_index !== -1) {
			// Handle corner dragging
			switch (this.active_corner_index) {
				case 0: // Top-left
					new_width = Math.max(20, background_image.width - delta.x);
					new_height = Math.max(20, background_image.height - delta.y);
					break;
				case 1: // Top-right
					new_width = Math.max(20, background_image.width + delta.x);
					new_height = Math.max(20, background_image.height - delta.y);
					break;
				case 2: // Bottom-left
					new_width = Math.max(20, background_image.width - delta.x);
					new_height = Math.max(20, background_image.height + delta.y);
					break;
				case 3: // Bottom-right
					new_width = Math.max(20, background_image.width + delta.x);
					new_height = Math.max(20, background_image.height + delta.y);
					break;
			}
		} else if (this.active_edge_index !== -1) {
			// Handle edge dragging
			switch (this.active_edge_index) {
				case 0: // Top
					new_height = Math.max(20, background_image.height - delta.y);
					break;
				case 1: // Bottom
					new_height = Math.max(20, background_image.height + delta.y);
					break;
				case 2: // Left
					new_width = Math.max(20, background_image.width - delta.x);
					break;
				case 3: // Right
					new_width = Math.max(20, background_image.width + delta.x);
					break;
			}
		}

		// Apply the new dimensions
		background_image.width = new_width;
		background_image.height = new_height;

		//  Do not update the dimensions, this respresents the canvas, not the image contained within
		// this.image_editor_context.set_image_properties({
		// 	width: new_width,
		// 	height: new_height
		// });
	}

	/**
	 * updates the resize ui position and dimensions
	 */
	private update_resize_ui(): void {
		if (
			!this.resize_ui_container ||
			!this.image_editor_context.background_image
		)
			return;

		const background_image = this.image_editor_context.background_image;
		const image_container = this.image_editor_context.image_container;

		// Combine container position (screen coords) with scaled sprite position (local coords)
		const total_x =
			image_container.position.x + background_image.position.x * this.scale;
		const total_y =
			image_container.position.y + background_image.position.y * this.scale;

		// Move resize_ui_container to match the combined position
		this.resize_ui_container.position.set(total_x, total_y);

		// Get the scaled dimensions
		const scaled_width = background_image.width * this.scale;
		const scaled_height = background_image.height * this.scale;

		// Redraw the outline so it matches the resize_bounds size
		const outline = this.resize_ui_container.getChildAt(0) as Graphics;
		outline
			.clear()
			.rect(0, 0, scaled_width, scaled_height)
			.stroke({ width: 1, color: 0x000000, alignment: 0, alpha: 0.5 });

		// Update handle positions to reflect the resized area
		this.update_handle_positions(scaled_width, scaled_height);
	}

	/**
	 * updates the positions of all handles
	 * @param width - width of the resize area
	 * @param height - height of the resize area
	 */
	private update_handle_positions(width: number, height: number): void {
		if (!this.resize_ui_container) return;

		// Skip the outline (index 0), get corner/edge handles
		const handles = this.resize_ui_container.children.slice(1);

		// First 4 are corners
		const corners = handles.slice(0, 4);
		const cornerPositions = [
			{ x: 0, y: 0 }, // Top-left
			{ x: width, y: 0 }, // Top-right
			{ x: 0, y: height }, // Bottom-left
			{ x: width, y: height } // Bottom-right
		];

		corners.forEach((handle, i) => {
			const xScale = i % 2 === 0 ? 1 : -1;
			const yScale = i < 2 ? 1 : -1;
			handle.position.set(
				cornerPositions[i].x -
					(xScale < 0 ? -this.LINE_THICKNESS : this.LINE_THICKNESS),
				cornerPositions[i].y -
					(yScale < 0 ? -this.LINE_THICKNESS : this.LINE_THICKNESS)
			);
		});

		// Remaining 4 are edges
		const edges = handles.slice(4);
		edges.forEach((handle, i) => {
			if (i < 2) {
				// Top/Bottom edges
				handle.position.set(
					width / 2 - (this.CORNER_SIZE * 1.5) / 2, // Changed from 3 to 2
					i === 0 ? -this.LINE_THICKNESS : height
				);
			} else {
				// Left/Right edges
				handle.position.set(
					i === 2 ? 0 : width + this.LINE_THICKNESS,
					height / 2 - (this.CORNER_SIZE * 1.5) / 2 // Changed from 3 to 2
				);
			}
		});
	}

	/**
	 * sets up event listeners for the resize tool
	 */
	private setup_event_listeners(): void {
		const stage = this.image_editor_context.app.stage;
		stage.eventMode = "static";
		stage.on("pointermove", this.handle_pointer_move.bind(this));
		stage.on("pointerup", this.handle_pointer_up.bind(this));
		stage.on("pointerupoutside", this.handle_pointer_up.bind(this));

		// Add move functionality to the background image
		if (this.image_editor_context.background_image) {
			const bg = this.image_editor_context.background_image;
			bg.eventMode = "static";
			bg.cursor = "move";
			bg.on("pointerdown", this.handle_image_pointer_down.bind(this));

			// Make sure the background image is interactive
			bg.interactive = true;
		}
	}

	/**
	 * removes event listeners for the resize tool
	 */
	private cleanup_event_listeners(): void {
		const stage = this.image_editor_context.app.stage;

		stage.off("pointermove", this.handle_pointer_move.bind(this));
		stage.off("pointerup", this.handle_pointer_up.bind(this));
		stage.off("pointerupoutside", this.handle_pointer_up.bind(this));

		// Clean up image event listeners
		if (this.image_editor_context.background_image) {
			const bg = this.image_editor_context.background_image;
			bg.eventMode = "none";
			bg.cursor = "default";
			bg.off("pointerdown", this.handle_image_pointer_down.bind(this));
		}
	}

	/**
	 * handles pointer move events
	 * @param event - the pointer event
	 */
	private handle_pointer_move(event: FederatedPointerEvent): void {
		if (this.current_subtool !== "size") return;

		if (
			this.is_moving &&
			this.move_start_position &&
			this.last_pointer_position
		) {
			// Calculate the delta in screen coordinates, accounting for scale
			const dx = (event.global.x - this.last_pointer_position.x) / this.scale;
			const dy = (event.global.y - this.last_pointer_position.y) / this.scale;

			// Update the position
			const new_x = this.move_start_position.x + dx;
			const new_y = this.move_start_position.y + dy;

			// Update both the sprite and resize UI container positions directly
			if (this.image_editor_context.background_image) {
				const bg = this.image_editor_context.background_image;
				const image_container = this.image_editor_context.image_container;

				bg.position.set(new_x, new_y);

				// Update resize UI with container position and scaled sprite position
				if (this.resize_ui_container) {
					const total_x = image_container.position.x + new_x * this.scale;
					const total_y = image_container.position.y + new_y * this.scale;
					this.resize_ui_container.position.set(total_x, total_y);
				}
			}
		} else if (
			this.is_dragging &&
			this.selected_handle &&
			this.last_pointer_position
		) {
			// Existing resize logic
			const local_pos = this.image_editor_context.image_container.toLocal(
				event.global
			);
			const current_position = new Point(local_pos.x, local_pos.y);

			const delta = new Point(
				current_position.x - this.last_pointer_position.x,
				current_position.y - this.last_pointer_position.y
			);

			this.update_resize_bounds(delta);
			this.last_pointer_position = current_position;
		}
	}

	/**
	 * handles pointer up events
	 */
	private handle_pointer_up(): void {
		if (this.current_subtool !== "size") return;

		this.is_dragging = false;
		this.is_moving = false;
		this.selected_handle = null;
		this.last_pointer_position = null;
		this.move_start_position = null;
		this.active_corner_index = -1;
		this.active_edge_index = -1;
	}

	private handle_image_pointer_down(event: FederatedPointerEvent): void {
		if (this.current_subtool !== "size") return;

		event.stopPropagation();
		this.is_moving = true;

		// Store the starting position of the background image
		if (this.image_editor_context.background_image) {
			const bg = this.image_editor_context.background_image;
			this.move_start_position = new Point(bg.position.x, bg.position.y);
		}

		// Store the initial pointer position
		this.last_pointer_position = new Point(event.global.x, event.global.y);
	}
}
