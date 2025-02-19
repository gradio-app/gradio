import {
	Container,
	Graphics,
	Color,
	type ColorSource,
	RenderTexture,
	Sprite,
	Point,
	FederatedPointerEvent,
	type BLEND_MODES
} from "pixi.js";
import { type ImageEditorContext, type Tool } from "../core/editor";
import { type Tool as ToolbarTool, type Subtool } from "../Toolbar.svelte";

/**
 * @interface BrushState
 * @description Defines the state of the brush
 * @property {ToolbarTool} current_tool - The currently selected tool
 * @property {Subtool} current_subtool - The currently selected subtool
 */
interface BrushState {
	current_tool: ToolbarTool;
	current_subtool: Subtool;
}

/**
 * @interface DrawOptions
 * @description Options for drawing a path
 */
interface DrawOptions {
	x: number;
	y: number;
	size: number;
	color?: ColorSource;
	opacity: number;
}

/**
 * @class BrushTool
 * @implements {Tool}
 * @description Implements the brush tool functionality for the image editor
 */
export class BrushTool implements Tool {
	name = "brush" as const;
	private image_editor_context!: ImageEditorContext;
	current_tool: ToolbarTool = "draw";
	current_subtool: Subtool = "size";

	// Drawing state
	private is_drawing = false;
	private paths: Point[] = [];
	private brush_sprite?: Sprite;
	private canvas_texture?: RenderTexture;
	private canvas_sprite?: Sprite;

	/**
	 * @method setup
	 * @async
	 * @description Sets up the brush tool with the given context and state
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

		// Create the canvas texture and sprite
		const container = this.image_editor_context.image_container;
		const bounds = container.getBounds();

		this.canvas_texture = RenderTexture.create({
			width: bounds.width,
			height: bounds.height,
			antialias: true
		});
		this.canvas_sprite = new Sprite(this.canvas_texture);

		// Make canvas_sprite match container exactly
		this.canvas_sprite.width = bounds.width;
		this.canvas_sprite.height = bounds.height;
		this.canvas_sprite.position.set(0, 0); // Position at origin of container
		container.addChild(this.canvas_sprite);

		// Create brush texture
		const brush_graphic = new Graphics();

		brush_graphic.circle(0, 0, 50).fill({ color: "black", alpha: 1 }); // base brush radius = 50

		// Generate brush texture and create sprite
		const brush_texture =
			this.image_editor_context.app.renderer.generateTexture(brush_graphic);
		this.brush_sprite = new Sprite(brush_texture);
		this.brush_sprite.anchor.set(0.5); // center the brush

		this.setup_event_listeners();
	}

	/**
	 * @method cleanup
	 * @description Cleans up the brush tool resources
	 * @returns {void}
	 */
	cleanup(): void {
		this.cleanup_event_listeners();
		if (this.canvas_texture) {
			this.canvas_texture.destroy();
		}
		if (this.canvas_sprite) {
			this.canvas_sprite.destroy();
		}
		if (this.brush_sprite) {
			this.brush_sprite.destroy();
		}
	}

	/**
	 * @method set_tool
	 * @description Sets the current tool and subtool
	 * @param {ToolbarTool} tool - The tool to set
	 * @param {Subtool} subtool - The subtool to set
	 * @returns {void}
	 */
	set_tool(tool: ToolbarTool, subtool: Subtool): void {
		this.current_tool = tool;
		this.current_subtool = subtool;
	}

	/**
	 * @method interpolate
	 * @private
	 * @description Interpolates between two points
	 * @param {Point} point1 - The first point
	 * @param {Point} point2 - The second point
	 * @returns {Point[]} An array of interpolated points
	 */
	private interpolate(point1: Point, point2: Point): Point[] {
		const points: Point[] = [];
		const dx = point2.x - point1.x;
		const dy = point2.y - point1.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const steps = Math.ceil(distance / 2);
		const stepX = dx / steps;
		const stepY = dy / steps;

		for (let j = 0; j < steps; j++) {
			const x = point1.x + j * stepX;
			const y = point1.y + j * stepY;
			points.push(new Point(x, y));
		}
		points.push(point2); // Ensure we include the end point
		return points;
	}

	/**
	 * @method start_drawing
	 * @private
	 * @description Starts the drawing process
	 * @param {DrawOptions} options - The drawing options
	 */
	private start_drawing(options: DrawOptions): void {
		if (!this.brush_sprite || !this.canvas_texture) return;

		this.is_drawing = true;
		this.paths = [new Point(options.x, options.y)];

		// Configure brush
		this.brush_sprite.tint = new Color(options.color || "black").toNumber();
		this.brush_sprite.alpha = options.opacity;
		this.brush_sprite.scale.set(options.size / 50); // scale relative to base 50px radius

		// Draw initial point
		this.brush_sprite.position.set(options.x, options.y);
		this.image_editor_context.app.renderer.render({
			container: this.brush_sprite,
			target: this.canvas_texture,
			clear: false
		});
	}

	/**
	 * @method continue_drawing
	 * @private
	 * @description Continues the drawing process
	 * @param {Point} point - The new point to draw to
	 */
	private continue_drawing(point: Point): void {
		if (!this.is_drawing || !this.brush_sprite || !this.canvas_texture) return;

		const last_point = this.paths[this.paths.length - 1];
		const new_points = this.interpolate(last_point, point);

		for (const new_point of new_points) {
			this.brush_sprite.position.copyFrom(new_point);
			this.image_editor_context.app.renderer.render({
				container: this.brush_sprite,
				target: this.canvas_texture,
				clear: false
			});
			this.paths.push(new_point);
		}
	}

	/**
	 * @method stop_drawing
	 * @private
	 * @description Stops the drawing process
	 */
	private stop_drawing(): void {
		this.is_drawing = false;
		this.paths = [];
	}

	/**
	 * @method handle_pointer_down
	 * @private
	 * @description Handles pointer down events
	 * @param {FederatedPointerEvent} event - The pointer event
	 */
	private handle_pointer_down(event: FederatedPointerEvent): void {
		if (this.current_tool !== "draw") return;

		event.stopPropagation();

		// Get position relative to the image container
		const container_pos = this.image_editor_context.image_container.toLocal(
			event.global
		);

		this.start_drawing({
			x: container_pos.x,
			y: container_pos.y,
			size: 50, // Default size
			color: new Color("black"), // Default color
			opacity: 1 // Default opacity
		});
	}

	/**
	 * @method handle_pointer_move
	 * @private
	 * @description Handles pointer move events
	 * @param {FederatedPointerEvent} event - The pointer event
	 */
	private handle_pointer_move(event: FederatedPointerEvent): void {
		if (!this.is_drawing || this.current_tool !== "draw") return;

		// Get position relative to the image container
		const container_pos = this.image_editor_context.image_container.toLocal(
			event.global
		);
		this.continue_drawing(new Point(container_pos.x, container_pos.y));
	}

	/**
	 * @method handle_pointer_up
	 * @private
	 * @description Handles pointer up events
	 */
	private handle_pointer_up(): void {
		if (!this.is_drawing || this.current_tool !== "draw") return;
		this.stop_drawing();
	}

	/**
	 * @method setup_event_listeners
	 * @private
	 * @description Sets up event listeners for the brush tool
	 */
	private setup_event_listeners(): void {
		const stage = this.image_editor_context.app.stage;
		stage.eventMode = "static";
		stage.on("pointerdown", this.handle_pointer_down.bind(this));
		stage.on("pointermove", this.handle_pointer_move.bind(this));
		stage.on("pointerup", this.handle_pointer_up.bind(this));
		stage.on("pointerupoutside", this.handle_pointer_up.bind(this));
	}

	/**
	 * @method cleanup_event_listeners
	 * @private
	 * @description Removes event listeners for the brush tool
	 */
	private cleanup_event_listeners(): void {
		const stage = this.image_editor_context.app.stage;
		stage.off("pointerdown", this.handle_pointer_down.bind(this));
		stage.off("pointermove", this.handle_pointer_move.bind(this));
		stage.off("pointerup", this.handle_pointer_up.bind(this));
		stage.off("pointerupoutside", this.handle_pointer_up.bind(this));
	}
}
