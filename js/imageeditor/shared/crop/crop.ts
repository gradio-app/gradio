import {
	Container,
	Graphics,
	Point,
	Rectangle,
	FederatedPointerEvent,
	Sprite
} from "pixi.js";
import { type ImageEditorContext, type Tool } from "../core/editor";

import { type Tool as ToolbarTool, type Subtool } from "../Toolbar.svelte";
import { get_canvas_blob } from "../utils/pixi";

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
 * @class CropTool
 * @implements {Tool}
 * @description Implements the crop tool functionality for the image editor
 */
export class CropTool implements Tool {
	name = "crop" as const;
	private image_editor_context!: ImageEditorContext;
	current_tool: ToolbarTool = "image";
	current_subtool: Subtool = "crop";

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
	crop_bounds: CropBounds = { x: 0, y: 0, width: 0, height: 0 };
	private crop_ui_container: Container | null = null;
	private crop_mask: Graphics | null = null;
	private dimensions: { width: number; height: number } = {
		width: 0,
		height: 0
	};
	private position: { x: number; y: number } = { x: 0, y: 0 };
	private scale = 1;
	private is_dragging_window = false;
	private drag_start_position: Point | null = null;
	private drag_start_bounds: CropBounds | null = null;
	private background_image_watcher: (() => void) | null = null;
	private has_been_manually_changed = false;
	private event_callbacks: Map<string, (() => void)[]> = new Map();
	/**
	 * @method setup
	 * @async
	 * @description Sets up the crop tool with the given context and state
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

		context.dimensions.subscribe((dimensions) => {
			this.dimensions = dimensions;

			// Update crop bounds to match new dimensions
			this.crop_bounds = {
				x: 0,
				y: 0,
				width: dimensions.width,
				height: dimensions.height
			};

			// Force UI update if it exists
			if (this.crop_ui_container) {
				this.update_crop_ui();
			}

			// Always update the mask when dimensions change
			this.set_crop_mask();
			this.update_crop_mask();
		});

		context.position.subscribe((position) => {
			this.position = position;
		});

		context.scale.subscribe((scale) => {
			this.scale = scale;
		});

		// Setup a background image watcher to ensure we always apply the mask to the current background image
		this.background_image_watcher = () => {
			// Only apply when crop tool is active and we have a mask
			if (
				this.crop_mask &&
				this.current_tool === "image" &&
				this.current_subtool === "crop"
			) {
				// Get a fresh reference to the background image and apply the mask
				if (this.image_editor_context.background_image) {
					this.image_editor_context.background_image.setMask(this.crop_mask);
				}
			}
		};

		// Add the watcher to the ticker to regularly check for background image changes
		this.image_editor_context.app.ticker.add(this.background_image_watcher);

		// Initialize crop UI
		await this.init_crop_ui();

		// Setup event listeners
		this.setup_event_listeners();

		// Ensure the crop UI visibility matches the current tool state
		const isCropActive = tool === "image" && subtool === "crop";
		if (this.crop_ui_container) {
			this.crop_ui_container.visible = isCropActive;
		}
	}

	/**
	 * @method cleanup
	 * @description Cleans up the crop tool resources and removes event listeners
	 * @returns {void}
	 */
	cleanup(): void {
		// Remove the crop UI container
		if (this.crop_ui_container) {
			this.image_editor_context.app.stage.removeChild(this.crop_ui_container);
		}

		// Remove the mask and reset the image container's mask property
		if (this.crop_mask) {
			if (this.crop_mask.parent) {
				this.crop_mask.parent.removeChild(this.crop_mask);
			}

			// Clear mask from background_image if applied
			if (
				this.image_editor_context.background_image &&
				this.image_editor_context.background_image.mask === this.crop_mask
			) {
				this.image_editor_context.background_image.mask = null;
			}

			// Clear mask from image_container if applied
			if (this.image_editor_context.image_container.mask === this.crop_mask) {
				this.image_editor_context.image_container.mask = null;
			}
		}

		// Ensure all references to the crop mask are cleared
		this.crop_mask = null;
		this.crop_ui_container = null;

		// Remove the background image watcher from the ticker
		if (this.background_image_watcher) {
			this.image_editor_context.app.ticker.remove(
				this.background_image_watcher
			);
			this.background_image_watcher = null;
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
		this.current_tool = tool;
		this.current_subtool = subtool;

		// Show/hide crop UI based on tool and subtool
		const isCropActive = tool === "image" && subtool === "crop";

		// Only update the UI visibility, not the mask
		if (this.crop_ui_container) {
			this.crop_ui_container.visible = isCropActive;
		}

		// If crop tool is active, ensure the mask is up to date
		if (isCropActive && this.crop_mask) {
			this.update_crop_mask();
		}
	}

	/**
	 * @method set_crop_mask
	 * @private
	 * @description Sets up the crop mask for the image
	 * @returns {void}
	 */
	private set_crop_mask(): void {
		// Remove any existing mask to avoid duplicates
		if (this.crop_mask) {
			if (this.crop_mask.parent) {
				this.crop_mask.parent.removeChild(this.crop_mask);
			}

			// Clear mask from image_container if it was applied there
			if (this.image_editor_context.image_container.mask === this.crop_mask) {
				this.image_editor_context.image_container.mask = null;
			}

			// Clear mask from background_image if it was applied there
			if (
				this.image_editor_context.background_image &&
				this.image_editor_context.background_image.mask === this.crop_mask
			) {
				this.image_editor_context.background_image.mask = null;
			}
		}

		// Create a new mask that will actually be used as an overlay
		this.crop_mask = new Graphics();

		// Add the mask/overlay to the display list
		// This time it should be visible since we want to see the semi-transparent overlay
		this.image_editor_context.image_container.addChild(this.crop_mask);
	}

	/**
	 * @method init_crop_ui
	 * @private
	 * @async
	 * @description Initializes the crop UI elements and sets up the update loop
	 * @returns {Promise<void>}
	 */
	private async init_crop_ui(): Promise<void> {
		// Create crop UI with scaled dimensions
		const { width, height } =
			this.image_editor_context.background_image?.getLocalBounds() || {
				width: false,
				height: false
			};

		this.crop_ui_container = this.make_crop_ui(
			this.dimensions.width * this.scale,
			this.dimensions.height * this.scale
		);

		// Position the crop UI container at the image position
		this.crop_ui_container.position.set(this.position.x, this.position.y);

		// Initially hide the crop UI until explicitly enabled by set_tool
		this.crop_ui_container.visible = false;

		this.image_editor_context.app.stage.addChild(this.crop_ui_container);

		// Create and apply mask to the image container
		this.set_crop_mask();

		// Start the update loop for the UI
		this.image_editor_context.app.ticker.add(this.update_crop_ui.bind(this));

		// Initialize the mask with the current crop bounds
		this.update_crop_mask();
	}

	/**
	 * @method make_crop_ui
	 * @private
	 * @description Creates the crop UI with the specified dimensions
	 * @param {number} width - Width of the crop area
	 * @param {number} height - Height of the crop area
	 * @returns {Container} The created crop UI container
	 */
	private make_crop_ui(width: number, height: number): Container {
		const crop_container = new Container();
		crop_container.eventMode = "static";
		crop_container.interactiveChildren = true;

		// Create crop outline with hit area for dragging
		const crop_outline = new Graphics()
			.rect(0, 0, width, height)
			.stroke({ width: 1, color: 0x000000, alignment: 0, alpha: 0.5 });

		// Make the outline interactive
		crop_outline.eventMode = "static";
		crop_outline.cursor = "move";

		// Set hit area to match the outline's dimensions
		crop_outline.hitArea = new Rectangle(0, 0, width, height);

		// Add drag handlers to the outline
		crop_outline.on("pointerdown", this.handle_window_drag_start.bind(this));

		crop_container.addChild(crop_outline);

		// Create corner handles
		this.create_corner_handles(crop_container, width, height);

		// Create edge handles
		this.create_edge_handles(crop_container, width, height);

		return crop_container;
	}

	/**
	 * @method create_handle
	 * @private
	 * @description Creates a handle for the crop UI
	 * @param {boolean} [is_edge=false] - Whether the handle is an edge handle
	 * @returns {Container} The created handle container
	 */
	private create_handle(is_edge = false): Container {
		const handle = new Container();
		handle.eventMode = "static";

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
	 * @description Creates edge handles for the crop UI
	 * @param {Container} container - The container to add handles to
	 * @param {number} width - Width of the crop area
	 * @param {number} height - Height of the crop area
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
			handle.cursor = "ns-resize";

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
			handle.cursor = "ew-resize";

			container.addChild(handle);
		});
	}

	/**
	 * @method create_corner_handles
	 * @private
	 * @description Creates corner handles for the crop UI
	 * @param {Container} container - The container to add handles to
	 * @param {number} width - Width of the crop area
	 * @param {number} height - Height of the crop area
	 * @returns {void}
	 */
	private create_corner_handles(
		container: Container,
		width: number,
		height: number
	): void {
		const corners = [
			{ x: 0, y: 0, xScale: 1, yScale: 1, cursor: "nwse-resize" }, // Top-left
			{ x: width, y: 0, xScale: -1, yScale: 1, cursor: "nesw-resize" }, // Top-right
			{ x: 0, y: height, xScale: 1, yScale: -1, cursor: "nesw-resize" }, // Bottom-left
			{ x: width, y: height, xScale: -1, yScale: -1, cursor: "nwse-resize" } // Bottom-right
		];

		corners.forEach(({ x, y, xScale, yScale, cursor }, i) => {
			const corner = this.create_handle(false); // false for corner handle
			corner.x = x - (xScale < 0 ? -this.LINE_THICKNESS : this.LINE_THICKNESS);
			corner.y = y - (yScale < 0 ? -this.LINE_THICKNESS : this.LINE_THICKNESS);
			corner.scale.set(xScale, yScale);

			corner.on("pointerdown", (event: FederatedPointerEvent) => {
				this.handle_pointer_down(event, corner, i, -1);
			});

			corner.cursor = cursor;

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
		// Only handle crop events if crop tool is active
		if (this.current_subtool !== "crop") return;

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
	 * updates the crop bounds based on pointer movement
	 * @param delta - the change in position
	 */
	private update_crop_bounds(delta: Point): void {
		// Set flag indicating the crop has been manually changed
		this.has_been_manually_changed = true;

		// Scale the delta to match the image coordinates
		const scaled_delta = new Point(delta.x, delta.y);

		// Store original values to calculate actual changes
		const original = {
			x: this.crop_bounds.x,
			y: this.crop_bounds.y,
			width: this.crop_bounds.width,
			height: this.crop_bounds.height
		};

		if (this.active_corner_index !== -1) {
			// Handle corner dragging
			switch (this.active_corner_index) {
				case 0: // Top-left
					// Update width and x position
					const newWidth0 = Math.max(20, original.width - scaled_delta.x);
					const widthDiff0 = original.width - newWidth0;
					this.crop_bounds.width = newWidth0;
					this.crop_bounds.x = original.x + widthDiff0;

					// Update height and y position
					const newHeight0 = Math.max(20, original.height - scaled_delta.y);
					const heightDiff0 = original.height - newHeight0;
					this.crop_bounds.height = newHeight0;
					this.crop_bounds.y = original.y + heightDiff0;
					break;

				case 1: // Top-right
					// Update width (right side)
					this.crop_bounds.width = Math.max(
						20,
						original.width + scaled_delta.x
					);

					// Update height and y position (top side)
					const newHeight1 = Math.max(20, original.height - scaled_delta.y);
					const heightDiff1 = original.height - newHeight1;
					this.crop_bounds.height = newHeight1;
					this.crop_bounds.y = original.y + heightDiff1;
					break;

				case 2: // Bottom-left
					// Update width and x position (left side)
					const newWidth2 = Math.max(20, original.width - scaled_delta.x);
					const widthDiff2 = original.width - newWidth2;
					this.crop_bounds.width = newWidth2;
					this.crop_bounds.x = original.x + widthDiff2;

					// Update height (bottom side)
					this.crop_bounds.height = Math.max(
						20,
						original.height + scaled_delta.y
					);
					break;

				case 3: // Bottom-right
					// Update width (right side)
					this.crop_bounds.width = Math.max(
						20,
						original.width + scaled_delta.x
					);

					// Update height (bottom side)
					this.crop_bounds.height = Math.max(
						20,
						original.height + scaled_delta.y
					);
					break;
			}
		} else if (this.active_edge_index !== -1) {
			// Handle edge dragging
			switch (this.active_edge_index) {
				case 0: // Top
					// Update height and y position
					const newHeight = Math.max(20, original.height - scaled_delta.y);
					const heightDiff = original.height - newHeight;
					this.crop_bounds.height = newHeight;
					this.crop_bounds.y = original.y + heightDiff;
					break;

				case 1: // Bottom
					// Update height only
					this.crop_bounds.height = Math.max(
						20,
						original.height + scaled_delta.y
					);
					break;

				case 2: // Left
					// Update width and x position
					const newWidth = Math.max(20, original.width - scaled_delta.x);
					const widthDiff = original.width - newWidth;
					this.crop_bounds.width = newWidth;
					this.crop_bounds.x = original.x + widthDiff;
					break;

				case 3: // Right
					// Update width only
					this.crop_bounds.width = Math.max(
						20,
						original.width + scaled_delta.x
					);
					break;
			}
		}

		// Apply constraints
		this.constrain_crop_bounds();

		// Update the UI and mask
		this.update_crop_ui();
		this.update_crop_mask();

		// Make sure to apply mask to the current background image
		if (this.crop_mask && this.image_editor_context.background_image) {
			this.image_editor_context.background_image.setMask(this.crop_mask);
		}
	}

	/**
	 * constrains the crop bounds to the image dimensions
	 */
	private constrain_crop_bounds(): void {
		// Store original values
		const original = {
			x: this.crop_bounds.x,
			y: this.crop_bounds.y,
			width: this.crop_bounds.width,
			height: this.crop_bounds.height
		};

		// First, constrain width and height to prevent exceeding image dimensions
		// and ensure minimum size
		this.crop_bounds.width = Math.max(
			20,
			Math.min(this.crop_bounds.width, this.dimensions.width)
		);

		this.crop_bounds.height = Math.max(
			20,
			Math.min(this.crop_bounds.height, this.dimensions.height)
		);

		// Then constrain x and y to keep the crop window within the image bounds
		const oldX = this.crop_bounds.x;
		this.crop_bounds.x = Math.max(
			0,
			Math.min(
				this.crop_bounds.x,
				this.dimensions.width - this.crop_bounds.width
			)
		);

		// If x position was constrained, adjust width to prevent opposite handle drift
		if (
			(this.crop_bounds.x !== oldX && this.active_corner_index === 0) ||
			this.active_edge_index === 2
		) {
			// Left side was constrained, adjust width to compensate
			const xDiff = this.crop_bounds.x - oldX;
			this.crop_bounds.width -= xDiff;
		}

		const oldY = this.crop_bounds.y;
		this.crop_bounds.y = Math.max(
			0,
			Math.min(
				this.crop_bounds.y,
				this.dimensions.height - this.crop_bounds.height
			)
		);

		// If y position was constrained, adjust height to prevent opposite handle drift
		if (
			this.crop_bounds.y !== oldY &&
			(this.active_corner_index === 0 ||
				this.active_corner_index === 1 ||
				this.active_edge_index === 0)
		) {
			// Top side was constrained, adjust height to compensate
			const yDiff = this.crop_bounds.y - oldY;
			this.crop_bounds.height -= yDiff;
		}

		// Final check to ensure width and height don't exceed image dimensions from current position
		this.crop_bounds.width = Math.max(
			20,
			Math.min(
				this.crop_bounds.width,
				this.dimensions.width - this.crop_bounds.x
			)
		);

		this.crop_bounds.height = Math.max(
			20,
			Math.min(
				this.crop_bounds.height,
				this.dimensions.height - this.crop_bounds.y
			)
		);
	}

	/**
	 * updates the crop mask graphics
	 */
	private update_crop_mask(): void {
		if (!this.crop_mask) return;

		// Clear the previous mask shape
		this.crop_mask.clear();

		const { width, height } =
			this.image_editor_context.background_image?.getLocalBounds() ?? {
				width: 0,
				height: 0
			};
		this.crop_mask
			.rect(0, 0, width, height)
			.fill({ color: 0x000000, alpha: 0.4 })
			.rect(
				this.crop_bounds.x,
				this.crop_bounds.y,
				this.crop_bounds.width,
				this.crop_bounds.height
			)
			.cut();

		// Reset blend mode
		// this.crop_mask.blendMode = "normal";

		// Make the mask visible (previously we had alpha=0)
		// this.crop_mask.alpha = 1;

		// Since we're not using this as a mask anymore, but as an overlay,
		// we should remove any existing mask assignment
		if (this.image_editor_context.background_image) {
			this.image_editor_context.background_image.mask = null;
		}

		// Make sure the mask is not applied to the image container
		if (this.image_editor_context.image_container.mask === this.crop_mask) {
			this.image_editor_context.image_container.mask = null;
		}
	}

	/**
	 * updates the crop ui position and dimensions
	 */
	private update_crop_ui(): void {
		if (!this.crop_mask || !this.crop_ui_container) return;

		// Move crop_ui_container so that (0,0) of its local space aligns with the crop_bounds on the stage
		this.crop_ui_container.position.set(
			this.position.x + this.crop_bounds.x * this.scale,
			this.position.y + this.crop_bounds.y * this.scale
		);

		// Get the scaled dimensions
		const scaled_width = this.crop_bounds.width * this.scale;
		const scaled_height = this.crop_bounds.height * this.scale;

		// Redraw the outline so it matches the crop_bounds size
		const outline = this.crop_ui_container.getChildAt(0) as Graphics;
		outline
			.clear()
			.rect(0, 0, scaled_width, scaled_height)
			.stroke({ width: 1, color: 0x000000, alignment: 0, alpha: 0.5 });

		// Update the hit area to match the new dimensions
		outline.hitArea = new Rectangle(0, 0, scaled_width, scaled_height);

		// Update handle positions to reflect the cropped area, not the full image
		this.update_handle_positions(scaled_width, scaled_height);
	}

	/**
	 * updates the positions of all handles
	 * @param width - width of the crop area
	 * @param height - height of the crop area
	 */
	private update_handle_positions(width: number, height: number): void {
		if (!this.crop_ui_container) return;

		// Skip the outline (index 0), get corner/edge handles
		const handles = this.crop_ui_container.children.slice(1);

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
	 * sets up event listeners for the crop tool
	 */
	private setup_event_listeners(): void {
		const stage = this.image_editor_context.app.stage;
		stage.eventMode = "static";
		stage.on("pointermove", this.handle_pointer_move.bind(this));
		stage.on("pointerup", this.handle_pointer_up.bind(this));
		stage.on("pointerupoutside", this.handle_pointer_up.bind(this));
	}

	/**
	 * removes event listeners for the crop tool
	 */
	private cleanup_event_listeners(): void {
		const stage = this.image_editor_context.app.stage;

		stage.off("pointermove", this.handle_pointer_move.bind(this));
		stage.off("pointerup", this.handle_pointer_up.bind(this));
		stage.off("pointerupoutside", this.handle_pointer_up.bind(this));
	}

	/**
	 * handles pointer move events
	 * @param event - the pointer event
	 */
	private handle_pointer_move(event: FederatedPointerEvent): void {
		if (this.current_subtool !== "crop") return;

		if (
			this.is_dragging_window &&
			this.drag_start_position &&
			this.drag_start_bounds
		) {
			// Handle window dragging
			const local_pos = this.image_editor_context.image_container.toLocal(
				event.global
			);
			const delta = new Point(
				local_pos.x - this.drag_start_position.x,
				local_pos.y - this.drag_start_position.y
			);

			// Update crop bounds based on drag
			this.crop_bounds = {
				x: this.drag_start_bounds.x + delta.x,
				y: this.drag_start_bounds.y + delta.y,
				width: this.drag_start_bounds.width,
				height: this.drag_start_bounds.height
			};

			// Constrain the bounds
			this.constrain_crop_bounds();

			// Update the mask
			this.update_crop_mask();

			// Make sure to apply mask to the current background image
			if (this.crop_mask && this.image_editor_context.background_image) {
				this.image_editor_context.background_image.setMask(this.crop_mask);
			}

			return;
		}

		// Handle existing resize logic
		if (
			this.is_dragging &&
			this.selected_handle &&
			this.last_pointer_position
		) {
			// Convert from global to local, no extra divide
			const local_pos = this.image_editor_context.image_container.toLocal(
				event.global
			);
			const current_position = new Point(local_pos.x, local_pos.y);

			const delta = new Point(
				current_position.x - this.last_pointer_position.x,
				current_position.y - this.last_pointer_position.y
			);

			this.update_crop_bounds(delta);
			this.last_pointer_position = current_position;
			this.update_crop_mask();
		}
	}

	/**
	 * handles pointer up events
	 */
	private handle_pointer_up(): void {
		if (this.current_subtool !== "crop") return;

		this.is_dragging = false;
		this.is_dragging_window = false;
		this.selected_handle = null;
		this.last_pointer_position = null;
		this.drag_start_position = null;
		this.drag_start_bounds = null;
		this.active_corner_index = -1;
		this.active_edge_index = -1;

		this.notify("change");
	}

	/**
	 * handles the start of window dragging
	 * @param event - the pointer event
	 */
	private handle_window_drag_start(event: FederatedPointerEvent): void {
		if (this.current_subtool !== "crop") return;
		event.stopPropagation();

		this.is_dragging_window = true;
		// Set flag indicating the crop has been manually changed
		this.has_been_manually_changed = true;

		// Store the initial position and bounds
		const local_pos = this.image_editor_context.image_container.toLocal(
			event.global
		);
		this.drag_start_position = new Point(local_pos.x, local_pos.y);
		this.drag_start_bounds = { ...this.crop_bounds };
	}

	/**
	 * @returns whether the crop has been manually changed by the user
	 */
	public get crop_manually_changed(): boolean {
		return this.has_been_manually_changed;
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

	public get_crop_bounds(): {
		x: number;
		y: number;
		crop_dimensions: { width: number; height: number };
		image_dimensions: { width: number; height: number };
	} {
		const { width, height } =
			this.image_editor_context.background_image?.getLocalBounds() ?? {
				width: 0,
				height: 0
			};
		return {
			x: this.crop_bounds.x,
			y: this.crop_bounds.y,
			crop_dimensions: {
				width: this.crop_bounds.width,
				height: this.crop_bounds.height
			},
			image_dimensions: {
				width,
				height
			}
		};
	}

	public get_image(): Promise<Blob | null> {
		if (!this.image_editor_context.background_image)
			return Promise.resolve(null);
		const container = new Container();
		const sprite = new Sprite(
			this.image_editor_context.background_image.texture
		);
		container.addChild(sprite);

		return get_canvas_blob(
			this.image_editor_context.app.renderer,
			container,
			this.crop_bounds
		);
	}
}
