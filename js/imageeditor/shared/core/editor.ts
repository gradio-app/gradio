import { Application, Container, Graphics, Sprite, Assets } from "pixi.js";

import { DropShadowFilter as BlurFilter } from "pixi-filters/drop-shadow";

import { ImageTool } from "../image/image";

import { ZoomTool } from "../zoom/zoom";
import type { Subtool, Tool as ToolbarTool } from "../Toolbar.svelte";
import type { Readable, Writable } from "svelte/store";
import { spring, type Spring } from "svelte/motion";
import { writable } from "svelte/store";
import { type ImageBlobs, type LayerOptions } from "../types";
import type { BrushTool } from "../brush/brush";
import type { CropTool } from "../crop/crop";
import { CommandManager, type Command } from "./commands";
import {
	LayerManager,
	AddLayerCommand,
	RemoveLayerCommand,
	ReorderLayerCommand
} from "./layers";

export interface Tool {
	name: string;
	setup(
		context: ImageEditorContext,
		tool: ToolbarTool,
		subtool: Subtool
	): Promise<void>;
	cleanup(): void;
	set_tool(tool: ToolbarTool, subtool: Subtool): void;
	on?: (event: string, callback: () => void) => void;
	off?: (event: string, callback: () => void) => void;
}

const core_tools = ["image", "zoom"] as const;

interface ImageEditorOptions {
	target_element: HTMLElement;
	width: number;
	height: number;
	tools: ((typeof core_tools)[number] | Tool)[];
	fixed_canvas?: boolean;
	dark?: boolean;
	border_region?: number;
	layer_options?: LayerOptions;
	pad_bottom?: number;
	theme_mode?: "dark" | "light";
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
	}) => Promise<void>;
	execute_command: (command: Command) => Promise<void> | void;
	resize_canvas: (width: number, height: number) => void;
	reset: () => void;
	set_background_image: (image: Sprite) => void;
	pad_bottom: number;
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

	subscribe(callback: (value: any) => void): () => void {
		this.subscribers.add(callback);
		return () => this.subscribers.delete(callback);
	}
}

export class ImageEditor {
	public ready: Promise<void>;
	public background_image_present = writable(false);
	public min_zoom = writable(true);

	private app!: Application;
	private ui_container!: Container;
	private image_container!: Container;
	command_manager: CommandManager;

	private layer_manager!: LayerManager;
	private tools: Map<string, Tool> = new Map<string, Tool>();
	private current_tool!: ToolbarTool;
	private current_subtool!: Subtool;
	private target_element: HTMLElement;
	private width: number;
	private height: number;
	dimensions: Spring<{ width: number; height: number }>;
	scale: Spring<number>;
	private position: Spring<{ x: number; y: number }>;
	private state: EditorState;
	private scale_value = 1;
	private position_value: { x: number; y: number } = { x: 0, y: 0 };
	private dimensions_value: { width: number; height: number } = {
		width: 0,
		height: 0
	};
	layers: Writable<{
		active_layer: string;
		layers: {
			name: string;
			id: string;
			user_created: boolean;
			visible: boolean;
		}[];
	}> = writable({
		active_layer: "",
		layers: []
	});
	private outline_container!: Container;
	private outline_graphics!: Graphics;
	private background_image?: Sprite;
	private ready_resolve!: (value: void | PromiseLike<void>) => void;
	private event_callbacks: Map<string, (() => void)[]> = new Map();
	private fixed_canvas: boolean;
	private dark: boolean;
	private border_region: number;
	private layer_options: LayerOptions;
	private overlay_container!: Container;
	private overlay_graphics!: Graphics;
	private pad_bottom: number;
	private theme_mode: "dark" | "light";
	constructor(options: ImageEditorOptions) {
		this.pad_bottom = options.pad_bottom || 0;
		this.dark = options.dark || false;
		this.theme_mode = options.theme_mode || "dark";
		this.target_element = options.target_element;
		this.width = options.width;
		this.height = options.height;
		this.command_manager = new CommandManager();

		this.ready = new Promise((resolve) => {
			this.ready_resolve = resolve;
		});
		this.fixed_canvas = options.fixed_canvas || false;
		this.tools = new Map<string, Tool>(
			options.tools.map((tool) => {
				if (typeof tool === "string") {
					return [tool, core_tool_map[tool]()];
				}

				return [tool.name, tool];
			})
		);

		for (const tool of this.tools.values()) {
			if (tool?.on) {
				tool.on("change", () => {
					this.notify("change");
				});
			}
		}

		this.dimensions = spring(
			{ width: this.width, height: this.height },
			spring_config
		);
		this.scale = spring(1, spring_config);
		this.position = spring({ x: 0, y: 0 }, spring_config);
		this.state = new EditorState(this);
		this.border_region = options.border_region || 0;
		this.layer_options = options.layer_options || {
			allow_additional_layers: true,
			layers: ["Layer 1"],
			disabled: false
		};
		this.scale.subscribe((scale) => {
			this.state._set_scale(scale);
		});
		this.position.subscribe((position) => {
			this.state._set_position(position.x, position.y);
		});
		this.init();
	}

	get context(): ImageEditorContext {
		const editor = this;
		return {
			app: this.app,
			ui_container: this.ui_container,
			image_container: this.image_container,
			get background_image() {
				return editor.background_image;
			},
			pad_bottom: this.pad_bottom,
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

		if (!this.dark) {
			(globalThis as any).__PIXI_APP__ = this.app;
		}
		await this.app.init({
			width: container_box.width,
			height: container_box.height,
			backgroundAlpha: this.dark ? 0 : 1,
			backgroundColor: this.theme_mode === "dark" ? "#27272a" : "#ffffff",
			resolution: window.devicePixelRatio,
			autoDensity: true,
			antialias: true,
			powerPreference: "high-performance"
		});

		const canvas = this.app.canvas as HTMLCanvasElement;
		canvas.style.background = "transparent";

		this.setup_containers();

		this.layer_manager.create_background_layer(this.width, this.height);

		this.layer_manager.init_layers(this.width, this.height);

		for (const tool of this.tools.values()) {
			await tool.setup(this.context, this.current_tool, this.current_subtool);
		}

		const zoom = this.tools.get("zoom") as ZoomTool;
		if (zoom) {
			zoom.min_zoom.subscribe((is_min_zoom) => {
				this.min_zoom.set(is_min_zoom);
			});
		}

		this.target_element.appendChild(canvas);

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

			const local_x = Math.round(
				this.image_container.position.x - this.outline_container.position.x
			);
			const local_y = Math.round(
				this.image_container.position.y - this.outline_container.position.y
			);

			this.overlay_container.position.set(
				this.outline_container.position.x,
				this.outline_container.position.y
			);

			this.outline_graphics.clear();
			this.outline_graphics
				.rect(local_x, local_y, effective_width, effective_height)
				.fill({
					color: this.dark ? 0x333333 : 0xffffff,
					alpha: 1
				});

			if (this.border_region > 0) {
				const scaled_border = this.border_region * this.scale_value;
				const border_x = local_x + scaled_border - 1;
				const border_y = local_y + scaled_border - 1;
				const border_width = effective_width - scaled_border * 2 + 1;
				const border_height = effective_height - scaled_border * 2 + 1;

				this.overlay_graphics.clear();

				this.overlay_graphics
					.rect(border_x, border_y, border_width, border_height)
					.stroke({
						color: 0x999999,
						width: 1,
						alpha: 0,
						pixelLine: true
					});

				const dashLength = 5;
				const gapLength = 5;
				const totalLength = dashLength + gapLength;
				const lineColor = 0x999999;

				for (let x = border_x; x < border_x + border_width; x += totalLength) {
					this.overlay_graphics
						.rect(
							x,
							border_y,
							Math.min(dashLength, border_x + border_width - x),
							1
						)
						.fill({ color: lineColor, alpha: 0.7 });

					this.overlay_graphics
						.rect(
							x,
							border_y + border_height,
							Math.min(dashLength, border_x + border_width - x),
							1
						)
						.fill({ color: lineColor, alpha: 0.7 });
				}

				for (let y = border_y; y < border_y + border_height; y += totalLength) {
					this.overlay_graphics
						.rect(
							border_x,
							y,
							1,
							Math.min(dashLength, border_y + border_height - y)
						)
						.fill({ color: lineColor, alpha: 0.7 });

					this.overlay_graphics
						.rect(
							border_x + border_width,
							y,
							1,
							Math.min(dashLength, border_y + border_height - y)
						)
						.fill({ color: lineColor, alpha: 0.7 });
				}
			} else {
				this.overlay_graphics.clear();
			}
		});

		this.ready_resolve();
	}

	private setup_containers(): void {
		this.image_container = new Container({
			eventMode: "static",
			sortableChildren: true
		});

		this.image_container.width = this.width;
		this.image_container.height = this.height;

		this.app.stage.sortableChildren = true;
		this.app.stage.alpha = 1;
		this.app.stage.addChild(this.image_container);

		this.image_container.scale.set(1);

		this.ui_container = new Container({
			eventMode: "static"
		});
		this.app.stage.addChild(this.ui_container);
		this.ui_container.width = this.width;
		this.ui_container.height = this.height;

		this.outline_container = new Container();
		this.outline_container.zIndex = -10;

		this.outline_graphics = new Graphics();

		this.outline_graphics.rect(0, 0, this.width, this.height).fill({
			color: this.dark ? 0x333333 : 0xffffff,
			alpha: 0
		});

		if (!this.dark) {
			const blurFilter = new BlurFilter({
				alpha: 0.1,
				blur: 2,
				color: 0x000000,
				offset: { x: 0, y: 0 },
				quality: 4,
				shadowOnly: false
			});

			this.outline_graphics.filters = [blurFilter];
		}

		this.outline_container.addChild(this.outline_graphics);
		this.app.stage.addChild(this.outline_container);

		this.overlay_container = new Container();
		this.app.stage.addChild(this.overlay_container);
		this.overlay_container.width = this.width;
		this.overlay_container.height = this.height;

		this.overlay_container.zIndex = 999;
		this.overlay_container.eventMode = "static";
		this.overlay_container.interactiveChildren = true;
		this.overlay_graphics = new Graphics();
		this.overlay_container.addChild(this.overlay_graphics);

		this.overlay_graphics.rect(0, 0, this.width, this.height).fill({
			color: 0x000000,
			alpha: 0
		});

		const app_center_x = this.app.screen.width / 2;
		const app_center_y = this.app.screen.height / 2;

		this.image_container.position.set(app_center_x, app_center_y);
		this.outline_container.position.set(app_center_x, app_center_y);

		this.layer_manager = new LayerManager(
			this.image_container,
			this.app,
			this.fixed_canvas,
			this.dark,
			this.border_region,
			this.layer_options
		);
		this.layers = this.layer_manager.layer_store;
	}

	resize_canvas(width: number, height: number): void {
		if (this.app.renderer) {
			this.app.renderer.resize(width, height);
		}

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

		const brush = this.tools.get("brush") as BrushTool;

		if (brush) {
			this.set_tool("draw");
		}
	}

	async set_image_properties(properties: {
		width?: number;
		height?: number;
		scale?: number;
		position?: { x: number; y: number };
		animate?: boolean;
	}): Promise<void> {
		let hard =
			typeof properties.animate !== "undefined" ? !properties.animate : true;
		if (properties.position) {
			const pos = this.position.set(properties.position, { hard });
			if (hard) {
				await pos;
			}
		}
		if (properties.scale) {
			const scale = this.scale.set(properties.scale, { hard });
			if (hard) {
				await scale;
			}
		}
		if (properties.width && properties.height) {
			this.width = properties.width;
			this.height = properties.height;
			const dimensions = this.dimensions.set(
				{ width: properties.width, height: properties.height },
				{ hard }
			);
			if (hard) {
				await dimensions;
			}
		}
	}

	async execute_command(command: Command): Promise<void> {
		await this.command_manager.execute(command, this.context);
	}

	undo(): void {
		this.command_manager.undo();
		this.notify("change");
	}

	redo(): void {
		this.command_manager.redo(this.context);
		this.notify("change");
	}

	async add_image({
		image,
		resize = true
	}: {
		image: Blob | File;
		resize?: boolean;
	}): Promise<void> {
		const image_tool = this.tools.get("image") as ImageTool;
		await image_tool.add_image({
			image,
			fixed_canvas: this.fixed_canvas,
			border_region: this.border_region
		});
	}

	/**
	 * Adds an image from a URL as the background layer
	 * @param url The URL of the image to add
	 */
	async add_image_from_url(url: string): Promise<void> {
		const image_tool = this.tools.get("image") as ImageTool;
		const texture = await Assets.load(url);
		await image_tool.add_image({
			image: texture,
			fixed_canvas: this.fixed_canvas,
			border_region: this.border_region
		});

		const resize_tool = this.tools.get("resize") as any;
		if (resize_tool && typeof resize_tool.set_border_region === "function") {
			resize_tool.set_border_region(this.border_region);
		}
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

	async reset_canvas(): Promise<void> {
		this.layer_manager.reset_layers(this.width, this.height);
		this.background_image = undefined;
		this.background_image_present.set(false);
		this.command_manager.reset();

		await this.set_image_properties({
			width: this.width,
			height: this.height,
			scale: 1,
			position: { x: 0, y: 0 },
			animate: false
		});

		this.layer_manager.create_background_layer(this.width, this.height);

		for (const tool of this.tools.values()) {
			tool.cleanup();
			tool.setup(this.context, this.current_tool, this.current_subtool);
		}

		const zoom_tool = this.tools.get("zoom") as ZoomTool;
		if (zoom_tool) {
			zoom_tool.min_zoom.subscribe((is_min_zoom) => {
				this.min_zoom.set(is_min_zoom);
			});
		}

		this.notify("change");
	}

	add_layer(): void {
		const add_layer_command = new AddLayerCommand(this.context, {
			width: this.width,
			height: this.height,
			user_created: true,
			make_active: true
		});

		this.execute_command(add_layer_command);
		this.notify("change");
	}

	/**
	 * Adds a new layer with an image loaded from a URL
	 * @param layer_urls The URLs of the images to load
	 * @returns A Promise that resolves when all layers are added
	 */
	async add_layers_from_url(layer_urls: string[] | undefined): Promise<void> {
		this.command_manager.reset();
		const _layers = this.layer_manager.get_layers();
		_layers.forEach((l) => this.layer_manager.delete_layer(l.id));

		if (layer_urls === undefined || layer_urls.length === 0) {
			this.layer_manager.create_layer({
				width: this.width,
				height: this.height,
				layer_name: undefined,
				user_created: false
			});
			return;
		}

		const created_layer_ids: string[] = [];
		for await (const url of layer_urls) {
			const layer_id = await this.layer_manager.add_layer_from_url(url);
			if (layer_id) {
				created_layer_ids.push(layer_id);
			}
		}

		if (created_layer_ids.length > 0) {
			this.layer_manager.set_active_layer(created_layer_ids[0]);
		}

		const resize_tool = this.tools.get("resize") as any;
		if (resize_tool && typeof resize_tool.set_border_region === "function") {
			resize_tool.set_border_region(this.border_region);
		}

		this.notify("change");
		this.notify("input");
	}

	set_layer(id: string): void {
		this.layer_manager.set_active_layer(id);
		this.notify("change");
	}

	move_layer(id: string, direction: "up" | "down"): void {
		const reorder_layer_command = new ReorderLayerCommand(
			this.context,
			id,
			direction
		);
		this.execute_command(reorder_layer_command);
		this.notify("change");
	}

	delete_layer(id: string): void {
		const remove_layer_command = new RemoveLayerCommand(this.context, id);
		this.execute_command(remove_layer_command);
		this.notify("change");
	}

	modify_canvas_size(
		width: number,
		height: number,
		anchor:
			| "top-left"
			| "top"
			| "top-right"
			| "left"
			| "center"
			| "right"
			| "bottom-left"
			| "bottom"
			| "bottom-right",
		scale: boolean
	): void {
		const oldWidth = this.width;
		const oldHeight = this.height;

		this.layer_manager.resize_all_layers(
			width,
			height,
			scale,
			anchor,
			oldWidth,
			oldHeight
		);

		this.width = width;
		this.height = height;

		this.set_image_properties({
			width,
			height,
			scale: 1,
			position: { x: 0, y: 0 },
			animate: false
		});
		this.notify("change");
	}

	async get_blobs(): Promise<ImageBlobs> {
		const blobs = await this.layer_manager.get_blobs(this.width, this.height);
		return blobs;
	}

	on(event: "change" | "input", callback: () => void): void {
		this.event_callbacks.set(event, [
			...(this.event_callbacks.get(event) || []),
			callback
		]);
	}

	off(event: "change", callback: () => void): void {
		this.event_callbacks.set(
			event,
			this.event_callbacks.get(event)?.filter((cb) => cb !== callback) || []
		);
	}

	private notify(event: "change" | "input"): void {
		for (const callback of this.event_callbacks.get(event) || []) {
			callback();
		}
	}

	destroy(): void {
		if (!this.app) return;

		this.app?.destroy();
	}

	resize(width: number, height: number): void {
		this.set_image_properties({
			width,
			height
		});

		this.reset();
	}

	async get_crop_bounds(): Promise<{
		image: Blob | null;
		crop_dimensions: { width: number; height: number };
		image_dimensions: { width: number; height: number };
		x: number;
		y: number;
	}> {
		const crop_tool = this.tools.get("crop") as CropTool;
		const crop_bounds = crop_tool.get_crop_bounds();
		const image = await crop_tool.get_image();

		return {
			image,
			...crop_bounds
		};
	}

	get background_image_sprite(): Sprite | undefined {
		return this.background_image;
	}

	set_layer_options(layer_options: LayerOptions): void {
		this.layer_options = layer_options;
		this.layer_manager.set_layer_options(
			layer_options,
			this.width,
			this.height
		);
	}

	toggle_layer_visibility(id: string): void {
		this.layer_manager.toggle_layer_visibility(id);
	}
}
