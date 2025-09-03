import {
	Container,
	Graphics,
	Point,
	Rectangle,
	FederatedPointerEvent,
	type FederatedOptions
} from "pixi.js";
import { type ImageEditorContext, type Tool } from "../core/editor";
import { type Tool as ToolbarTool, type Subtool } from "../Toolbar.svelte";
import { type Command } from "../core/commands";

/**
 * Command that handles resizing the image and supports undo/redo
 */
export class ResizeCommand implements Command {
	private original_width: number;
	private original_height: number;
	private original_x: number;
	private original_y: number;

	private new_width: number;
	private new_height: number;
	private new_x: number;
	private new_y: number;
	private reset_ui: () => void;
	name: string;

	constructor(
		private context: ImageEditorContext,
		original_state: { width: number; height: number; x: number; y: number },
		new_state: { width: number; height: number; x: number; y: number },
		reset_ui: () => void
	) {
		this.name = "Resize";
		this.original_width = original_state.width;
		this.original_height = original_state.height;
		this.original_x = original_state.x;
		this.original_y = original_state.y;

		this.new_width = new_state.width;
		this.new_height = new_state.height;
		this.new_x = new_state.x;
		this.new_y = new_state.y;
		this.reset_ui = reset_ui;
	}

	async execute(context?: ImageEditorContext): Promise<void> {
		if (context) {
			this.context = context;
		}

		if (!this.context.background_image) return;

		this.context.background_image.width = this.new_width;
		this.context.background_image.height = this.new_height;
		this.context.background_image.position.set(this.new_x, this.new_y);

		this.reset_ui();
	}

	async undo(): Promise<void> {
		if (!this.context.background_image) return;

		this.context.background_image.width = this.original_width;
		this.context.background_image.height = this.original_height;
		this.context.background_image.position.set(
			this.original_x,
			this.original_y
		);

		this.reset_ui();
	}
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
	private current_cursor: FederatedOptions["cursor"] = "unset";
	private readonly CORNER_SIZE = 25;
	private readonly LINE_THICKNESS = 5;
	private readonly HANDLE_COLOR = 0x000000;
	private readonly HIT_AREA_SIZE = 40;
	private borderRegion = 0;

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
	private dom_mousedown_handler: ((e: MouseEvent) => void) | null = null;
	private dom_mousemove_handler: ((e: MouseEvent) => void) | null = null;
	private dom_mouseup_handler: ((e: MouseEvent) => void) | null = null;
	private event_callbacks: Map<string, (() => void)[]> = new Map();
	private last_scale = 1;

	private original_state: {
		width: number;
		height: number;
		x: number;
		y: number;
	} | null = null;

	/**
	 * @method setup
	 * @async
	 * @description Sets up the resize tool with the given context and tool/subtool
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

		if (context.background_image) {
			if ((context.background_image as any).borderRegion !== undefined) {
				this.borderRegion = (context.background_image as any).borderRegion;
			} else {
				const bg = context.background_image;
				const container = context.image_container;

				const isHorizontallyCentered =
					Math.abs(bg.position.x - (container.width - bg.width) / 2) < 2;
				const isVerticallyCentered =
					Math.abs(bg.position.y - (container.height - bg.height) / 2) < 2;

				if (!isHorizontallyCentered || !isVerticallyCentered) {
					this.borderRegion = Math.max(bg.position.x, bg.position.y);

					(context.background_image as any).borderRegion = this.borderRegion;
				}
			}
		}

		context.dimensions.subscribe((dimensions) => {
			this.dimensions = dimensions;
			if (this.resize_ui_container) {
				this.update_resize_ui();
			}
		});

		context.position.subscribe((position) => {
			this.position = position;
			if (
				this.resize_ui_container &&
				this.current_tool === "image" &&
				this.current_subtool === "size"
			) {
				this.update_resize_ui();
			}
		});

		context.scale.subscribe((scale) => {
			this.scale = scale;
			if (
				this.resize_ui_container &&
				this.current_tool === "image" &&
				this.current_subtool === "size"
			) {
				this.update_resize_ui();
			}
		});

		await this.init_resize_ui();
		this.setup_event_listeners();

		if (
			this.current_subtool === "size" &&
			this.image_editor_context.background_image
		) {
			const bg = this.image_editor_context.background_image;
			const container = this.image_editor_context.image_container;

			const bg_width = bg.width;
			const bg_height = bg.height;
			const container_bounds = container.getLocalBounds();
			const container_width = container_bounds.width;
			const container_height = container_bounds.height;

			const min_x = -(bg_width - container_width);
			const min_y = -(bg_height - container_height);
			const max_x = 0;
			const max_y = 0;

			const x_out_of_bounds =
				bg_width > container_width &&
				(bg.position.x < min_x || bg.position.x > max_x);
			const y_out_of_bounds =
				bg_height > container_height &&
				(bg.position.y < min_y || bg.position.y > max_y);

			if (x_out_of_bounds || y_out_of_bounds) {
				this.apply_boundary_constraints();
			}
		}
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

		if (tool === "image" && subtool === "size") {
			if (this.image_editor_context.background_image) {
				const storedBorderRegion = (
					this.image_editor_context.background_image as any
				).borderRegion;
				if (typeof storedBorderRegion === "number" && storedBorderRegion > 0) {
					this.borderRegion = storedBorderRegion;
				}
			}

			this.show_resize_ui();

			if (this.image_editor_context.background_image) {
				const bg = this.image_editor_context.background_image;
				const container = this.image_editor_context.image_container;

				const bg_width = bg.width;
				const bg_height = bg.height;
				const container_bounds = container.getLocalBounds();
				const container_width = container_bounds.width;
				const container_height = container_bounds.height;

				const effectiveWidth = container_width - this.borderRegion * 2;
				const effectiveHeight = container_height - this.borderRegion * 2;

				const min_x =
					bg_width > effectiveWidth
						? -(bg_width - effectiveWidth) + this.borderRegion
						: this.borderRegion;
				const max_x =
					bg_width > effectiveWidth
						? this.borderRegion
						: container_width - bg_width - this.borderRegion;

				const min_y =
					bg_height > effectiveHeight
						? -(bg_height - effectiveHeight) + this.borderRegion
						: this.borderRegion;
				const max_y =
					bg_height > effectiveHeight
						? this.borderRegion
						: container_height - bg_height - this.borderRegion;

				const x_out_of_bounds = bg.position.x < min_x || bg.position.x > max_x;
				const y_out_of_bounds = bg.position.y < min_y || bg.position.y > max_y;

				if (x_out_of_bounds || y_out_of_bounds) {
					this.apply_boundary_constraints();
				}
			}
		} else {
			this.hide_resize_ui();
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
		this.resize_ui_container = this.make_resize_ui(
			this.dimensions.width * this.scale,
			this.dimensions.height * this.scale
		);

		this.resize_ui_container.position.set(this.position.x, this.position.y);

		this.resize_ui_container.visible = false;

		this.image_editor_context.app.stage.addChild(this.resize_ui_container);
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

		const outline = new Graphics().rect(0, 0, width, height).stroke({
			width: 1,
			color: 0x000000,
			alignment: 0,
			alpha: 0.3
		});

		const dotted_outline = new Graphics();

		dotted_outline.rect(0, 0, width, height).stroke({
			width: 1,
			color: 0x000000,
			alpha: 0.7,
			pixelLine: true
		});

		const dash_length = 5;
		const gap_length = 5;
		const total_length = dash_length + gap_length;

		for (let x = 0; x < width; x += total_length * 2) {
			dotted_outline
				.rect(x, 0, Math.min(dash_length, width - x), 1)
				.fill(0x000000);

			dotted_outline
				.rect(x, height - 1, Math.min(dash_length, width - x), 1)
				.fill(0x000000);
		}

		for (let y = 0; y < height; y += total_length * 2) {
			dotted_outline
				.rect(0, y, 1, Math.min(dash_length, height - y))
				.fill(0x000000);

			dotted_outline
				.rect(width - 1, y, 1, Math.min(dash_length, height - y))
				.fill(0x000000);
		}

		resize_container.addChild(outline);
		resize_container.addChild(dotted_outline);

		const move_area = new Graphics()
			.rect(0, 0, width, height)
			.fill(0xffffff, 0);
		move_area.eventMode = "static";
		move_area.cursor = "move";
		resize_container.addChild(move_area);

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
		const handle_size = is_edge ? 8 : 10;
		handle_graphics
			.rect(-handle_size / 2, -handle_size / 2, handle_size, handle_size)
			.fill(0xffffff)
			.stroke({ width: 1, color: this.HANDLE_COLOR });
		handle.addChild(handle_graphics);

		const hit_size = is_edge ? this.HIT_AREA_SIZE * 1.5 : this.HIT_AREA_SIZE;
		handle.hitArea = new Rectangle(
			-hit_size / 2,
			-hit_size / 2,
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
		[-1, 1].forEach((i, index) => {
			const handle = this.create_handle(true);
			handle.rotation = 0;

			handle.on("pointerdown", (event: FederatedPointerEvent) => {
				this.handle_pointer_down(event, handle, -1, index);
			});

			handle.x = width / 2;
			handle.y = i < 0 ? 0 : height;
			handle.cursor = "ns-resize";

			container.addChild(handle);
		});

		[-1, 1].forEach((i, index) => {
			const handle = this.create_handle(true);
			handle.rotation = 0;
			handle.on("pointerdown", (event: FederatedPointerEvent) => {
				this.handle_pointer_down(event, handle, -1, index + 2);
			});

			handle.x = i < 0 ? 0 : width;
			handle.y = height / 2;
			handle.cursor = "ew-resize";
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
			{ x: 0, y: 0, cursor: "nwse-resize" },
			{ x: width, y: 0, cursor: "nesw-resize" },
			{ x: 0, y: height, cursor: "nesw-resize" },
			{ x: width, y: height, cursor: "nwse-resize" }
		];

		corners.forEach(({ x, y, cursor }, i) => {
			const corner = this.create_handle(false);
			corner.x = x;
			corner.y = y;

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
		if (this.current_subtool !== "size") return;

		event.stopPropagation();

		this.is_dragging = true;
		this.selected_handle = handle;
		this.active_corner_index = corner_index;
		this.active_edge_index = edge_index;

		const local_pos = this.image_editor_context.image_container.toLocal(
			event.global
		);
		this.last_pointer_position = new Point(local_pos.x, local_pos.y);

		if (this.image_editor_context.background_image) {
			const bg = this.image_editor_context.background_image;
			this.original_state = {
				width: bg.width,
				height: bg.height,
				x: bg.position.x,
				y: bg.position.y
			};
		}
	}

	/**
	 * Maintains aspect ratio during resizing
	 * @param new_width - The new width
	 * @param new_height - The new height
	 * @param original_aspect_ratio - The original aspect ratio
	 * @param delta - The delta to apply
	 * @returns The adjusted dimensions
	 */
	private maintain_aspect_ratio(
		new_width: number,
		new_height: number,
		original_aspect_ratio: number,
		delta: Point
	): { width: number; height: number } {
		const abs_delta_x = Math.abs(delta.x);
		const abs_delta_y = Math.abs(delta.y);

		if (abs_delta_x > abs_delta_y * 1.2) {
			new_height = new_width / original_aspect_ratio;
		} else if (abs_delta_y > abs_delta_x * 1.2) {
			new_width = new_height * original_aspect_ratio;
		} else {
			if (new_width / original_aspect_ratio > new_height) {
				new_height = new_width / original_aspect_ratio;
			} else {
				new_width = new_height * original_aspect_ratio;
			}
		}

		return { width: new_width, height: new_height };
	}

	/**
	 * Limits dimensions based on constraints
	 * @param width - The width to limit
	 * @param height - The height to limit
	 * @param maintain_aspect_ratio - Whether to maintain aspect ratio
	 * @returns The limited dimensions
	 */
	private limit_dimensions(
		width: number,
		height: number,
		maintain_aspect_ratio: boolean
	): { width: number; height: number } {
		const max_width = this.dimensions.width;
		const max_height = this.dimensions.height;

		let new_width = width;
		let new_height = height;

		if (new_width > max_width) {
			if (maintain_aspect_ratio && this.active_corner_index !== -1) {
				new_height = (max_width / new_width) * new_height;
			}
			new_width = max_width;
		}

		if (new_height > max_height) {
			if (maintain_aspect_ratio && this.active_corner_index !== -1) {
				new_width = (max_height / new_height) * new_width;
			}
			new_height = max_height;
		}

		new_width = Math.max(20, new_width);
		new_height = Math.max(20, new_height);

		return { width: new_width, height: new_height };
	}

	/**
	 * Calculates position deltas based on dimension changes
	 * @param old_width - The original width
	 * @param old_height - The original height
	 * @param new_width - The new width
	 * @param new_height - The new height
	 * @returns Object containing x and y position deltas
	 */
	private calculate_position_deltas(
		old_width: number,
		old_height: number,
		new_width: number,
		new_height: number
	): { x: number; y: number } {
		let delta_x = 0;
		let delta_y = 0;

		if (this.active_corner_index === 0 || this.active_edge_index === 2) {
			delta_x = old_width - new_width;
		} else if (this.active_corner_index === 2) {
			delta_x = old_width - new_width;
			delta_y = 0;
		}

		if (
			this.active_corner_index === 0 ||
			this.active_corner_index === 1 ||
			this.active_edge_index === 0
		) {
			delta_y = old_height - new_height;
		}

		return { x: delta_x, y: delta_y };
	}

	/**
	 * Applies boundary constraints to keep the image within the container
	 * @private
	 */
	private apply_boundary_constraints(): void {
		if (!this.image_editor_context.background_image) return;

		const bg = this.image_editor_context.background_image;
		const image_container = this.image_editor_context.image_container;

		let new_x = bg.position.x;
		let new_y = bg.position.y;

		const container_width = image_container.width;
		const container_height = image_container.height;
		const bg_width = bg.width;
		const bg_height = bg.height;

		const effectiveWidth = container_width - this.borderRegion * 2;
		const effectiveHeight = container_height - this.borderRegion * 2;

		if (bg_width > effectiveWidth) {
			const min_x = -(bg_width - effectiveWidth) + this.borderRegion;
			const max_x = this.borderRegion;
			new_x = Math.max(min_x, Math.min(max_x, new_x));
		} else {
			const min_x = this.borderRegion;
			const max_x = container_width - bg_width - this.borderRegion;
			if (new_x < min_x || new_x > max_x) {
				new_x = Math.max(min_x, Math.min(max_x, new_x));
			}
		}

		if (bg_height > effectiveHeight) {
			const min_y = -(bg_height - effectiveHeight) + this.borderRegion;
			const max_y = this.borderRegion;
			new_y = Math.max(min_y, Math.min(max_y, new_y));
		} else {
			const min_y = this.borderRegion;
			const max_y = container_height - bg_height - this.borderRegion;
			if (new_y < min_y || new_y > max_y) {
				new_y = Math.max(min_y, Math.min(max_y, new_y));
			}
		}

		bg.position.set(new_x, new_y);

		if (this.resize_ui_container) {
			const total_x = image_container.position.x + new_x * this.scale;
			const total_y = image_container.position.y + new_y * this.scale;
			this.resize_ui_container.position.set(total_x, total_y);
		}
	}

	/**
	 * Updates the resize bounds based on the delta
	 * @param delta - The delta to apply
	 * @param maintain_aspect_ratio - Whether to maintain the aspect ratio
	 */
	private update_resize_bounds(
		delta: Point,
		maintain_aspect_ratio = false
	): void {
		const background_image = this.image_editor_context.background_image;

		if (!background_image) return;

		const original_width = background_image.width;
		const original_height = background_image.height;
		const original_x = background_image.position.x;
		const original_y = background_image.position.y;
		const original_aspect_ratio = original_width / original_height;

		let current_position: Point;

		if (this.active_corner_index !== -1) {
			switch (this.active_corner_index) {
				case 0:
					current_position = new Point(
						original_x - delta.x,
						original_y - delta.y
					);
					break;
				case 1:
					current_position = new Point(
						original_x + original_width + delta.x,
						original_y - delta.y
					);
					break;
				case 2:
					current_position = new Point(
						original_x - delta.x,
						original_y + original_height + delta.y
					);
					break;
				case 3:
					current_position = new Point(
						original_x + original_width + delta.x,
						original_y + original_height + delta.y
					);
					break;
				default:
					return;
			}

			const dimensions = this.handle_direct_corner_resize(
				current_position,
				original_width,
				original_height,
				original_x,
				original_y,
				original_aspect_ratio,
				maintain_aspect_ratio
			);

			background_image.width = dimensions.width;
			background_image.height = dimensions.height;
			background_image.position.set(dimensions.x, dimensions.y);
		} else if (this.active_edge_index !== -1) {
			switch (this.active_edge_index) {
				case 0:
					current_position = new Point(
						original_x + original_width / 2,
						original_y - delta.y
					);
					break;
				case 1:
					current_position = new Point(
						original_x + original_width / 2,
						original_y + original_height + delta.y
					);
					break;
				case 2:
					current_position = new Point(
						original_x - delta.x,
						original_y + original_height / 2
					);
					break;
				case 3:
					current_position = new Point(
						original_x + original_width + delta.x,
						original_y + original_height / 2
					);
					break;
				default:
					return;
			}

			const dimensions = this.handle_direct_edge_resize(
				current_position,
				original_width,
				original_height,
				original_x,
				original_y
			);

			background_image.width = dimensions.width;
			background_image.height = dimensions.height;
			background_image.position.set(dimensions.x, dimensions.y);
		}

		this.update_resize_ui();
	}

	/**
	 * updates the resize ui position and dimensions
	 */
	private update_resize_ui(): void {
		if (
			!this.resize_ui_container ||
			!this.image_editor_context.background_image ||
			!this.image_editor_context.background_image.position
		)
			return;

		const background_image = this.image_editor_context.background_image;
		const image_container = this.image_editor_context.image_container;

		const container_global_pos = image_container.getGlobalPosition();

		const bg_pos_x = background_image.position.x * this.scale;
		const bg_pos_y = background_image.position.y * this.scale;

		this.resize_ui_container.position.set(
			container_global_pos.x + bg_pos_x,
			container_global_pos.y + bg_pos_y
		);

		const scaled_width = background_image.width * this.scale;
		const scaled_height = background_image.height * this.scale;

		const outline = this.resize_ui_container.getChildAt(0) as Graphics;
		outline
			.clear()
			.rect(0, 0, scaled_width, scaled_height)
			.stroke({ width: 1, color: 0x000000, alignment: 0, alpha: 0.3 });

		const dotted_outline = this.resize_ui_container.getChildAt(1) as Graphics;
		dotted_outline.clear();

		dotted_outline.rect(0, 0, scaled_width, scaled_height).stroke({
			width: 1,
			color: 0x000000,
			alpha: 0.7,
			pixelLine: true
		});

		if (
			!this.is_dragging &&
			!this.is_moving &&
			Math.abs(this.scale - this.last_scale) < 0.001
		) {
			const dash_length = 5;
			const gap_length = 5;
			const total_length = dash_length + gap_length;

			for (let x = 0; x < scaled_width; x += total_length * 2) {
				dotted_outline
					.rect(x, 0, Math.min(dash_length, scaled_width - x), 1)
					.fill(0x000000);

				dotted_outline
					.rect(
						x,
						scaled_height - 1,
						Math.min(dash_length, scaled_width - x),
						1
					)
					.fill(0x000000);
			}

			for (let y = 0; y < scaled_height; y += total_length * 2) {
				dotted_outline
					.rect(0, y, 1, Math.min(dash_length, scaled_height - y))
					.fill(0x000000);

				dotted_outline
					.rect(
						scaled_width - 1,
						y,
						1,
						Math.min(dash_length, scaled_height - y)
					)
					.fill(0x000000);
			}
		}

		this.last_scale = this.scale;

		const move_area = this.resize_ui_container.getChildAt(2) as Graphics;
		move_area.clear().rect(0, 0, scaled_width, scaled_height).fill(0xffffff, 0);

		this.update_handle_positions(scaled_width, scaled_height);
	}

	/**
	 * updates the positions of all handles
	 * @param width - width of the resize area
	 * @param height - height of the resize area
	 */
	private update_handle_positions(width: number, height: number): void {
		if (!this.resize_ui_container) return;

		const handles = this.resize_ui_container.children.slice(3);

		const move_area = this.resize_ui_container.getChildAt(2) as Graphics;
		move_area.clear().rect(0, 0, width, height).fill(0xffffff, 0);

		const corners = handles.slice(0, 4);
		const cornerPositions = [
			{ x: 0, y: 0 },
			{ x: width, y: 0 },
			{ x: 0, y: height },
			{ x: width, y: height }
		];

		corners.forEach((handle, i) => {
			handle.position.set(cornerPositions[i].x, cornerPositions[i].y);
		});

		const edges = handles.slice(4);
		edges.forEach((handle, i) => {
			if (i < 2) {
				handle.position.set(width / 2, i === 0 ? 0 : height);
			} else {
				handle.position.set(i === 2 ? 0 : width, height / 2);
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

		this.setup_dom_event_listeners();
	}

	/**
	 * Sets up direct DOM event listeners for dragging the background image
	 */
	private setup_dom_event_listeners(): void {
		this.cleanup_dom_event_listeners();

		const canvas = this.image_editor_context.app.canvas;

		this.dom_mousedown_handler = (e: MouseEvent) => {
			if (this.current_subtool !== "size") return;

			if (this.is_dragging || this.selected_handle) return;

			if (!this.image_editor_context.background_image) return;

			const bg = this.image_editor_context.background_image;

			const container = this.image_editor_context.image_container;
			const containerBounds = container.getBounds();

			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const localX = (x - containerBounds.x) / this.scale;
			const localY = (y - containerBounds.y) / this.scale;

			if (
				localX >= bg.position.x &&
				localX <= bg.position.x + bg.width &&
				localY >= bg.position.y &&
				localY <= bg.position.y + bg.height
			) {
				this.is_moving = true;

				this.last_pointer_position = new Point(localX, localY);

				this.original_state = {
					width: bg.width,
					height: bg.height,
					x: bg.position.x,
					y: bg.position.y
				};

				e.preventDefault();
				e.stopPropagation();
			}
		};

		this.dom_mousemove_handler = (e: MouseEvent) => {
			if (this.current_subtool !== "size" || !this.is_moving) return;

			if (
				!this.last_pointer_position ||
				!this.image_editor_context.background_image
			)
				return;

			const container = this.image_editor_context.image_container;
			const containerBounds = container.getBounds();

			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const localX = (x - containerBounds.x) / this.scale;
			const localY = (y - containerBounds.y) / this.scale;

			const current_position = new Point(localX, localY);

			this.handle_image_dragging(current_position);

			this.last_pointer_position = current_position;

			e.preventDefault();
			e.stopPropagation();
		};

		this.dom_mouseup_handler = (e: MouseEvent) => {
			if (this.current_subtool !== "size") return;

			if (this.original_state && this.image_editor_context.background_image) {
				const bg = this.image_editor_context.background_image;
				const new_state = {
					width: bg.width,
					height: bg.height,
					x: bg.position.x,
					y: bg.position.y
				};

				if (
					this.original_state.width !== new_state.width ||
					this.original_state.height !== new_state.height ||
					this.original_state.x !== new_state.x ||
					this.original_state.y !== new_state.y
				) {
					const resize_command = new ResizeCommand(
						this.image_editor_context,
						this.original_state,
						new_state,
						this.update_resize_ui.bind(this)
					);

					this.image_editor_context.execute_command(resize_command);
				}

				this.original_state = null;
			}

			this.is_moving = false;
			this.last_pointer_position = null;

			this.update_resize_ui();

			e.preventDefault();
			e.stopPropagation();
		};

		canvas.addEventListener("mousedown", this.dom_mousedown_handler);
		window.addEventListener("mousemove", this.dom_mousemove_handler);
		window.addEventListener("mouseup", this.dom_mouseup_handler);
	}

	/**
	 * Cleans up DOM event listeners
	 */
	private cleanup_dom_event_listeners(): void {
		const canvas = this.image_editor_context.app.canvas;

		if (this.dom_mousedown_handler) {
			canvas.removeEventListener("mousedown", this.dom_mousedown_handler);
			this.dom_mousedown_handler = null;
		}

		if (this.dom_mousemove_handler) {
			window.removeEventListener("mousemove", this.dom_mousemove_handler);
			this.dom_mousemove_handler = null;
		}

		if (this.dom_mouseup_handler) {
			window.removeEventListener("mouseup", this.dom_mouseup_handler);
			this.dom_mouseup_handler = null;
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

		this.cleanup_dom_event_listeners();
	}

	/**
	 * Handles pointer move events
	 */
	private handle_pointer_move(event: FederatedPointerEvent): void {
		if (this.current_subtool !== "size") return;

		const local_pos = this.image_editor_context.image_container.toLocal(
			event.global
		);
		const current_position = new Point(local_pos.x, local_pos.y);

		if (this.is_moving && this.last_pointer_position) {
			this.handle_image_dragging(current_position);

			this.last_pointer_position = current_position;
		} else if (this.is_dragging && this.selected_handle) {
			if (!this.image_editor_context.background_image) return;

			const bg = this.image_editor_context.background_image;
			const maintain_aspect_ratio =
				this.active_corner_index !== -1 && !event.shiftKey;

			const original_width = bg.width;
			const original_height = bg.height;
			const original_x = bg.position.x;
			const original_y = bg.position.y;
			const original_aspect_ratio = original_width / original_height;

			let dimensions: { width: number; height: number; x: number; y: number };

			if (this.active_corner_index !== -1) {
				dimensions = this.handle_direct_corner_resize(
					current_position,
					original_width,
					original_height,
					original_x,
					original_y,
					original_aspect_ratio,
					maintain_aspect_ratio
				);
			} else if (this.active_edge_index !== -1) {
				dimensions = this.handle_direct_edge_resize(
					current_position,
					original_width,
					original_height,
					original_x,
					original_y
				);
			} else {
				return;
			}

			dimensions = this.limit_dimensions_to_container(
				dimensions,
				original_x,
				original_y,
				original_width,
				original_height,
				maintain_aspect_ratio
			);

			bg.width = dimensions.width;
			bg.height = dimensions.height;
			bg.position.set(dimensions.x, dimensions.y);

			this.update_resize_ui();

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
		this.active_corner_index = -1;
		this.active_edge_index = -1;

		this.update_resize_ui();
		this.notify("change");
	}

	/**
	 * Handles dragging of the background image
	 * @param current_position - The current pointer position
	 * @private
	 */
	private handle_image_dragging(current_position: Point): void {
		if (
			!this.last_pointer_position ||
			!this.image_editor_context.background_image
		) {
			return;
		}

		const bg = this.image_editor_context.background_image;
		const image_container =
			this.image_editor_context.image_container.getLocalBounds();

		const dx = current_position.x - this.last_pointer_position.x;
		const dy = current_position.y - this.last_pointer_position.y;

		let new_x = bg.position.x + dx;
		let new_y = bg.position.y + dy;

		const container_width = image_container.width;
		const container_height = image_container.height;
		const bg_width = bg.width;
		const bg_height = bg.height;

		const effectiveWidth = container_width - this.borderRegion * 2;
		const effectiveHeight = container_height - this.borderRegion * 2;

		if (bg_width > effectiveWidth) {
			const min_x = -(bg_width - effectiveWidth) + this.borderRegion;
			const max_x = this.borderRegion;
			new_x = Math.max(min_x, Math.min(max_x, new_x));
		} else {
			const min_x = this.borderRegion;
			const max_x = container_width - bg_width - this.borderRegion;
			new_x = Math.max(min_x, Math.min(max_x, new_x));
		}

		if (bg_height > effectiveHeight) {
			const min_y = -(bg_height - effectiveHeight) + this.borderRegion;
			const max_y = this.borderRegion;
			new_y = Math.max(min_y, Math.min(max_y, new_y));
		} else {
			const min_y = this.borderRegion;
			const max_y = container_height - bg_height - this.borderRegion;
			new_y = Math.max(min_y, Math.min(max_y, new_y));
		}

		bg.position.set(new_x, new_y);

		this.update_resize_ui();
	}

	/**
	 * Handles corner resizing
	 * @param current_position - The current mouse position
	 * @param original_width - The original width
	 * @param original_height - The original height
	 * @param original_x - The original x position
	 * @param original_y - The original y position
	 * @param original_aspect_ratio - The original aspect ratio
	 * @param maintain_aspect_ratio - Whether to maintain aspect ratio
	 * @returns The new dimensions and position
	 * @private
	 */
	private handle_direct_corner_resize(
		current_position: Point,
		original_width: number,
		original_height: number,
		original_x: number,
		original_y: number,
		original_aspect_ratio: number,
		maintain_aspect_ratio: boolean
	): { width: number; height: number; x: number; y: number } {
		let raw_width = 0;
		let raw_height = 0;
		let new_x = original_x;
		let new_y = original_y;

		switch (this.active_corner_index) {
			case 0:
				raw_width = original_x + original_width - current_position.x;
				raw_height = original_y + original_height - current_position.y;
				break;
			case 1:
				raw_width = current_position.x - original_x;
				raw_height = original_y + original_height - current_position.y;
				break;
			case 2:
				raw_width = original_x + original_width - current_position.x;
				raw_height = current_position.y - original_y;
				break;
			case 3:
				raw_width = current_position.x - original_x;
				raw_height = current_position.y - original_y;
				break;
		}

		raw_width = Math.max(20, raw_width);
		raw_height = Math.max(20, raw_height);

		let new_width = raw_width;
		let new_height = raw_height;

		if (maintain_aspect_ratio) {
			const diagonal_vector = {
				x: current_position.x - (original_x + original_width / 2),
				y: current_position.y - (original_y + original_height / 2)
			};

			const angle = Math.abs(Math.atan2(diagonal_vector.y, diagonal_vector.x));

			if (angle < Math.PI / 4 || angle > (3 * Math.PI) / 4) {
				new_height = new_width / original_aspect_ratio;
			} else {
				new_width = new_height * original_aspect_ratio;
			}
		}

		switch (this.active_corner_index) {
			case 0:
				new_x = original_x + original_width - new_width;
				new_y = original_y + original_height - new_height;
				break;
			case 1:
				new_y = original_y + original_height - new_height;
				break;
			case 2:
				new_x = original_x + original_width - new_width;
				break;
			case 3:
				break;
		}

		return { width: new_width, height: new_height, x: new_x, y: new_y };
	}

	/**
	 * Handles edge resizing
	 * @param current_position - The current mouse position
	 * @param original_width - The original width
	 * @param original_height - The original height
	 * @param original_x - The original x position
	 * @param original_y - The original y position
	 * @returns The new dimensions and position
	 * @private
	 */
	private handle_direct_edge_resize(
		current_position: Point,
		original_width: number,
		original_height: number,
		original_x: number,
		original_y: number
	): { width: number; height: number; x: number; y: number } {
		let new_width = original_width;
		let new_height = original_height;
		let new_x = original_x;
		let new_y = original_y;

		switch (this.active_edge_index) {
			case 0:
				new_height = Math.max(
					20,
					original_y + original_height - current_position.y
				);
				new_y = current_position.y;
				break;
			case 1:
				new_height = Math.max(20, current_position.y - original_y);
				break;
			case 2:
				new_width = Math.max(
					20,
					original_x + original_width - current_position.x
				);
				new_x = current_position.x;
				break;
			case 3:
				new_width = Math.max(20, current_position.x - original_x);
				break;
		}

		return { width: new_width, height: new_height, x: new_x, y: new_y };
	}

	/**
	 * Limits dimensions to container size
	 * @param dimensions - The dimensions to limit
	 * @param original_x - The original x position
	 * @param original_y - The original y position
	 * @param original_width - The original width
	 * @param original_height - The original height
	 * @param maintain_aspect_ratio - Whether to maintain aspect ratio
	 * @returns The limited dimensions and position
	 * @private
	 */
	private limit_dimensions_to_container(
		dimensions: { width: number; height: number; x: number; y: number },
		original_x: number,
		original_y: number,
		original_width: number,
		original_height: number,
		maintain_aspect_ratio: boolean
	): { width: number; height: number; x: number; y: number } {
		let {
			width: new_width,
			height: new_height,
			x: new_x,
			y: new_y
		} = dimensions;

		const effective_container_width =
			this.dimensions.width - this.borderRegion * 2;
		const effective_container_height =
			this.dimensions.height - this.borderRegion * 2;

		const pre_limit_width = new_width;
		const pre_limit_height = new_height;

		const size_limited = this.apply_size_limits(
			new_width,
			new_height,
			effective_container_width,
			effective_container_height,
			maintain_aspect_ratio,
			pre_limit_width / pre_limit_height
		);

		new_width = size_limited.width;
		new_height = size_limited.height;

		const position_adjusted = this.adjust_position_for_resizing(
			new_width,
			new_height,
			original_x,
			original_y,
			original_width,
			original_height
		);

		new_x = position_adjusted.x;
		new_y = position_adjusted.y;

		const border_constrained = this.apply_border_constraints(
			new_width,
			new_height,
			new_x,
			new_y,
			maintain_aspect_ratio,
			pre_limit_width / pre_limit_height
		);

		return border_constrained;
	}

	/**
	 * Apply size limits to ensure dimensions don't exceed container
	 * @private
	 */
	private apply_size_limits(
		width: number,
		height: number,
		max_width: number,
		max_height: number,
		maintain_aspect_ratio: boolean,
		aspect_ratio: number
	): { width: number; height: number } {
		let new_width = width;
		let new_height = height;

		const needs_width_limit = new_width > max_width;
		const needs_height_limit = new_height > max_height;

		if (needs_width_limit && needs_height_limit) {
			const width_scale = max_width / new_width;
			const height_scale = max_height / new_height;

			if (width_scale < height_scale) {
				new_width = max_width;
				if (maintain_aspect_ratio) {
					new_height = new_width / aspect_ratio;
				}
			} else {
				new_height = max_height;
				if (maintain_aspect_ratio) {
					new_width = new_height * aspect_ratio;
				}
			}
		} else if (needs_width_limit) {
			new_width = max_width;
			if (maintain_aspect_ratio) {
				new_height = new_width / aspect_ratio;
			}
		} else if (needs_height_limit) {
			new_height = max_height;
			if (maintain_aspect_ratio) {
				new_width = new_height * aspect_ratio;
			}
		}

		return { width: new_width, height: new_height };
	}

	/**
	 * Adjust position based on which handles are being dragged
	 * @private
	 */
	private adjust_position_for_resizing(
		new_width: number,
		new_height: number,
		original_x: number,
		original_y: number,
		original_width: number,
		original_height: number
	): { x: number; y: number } {
		let new_x = original_x;
		let new_y = original_y;

		switch (this.active_corner_index) {
			case 0:
				new_x = original_x + original_width - new_width;
				new_y = original_y + original_height - new_height;
				break;
			case 1:
				new_y = original_y + original_height - new_height;
				break;
			case 2:
				new_x = original_x + original_width - new_width;
				break;
			case 3:
				break;
		}

		if (this.active_edge_index !== -1) {
			switch (this.active_edge_index) {
				case 0:
					new_y = original_y + original_height - new_height;
					break;
				case 2:
					new_x = original_x + original_width - new_width;
					break;
			}
		}

		return { x: new_x, y: new_y };
	}

	/**
	 * Apply border region constraints to prevent image from intruding on border
	 * @private
	 */
	private apply_border_constraints(
		width: number,
		height: number,
		x: number,
		y: number,
		maintain_aspect_ratio: boolean,
		aspect_ratio: number
	): { width: number; height: number; x: number; y: number } {
		const top_left_constrained = this.apply_top_left_constraints(
			width,
			height,
			x,
			y,
			maintain_aspect_ratio,
			aspect_ratio
		);

		const all_constrained = this.apply_bottom_right_constraints(
			top_left_constrained.width,
			top_left_constrained.height,
			top_left_constrained.x,
			top_left_constrained.y,
			maintain_aspect_ratio,
			aspect_ratio
		);

		all_constrained.width = Math.max(20, all_constrained.width);
		all_constrained.height = Math.max(20, all_constrained.height);

		return all_constrained;
	}

	/**
	 * Apply top and left border constraints
	 * @private
	 */
	private apply_top_left_constraints(
		width: number,
		height: number,
		x: number,
		y: number,
		maintain_aspect_ratio: boolean,
		aspect_ratio: number
	): { width: number; height: number; x: number; y: number } {
		let new_width = width;
		let new_height = height;
		let new_x = x;
		let new_y = y;

		if (new_x < this.borderRegion) {
			if (
				this.active_corner_index === 0 ||
				this.active_corner_index === 2 ||
				this.active_edge_index === 2
			) {
				new_width -= this.borderRegion - new_x;
				if (maintain_aspect_ratio) {
					new_height = new_width / aspect_ratio;
				}
			}
			new_x = this.borderRegion;
		}

		if (new_y < this.borderRegion) {
			if (
				this.active_corner_index === 0 ||
				this.active_corner_index === 1 ||
				this.active_edge_index === 0
			) {
				new_height -= this.borderRegion - new_y;
				if (maintain_aspect_ratio) {
					new_width = new_height * aspect_ratio;
				}
			}
			new_y = this.borderRegion;
		}

		return { width: new_width, height: new_height, x: new_x, y: new_y };
	}

	/**
	 * Apply bottom and right border constraints
	 * @private
	 */
	private apply_bottom_right_constraints(
		width: number,
		height: number,
		x: number,
		y: number,
		maintain_aspect_ratio: boolean,
		aspect_ratio: number
	): { width: number; height: number; x: number; y: number } {
		let new_width = width;
		let new_height = height;
		let new_x = x;
		let new_y = y;

		if (new_x + new_width > this.dimensions.width - this.borderRegion) {
			if (
				this.active_corner_index === 1 ||
				this.active_corner_index === 3 ||
				this.active_edge_index === 3
			) {
				new_width = this.dimensions.width - this.borderRegion - new_x;
				if (maintain_aspect_ratio) {
					new_height = new_width / aspect_ratio;
				}
			} else {
				const right_edge = new_x + new_width;
				const excess = right_edge - (this.dimensions.width - this.borderRegion);
				new_x = Math.max(this.borderRegion, new_x - excess);
			}
		}

		if (new_y + new_height > this.dimensions.height - this.borderRegion) {
			if (
				this.active_corner_index === 2 ||
				this.active_corner_index === 3 ||
				this.active_edge_index === 1
			) {
				new_height = this.dimensions.height - this.borderRegion - new_y;
				if (maintain_aspect_ratio) {
					new_width = new_height * aspect_ratio;
				}
			} else {
				const bottom_edge = new_y + new_height;
				const excess =
					bottom_edge - (this.dimensions.height - this.borderRegion);
				new_y = Math.max(this.borderRegion, new_y - excess);
			}
		}

		return { width: new_width, height: new_height, x: new_x, y: new_y };
	}

	/**
	 * Shows the resize UI
	 * @private
	 */
	private show_resize_ui(): void {
		if (this.resize_ui_container) {
			this.resize_ui_container.visible = true;
			this.update_resize_ui();
		}

		if (this.image_editor_context.background_image) {
			const bg = this.image_editor_context.background_image;
			this.current_cursor = bg.cursor;
			bg.cursor = "move";
		}

		this.setup_dom_event_listeners();
	}

	/**
	 * Hides the resize UI
	 * @private
	 */
	private hide_resize_ui(): void {
		if (this.resize_ui_container) {
			this.resize_ui_container.visible = false;
		}

		if (this.image_editor_context.background_image) {
			const bg = this.image_editor_context.background_image;
			bg.cursor = this.current_cursor;
		}

		this.cleanup_dom_event_listeners();
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

	/**
	 * Sets the border region explicitly
	 * @param borderRegion The border region size in pixels
	 */
	public set_border_region(borderRegion: number): void {
		this.borderRegion = borderRegion;

		if (this.image_editor_context?.background_image) {
			(this.image_editor_context.background_image as any).borderRegion =
				borderRegion;
		}

		if (this.resize_ui_container) {
			this.update_resize_ui();
		}

		if (
			this.current_subtool === "size" &&
			this.image_editor_context?.background_image
		) {
			this.apply_boundary_constraints();
		}
	}
}
