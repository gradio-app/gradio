import {
	Application,
	Container,
	Graphics,
	Sprite,
	Filter,
	RenderTexture,
	GlProgram,
	defaultFilterVert,
	SCALE_MODES,
	type ALPHA_MODES
} from "pixi.js";
import { ImageTool } from "../image/image";
import { ZoomTool } from "../zoom/zoom";
import type { Subtool, Tool as ToolbarTool } from "../Toolbar.svelte";
import type { Readable, Writable } from "svelte/store";
import { spring, type Spring } from "svelte/motion";
import { writable, get } from "svelte/store";
import { erase_shader } from "../../imageeditor-old/shared/layers/utils";

export interface Command {
	execute: () => void;
	undo: () => void;
}

export interface Tool {
	name: string;
	setup(
		context: ImageEditorContext,
		tool: ToolbarTool,
		subtool: Subtool
	): Promise<void>;
	cleanup(): void;
	set_tool(tool: ToolbarTool, subtool: Subtool): void;
}

export class CommandManager {
	private undo_stack: Command[] = [];
	private redo_stack: Command[] = [];

	execute(command: Command): void {
		command.execute();
		this.undo_stack.push(command);
		this.redo_stack = []; // Clear redo stack when new command is executed
	}

	undo(): void {
		const command = this.undo_stack.pop();
		if (command) {
			command.undo();
			this.redo_stack.push(command);
		}
	}

	redo(): void {
		const command = this.redo_stack.pop();
		if (command) {
			command.execute();
			this.undo_stack.push(command);
		}
	}
}

export class LayerManager {
	private layers: Container[] = [];
	private active_layer: Container | null = null;
	private draw_textures: Map<Container, RenderTexture> = new Map();
	private erase_textures: Map<Container, RenderTexture> = new Map();
	private filters: Map<Container, Filter> = new Map();
	private background_layer: Container | null = null;
	private image_container: Container;
	private app: Application;

	constructor(image_container: Container, app: Application) {
		this.image_container = image_container;
		this.app = app;
	}

	create_background_layer(width: number, height: number): Container {
		if (this.background_layer) {
			// Remove existing background layer
			const bg_index = this.layers.indexOf(this.background_layer);
			if (bg_index > -1) {
				this.layers.splice(bg_index, 1);
			}
			this.background_layer.destroy();
		}

		// Create new background layer
		const layer = new Container();
		this.background_layer = layer;

		// Create a render texture for the background with transparency
		const bg_texture = RenderTexture.create({
			width,
			height,
			resolution: window.devicePixelRatio,
			antialias: true,
			scaleMode: SCALE_MODES.NEAREST
		});

		// Create sprite to display the texture with transparency
		const bg_sprite = new Sprite(bg_texture);
		layer.addChild(bg_sprite);

		// Clear the texture with transparency
		const clear_graphics = new Graphics();
		clear_graphics.clear();
		clear_graphics.beginFill(0, 0);
		clear_graphics.drawRect(0, 0, width, height);
		clear_graphics.endFill();

		// Render with transparency
		this.app.renderer.render({
			container: clear_graphics,
			target: bg_texture,
			clear: true
		});

		// Add it as the first layer
		this.layers.unshift(layer);
		this.image_container.addChild(layer);

		// Set lowest z-index
		layer.zIndex = -1;

		this.update_layer_order();
		return layer;
	}

	create_layer(width: number, height: number): Container {
		const layer = new Container();

		// Add new layer after background layer if it exists
		const insert_index = this.background_layer ? 1 : 0;
		this.layers.splice(insert_index, 0, layer);
		this.image_container.addChild(layer);

		// Create a single render texture for drawing with transparency
		const draw_texture = RenderTexture.create({
			width,
			height,
			resolution: window.devicePixelRatio,
			antialias: true,
			scaleMode: SCALE_MODES.NEAREST
		});

		// Create sprite to display the texture with transparency
		const canvas_sprite = new Sprite(draw_texture);
		layer.addChild(canvas_sprite);

		// Create an empty graphics object
		const clear_graphics = new Graphics();
		clear_graphics.clear();
		clear_graphics.beginFill(0, 0);
		clear_graphics.drawRect(0, 0, width, height);
		clear_graphics.endFill();

		// Render with transparency
		this.app.renderer.render({
			container: clear_graphics,
			target: draw_texture,
			clear: true
		});

		// Store texture for drawing
		this.draw_textures.set(layer, draw_texture);

		this.active_layer = layer;
		this.update_layer_order();
		return layer;
	}

	get_active_layer(): Container | null {
		return this.active_layer;
	}

	set_active_layer(layer: Container): void {
		if (this.layers.includes(layer)) {
			this.active_layer = layer;
		}
	}

	get_layers(): Container[] {
		return [...this.layers];
	}

	get_layer_textures(layer: Container): { draw: RenderTexture } | null {
		const draw = this.draw_textures.get(layer);
		if (draw) {
			return { draw };
		}
		return null;
	}

	delete_layer(layer: Container): void {
		const index = this.layers.indexOf(layer);
		if (index > -1) {
			// Clean up texture
			const draw_texture = this.draw_textures.get(layer);
			if (draw_texture) {
				draw_texture.destroy();
				this.draw_textures.delete(layer);
			}

			this.layers.splice(index, 1);
			layer.destroy();

			if (this.active_layer === layer) {
				this.active_layer = this.layers[Math.max(0, index - 1)] || null;
			}

			this.update_layer_order();
		}
	}

	private update_layer_order(): void {
		// Ensure background layer always has lowest z-index
		if (this.background_layer) {
			this.background_layer.zIndex = -1;
		}

		// Update other layers starting from 0
		this.layers.forEach((layer, index) => {
			if (layer !== this.background_layer) {
				layer.zIndex = index;
			}
		});
	}
}

const core_tools = ["image", "zoom"] as const;

interface ImageEditorOptions {
	target_element: HTMLElement;
	width: number;
	height: number;
	tools: ((typeof core_tools)[number] | Tool)[];
}

const core_tool_map = {
	image: () => new ImageTool(),
	zoom: () => new ZoomTool()
} as const;

export interface ImageEditorContext {
	app: Application;
	ui_container: Container;
	image_container: Container;
	background_image?: Sprite;
	command_manager: CommandManager;
	layer_manager: LayerManager;
	dimensions: Readable<{ width: number; height: number }>;
	scale: Readable<number>;
	position: Readable<{ x: number; y: number }>;
	set_image_properties: (properties: {
		width?: number;
		height?: number;
		scale?: number;
		position?: { x: number; y: number };
		animate?: boolean;
	}) => void;
	execute_command: (command: Command) => void;
	resize_canvas: (width: number, height: number) => void;
	reset: () => void;
	set_background_image: (image: Sprite) => void;
}

const spring_config = {
	stiffness: 0.45,
	damping: 0.8
};

interface EditorStatePublic {
	position: { x: number; y: number };
	scale: number;
	subscribe: (callback: (value: any) => void) => () => void;
	current_tool: ToolbarTool;
	current_subtool: Subtool;
}

class EditorState {
	state: EditorStatePublic;
	private scale: number;
	private position: { x: number; y: number };
	private subscribers: Set<(value: any) => void>;
	constructor(editor: ImageEditor) {
		if (!(editor instanceof ImageEditor)) {
			throw new Error("EditorState must be created by ImageEditor");
		}

		// Store private data
		this.scale = 1.0;
		this.position = { x: 0, y: 0 };
		this.subscribers = new Set();
		// @ts-ignore
		this.state = Object.freeze({
			get position() {
				return { ...this.position };
			},
			get scale() {
				return this.scale;
			},
			get current_tool() {
				return this.current_tool;
			},
			get current_subtool() {
				return this.current_subtool;
			},
			subscribe: this.subscribe.bind(this)
		});
	}

	// Internal methods - only accessible to EditorState class
	_set_position(x: number, y: number): void {
		const oldPosition = { ...this.position };
		this.position = { x, y };
		this._notify_subscribers("position", oldPosition, this.position);
	}

	_set_scale(scale: number): void {
		const oldScale = this.scale;
		this.scale = scale;
		this._notify_subscribers("scale", oldScale, scale);
	}

	_notify_subscribers(property: string, oldValue: any, newValue: any): void {
		this.subscribers.forEach((callback) => {
			callback({
				property,
				oldValue,
				newValue,
				timestamp: Date.now()
			});
		});
	}

	// Public method but only affects notifications
	subscribe(callback: (value: any) => void): () => void {
		this.subscribers.add(callback);
		return () => this.subscribers.delete(callback);
	}
}

export class ImageEditor {
	private app!: Application;
	private ui_container!: Container;
	private image_container!: Container;
	private command_manager: CommandManager;
	private layer_manager!: LayerManager;
	private tools: Map<string, Tool> = new Map();
	private current_tool!: ToolbarTool;
	private current_subtool!: Subtool;
	private target_element: HTMLElement;
	private width: number;
	private height: number;
	private dimensions: Spring<{ width: number; height: number }>;
	private scale: Spring<number>;
	private position: Spring<{ x: number; y: number }>;
	private state: EditorState;
	private scale_value = 1;
	private position_value: { x: number; y: number } = { x: 0, y: 0 };
	private dimensions_value: { width: number; height: number } = {
		width: 0,
		height: 0
	};
	private outline_container!: Container;
	private outline_graphics!: Graphics;
	private background_image?: Sprite;
	public background_image_present = writable(false);
	private ready_resolve!: (value: void | PromiseLike<void>) => void;
	public ready: Promise<void>;

	constructor(options: ImageEditorOptions) {
		this.ready = new Promise((resolve) => {
			this.ready_resolve = resolve;
		});
		this.target_element = options.target_element;
		this.width = options.width;
		this.height = options.height;

		this.tools = new Map(
			options.tools.map((tool) => {
				if (typeof tool === "string") {
					return [tool, core_tool_map[tool]()];
				}
				return [tool.name, tool];
			})
		);

		this.command_manager = new CommandManager();
		this.dimensions = spring(
			{ width: this.width, height: this.height },
			spring_config
		);
		this.scale = spring(1, spring_config);
		this.position = spring({ x: 0, y: 0 }, spring_config);
		this.state = new EditorState(this);

		this.scale.subscribe((scale) => {
			this.state._set_scale(scale);
		});
		this.position.subscribe((position) => {
			this.state._set_position(position.x, position.y);
		});
		this.init();
	}

	private get context(): ImageEditorContext {
		const editor = this;
		return {
			app: this.app,
			ui_container: this.ui_container,
			image_container: this.image_container,
			get background_image() {
				return editor.background_image;
			},
			command_manager: this.command_manager,
			layer_manager: this.layer_manager,
			dimensions: { subscribe: this.dimensions.subscribe },
			scale: { subscribe: this.scale.subscribe },
			position: { subscribe: this.position.subscribe },
			set_image_properties: this.set_image_properties.bind(this),
			execute_command: this.execute_command.bind(this),
			resize_canvas: this.resize_canvas.bind(this),
			reset: this.reset.bind(this),
			set_background_image: this.set_background_image.bind(this)
		};
	}

	async init(): Promise<void> {
		const container_box = this.target_element.getBoundingClientRect();
		new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				this.resize_canvas(
					entry.contentBoxSize[0].inlineSize,
					entry.contentBoxSize[0].blockSize
				);
			});
		}).observe(this.target_element);

		this.app = new Application();
		await this.app.init({
			width: container_box.width,
			height: container_box.height,
			backgroundAlpha: 0,
			resolution: window.devicePixelRatio,
			autoDensity: true,
			antialias: true,
			powerPreference: "high-performance"
		});

		// Set canvas properties
		const canvas = this.app.canvas as HTMLCanvasElement;
		canvas.style.background = "transparent";

		await this.setup_containers();

		// Create initial layer
		const initial_layer = this.layer_manager.create_layer(
			this.width,
			this.height
		);
		this.image_container.addChild(initial_layer);

		for (const tool of this.tools.values()) {
			await tool.setup(this.context, this.current_tool, this.current_subtool);
		}

		this.target_element.appendChild(canvas);

		// Ensure parent element is transparent
		this.target_element.style.background = "transparent";

		this.dimensions.subscribe((dimensions) => {
			this.dimensions_value = dimensions;
			this.image_container.width = dimensions.width;
			this.image_container.height = dimensions.height;
		});

		this.scale.subscribe((scale) => {
			this.scale_value = scale;
		});

		this.position.subscribe((position) => {
			this.position_value = position;
		});

		this.app.ticker.add(() => {
			this.image_container.scale.set(this.scale_value);
			this.image_container.position.set(
				this.position_value.x,
				this.position_value.y
			);

			const effective_width = this.dimensions_value.width * this.scale_value;
			const effective_height = this.dimensions_value.height * this.scale_value;

			// Convert image_container's position (in stage space) to outline_container local coordinates.
			const local_x = Math.round(
				this.image_container.position.x - this.outline_container.position.x
			);
			const local_y = Math.round(
				this.image_container.position.y - this.outline_container.position.y
			);

			this.outline_graphics.clear();
			this.outline_graphics
				.rect(local_x, local_y, effective_width, effective_height)
				.stroke({
					color: 0x000000,
					width: 1,
					alignment: 1,
					alpha: 0.3,
					join: "miter"
				});
		});

		this.ready_resolve();
	}

	private async setup_containers(): Promise<void> {
		// Create main container with transparency support
		this.image_container = new Container({
			eventMode: "static",
			sortableChildren: true
		});

		this.image_container.width = this.width;
		this.image_container.height = this.height;

		// Configure stage for transparency
		this.app.stage.sortableChildren = true;
		this.app.stage.alpha = 1;
		this.app.stage.addChild(this.image_container);

		// Set initial scale
		this.image_container.scale.set(1);

		// Create UI container with transparency
		this.ui_container = new Container({
			eventMode: "static"
		});
		this.app.stage.addChild(this.ui_container);
		this.ui_container.width = this.width;
		this.ui_container.height = this.height;

		// Create outline container with transparency
		this.outline_container = new Container();
		this.outline_graphics = new Graphics();

		// Draw outline with transparency
		this.outline_graphics.lineStyle(1, 0x000000, 0.3);
		this.outline_graphics.drawRect(0, 0, this.width, this.height);
		this.outline_container.addChild(this.outline_graphics);
		this.app.stage.addChild(this.outline_container);

		// Center all containers
		const app_center_x = this.app.screen.width / 2;
		const app_center_y = this.app.screen.height / 2;

		this.image_container.position.set(app_center_x, app_center_y);
		this.outline_container.position.set(app_center_x, app_center_y);

		// Initialize LayerManager
		this.layer_manager = new LayerManager(this.image_container, this.app);
	}

	// private resize_image(width: number, height: number): void {
	// 	// Implement image resizing logic here
	// 	this.image_container.width = width;
	// 	this.image_container.height = height;
	// }

	resize_canvas(width: number, height: number): void {
		if (this.app.renderer) {
			this.app.renderer.resize(width, height);
		}
		// `	this.ui_container.width = width;
		// 	this.ui_container.height = height;`

		// Instead, update the container position to stay centered
		const app_center_x = width / 2;
		const app_center_y = height / 2;

		if (this.image_container) {
			this.image_container.position.set(app_center_x, app_center_y);
		}
		if (this.outline_container) {
			this.outline_container.position.set(app_center_x, app_center_y);
		}
	}

	reset(): void {
		const zoom = this.tools.get("zoom");

		if (zoom) {
			zoom.cleanup();
			zoom.setup(this.context, this.current_tool, this.current_subtool);
		}
	}

	set_image_properties(properties: {
		width?: number;
		height?: number;
		scale?: number;
		position?: { x: number; y: number };
		animate?: boolean;
	}): void {
		let hard =
			typeof properties.animate !== "undefined" ? !properties.animate : true;
		if (properties.position) {
			this.position.set(properties.position, { hard });
		}
		if (properties.scale) {
			this.scale.set(properties.scale, { hard });
		}
		if (properties.width && properties.height) {
			this.dimensions.set(
				{ width: properties.width, height: properties.height },
				{ hard }
			);
		}
	}

	execute_command(command: Command): void {
		this.command_manager.execute(command);
	}

	undo(): void {
		this.command_manager.undo();
	}

	redo(): void {
		this.command_manager.redo();
	}

	add_image(image: Blob | File): void {
		const image_tool = this.tools.get("image") as ImageTool;
		image_tool.add_image(image, false);
	}
	set_tool(tool: ToolbarTool): void {
		this.current_tool = tool;

		for (const tool of this.tools.values()) {
			tool.set_tool(this.current_tool, this.current_subtool);
		}
	}

	set_subtool(subtool: Subtool): void {
		this.current_subtool = subtool;

		for (const tool of this.tools.values()) {
			tool.set_tool(this.current_tool, this.current_subtool);
		}
	}

	set_background_image(image: Sprite): void {
		this.background_image = image;
	}
}
