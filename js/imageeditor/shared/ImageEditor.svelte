<script lang="ts" context="module">
	import type { Writable, Readable } from "svelte/store";
	import type { Spring } from "svelte/motion";
	import { type PixiApp } from "./utils/pixi";
	import { type CommandManager } from "./utils/commands";

	export const EDITOR_KEY = Symbol("editor");
	export type context_type = "bg" | "layers" | "crop" | "draw" | "erase";
	type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;
	import { type tool } from "./tools";

	export interface EditorContext {
		pixi: Writable<PixiApp | null>;
		current_layer: Writable<LayerScene | null>;
		dimensions: Writable<[number, number]>;
		editor_box: Writable<{
			parent_width: number;
			parent_height: number;
			parent_left: number;
			parent_top: number;
			parent_right: number;
			parent_bottom: number;
			child_width: number;
			child_height: number;
			child_left: number;
			child_top: number;
			child_right: number;
			child_bottom: number;
		}>;
		active_tool: Writable<tool>;
		crop: Writable<[number, number, number, number]>;
		position_spring: Spring<{
			x: number;
			y: number;
		}>;
		command_manager: CommandManager;
		current_history: CommandManager["current_history"];
		register_context: (
			type: context_type,
			{
				reset_fn,
				init_fn
			}: {
				reset_fn?: () => void;
				init_fn?: (dimensions?: [number, number]) => void;
			}
		) => void;
		reset: (clear_image: boolean, dimensions: [number, number]) => void;
	}
</script>

<script lang="ts">
	import { onMount, setContext, createEventDispatcher, tick } from "svelte";
	import { writable } from "svelte/store";
	import { spring } from "svelte/motion";
	import { Rectangle } from "pixi.js";

	import { command_manager } from "./utils/commands";

	import { type LayerScene } from "./layers/utils";
	import { create_pixi_app, type ImageBlobs } from "./utils/pixi";
	import Controls from "./Controls.svelte";
	export let antialias = true;
	export let crop_size: [number, number] = [800, 600];
	export let changeable = false;
	export let history: boolean;
	export let bg = false;
	export let sources: ("clipboard" | "webcam" | "upload")[];
	const dispatch = createEventDispatcher<{
		save: void;
	}>();
	export let crop_constraint = false;

	let dimensions = writable(crop_size);

	let editor_box: EditorContext["editor_box"] = writable({
		parent_width: 0,
		parent_height: 0,
		parent_top: 0,
		parent_left: 0,
		parent_right: 0,
		parent_bottom: 0,
		child_width: 0,
		child_height: 0,
		child_top: 0,
		child_left: 0,
		child_right: 0,
		child_bottom: 0
	});

	const crop = writable<[number, number, number, number]>([0, 0, 1, 1]);
	const position_spring = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.1,
			damping: 0.5
		}
	);
	const pixi = writable<PixiApp | null>(null);

	const CommandManager = command_manager();

	const { can_redo, can_undo, current_history } = CommandManager;

	$: {
		history = !!$current_history.previous || $active_tool !== "bg";
	}

	const active_tool: Writable<tool> = writable("bg");
	const reset_context: Writable<PartialRecord<context_type, () => void>> =
		writable({});
	const init_context: Writable<
		PartialRecord<context_type, (dimensions?: typeof $dimensions) => void>
	> = writable({});
	const contexts: Writable<context_type[]> = writable([]);

	const sort_order = ["bg", "layers", "crop", "draw", "erase"] as const;
	const editor_context = setContext<EditorContext>(EDITOR_KEY, {
		pixi,
		current_layer: writable(null),
		dimensions,
		editor_box,
		active_tool,
		crop,
		position_spring,
		command_manager: CommandManager,
		current_history,
		register_context: (
			type: context_type,
			{
				reset_fn,
				init_fn
			}: {
				reset_fn?: () => void;
				init_fn?: (dimensions?: [number, number]) => void;
			}
		) => {
			contexts.update((c) => [...c, type]);
			init_context.update((c) => ({ ...c, [type]: init_fn }));
			reset_context.update((c) => ({ ...c, [type]: reset_fn }));
		},
		reset: (clear_image: boolean, dimensions: [number, number]) => {
			bg = false;

			const _sorted_contexts = $contexts.sort((a, b) => {
				return sort_order.indexOf(a) - sort_order.indexOf(b);
			});
			for (const k of _sorted_contexts) {
				if (k in $reset_context && typeof $reset_context[k] === "function") {
					$reset_context[k]?.();
				}
			}

			for (const k of _sorted_contexts) {
				if (k in $init_context && typeof $init_context[k] === "function") {
					if (k === "bg" && !clear_image) {
						continue;
					} else {
						$init_context[k]?.(dimensions);
					}
				}
				CommandManager.reset();
				$pixi?.resize?.(...dimensions);
			}
		}
	});

	let pixi_target: HTMLDivElement;

	let canvas_wrap: HTMLDivElement;

	function get_dimensions(parent: HTMLDivElement, child: HTMLDivElement): void {
		if (!parent || !child) return;
		const {
			width: parent_width,
			height: parent_height,
			top: parent_top,
			left: parent_left,
			right: parent_right,
			bottom: parent_bottom
		} = canvas_wrap.getBoundingClientRect();
		const {
			width: child_width,
			height: child_height,
			top: child_top,
			left: child_left,
			right: child_right,
			bottom: child_bottom
		} = child.getBoundingClientRect();
		editor_box.set({
			child_width,
			child_height,
			child_left,
			child_right,
			child_top,
			child_bottom,

			parent_width,
			parent_height,
			parent_left,
			parent_right,
			parent_top,
			parent_bottom
		});
	}

	$: if (crop_constraint && bg && !history) {
		set_crop();
	}

	function set_crop(): void {
		requestAnimationFrame(() => {
			tick().then((v) => ($active_tool = "crop"));
		});
	}

	function reposition_canvas(): void {
		if (!$editor_box) return;
		const [l, t, w, h] = $crop;

		const cx = l * $editor_box.child_width;
		const cy = t * $editor_box.child_height;
		const cw = w * $editor_box.child_width;
		const ch = h * $editor_box.child_height;

		const x = 0.5 * $editor_box.child_width - cx - cw / 2;
		const y = 0.5 * $editor_box.child_height - cy - ch / 2;

		position_spring.set({ x, y });
	}

	export async function get_blobs(): Promise<ImageBlobs> {
		if (!$pixi || !$pixi.get_layers)
			return { background: null, layers: [], composite: null };
		const [l, t, w, h] = $crop;

		return $pixi?.get_blobs(
			$pixi.get_layers(),
			new Rectangle(
				l * $dimensions[0],
				t * $dimensions[1],
				w * $dimensions[0],
				h * $dimensions[1]
			),
			$dimensions
		);
	}

	$: $crop && reposition_canvas();
	$: $position_spring && get_dimensions(canvas_wrap, pixi_target);

	export function handle_remove(): void {
		editor_context.reset(true, $dimensions);
		if (!sources.length) {
			set_tool("draw");
		} else {
			set_tool("bg");
		}
	}

	onMount(() => {
		const app = create_pixi_app(pixi_target, ...crop_size, antialias);

		function resize(width: number, height: number): void {
			app.resize(width, height);
			dimensions.set([width, height]);
		}

		pixi.set({ ...app, resize });

		const resizer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				get_dimensions(canvas_wrap, pixi_target);
			}
		});

		resizer.observe(canvas_wrap);
		resizer.observe(pixi_target);

		for (const k of $contexts) {
			if (k in $init_context && typeof $init_context[k] === "function") {
				$init_context[k]?.($dimensions);
			}
		}

		resize(...$dimensions);

		return () => {
			$pixi?.destroy();
			resizer.disconnect();
			for (const k of $contexts) {
				if (k in $reset_context) {
					$reset_context[k]?.();
				}
			}
		};
	});

	let saved_history: null | typeof $current_history = $current_history;

	function handle_save(): void {
		saved_history = $current_history;
		dispatch("save");
	}

	export function set_tool(tool: tool): void {
		$active_tool = tool;
	}
</script>

<svelte:window on:scroll={() => get_dimensions(canvas_wrap, pixi_target)} />

<div data-testid="image" class="image-container">
	<Controls
		can_undo={$can_undo}
		can_redo={$can_redo}
		can_save={saved_history !== $current_history}
		{changeable}
		on:undo={CommandManager.undo}
		on:redo={CommandManager.redo}
		on:remove_image={handle_remove}
		on:save={handle_save}
	/>
	<div class="wrap" bind:this={canvas_wrap}>
		<div
			bind:this={pixi_target}
			class="stage-wrap"
			class:bg={!bg}
			style:transform="translate({$position_spring.x}px, {$position_spring.y}px)"
		></div>
	</div>
	<slot />
	<div
		class="border"
		style:width="{$crop[2] * $editor_box.child_width}px"
		style:height="{$crop[3] * $editor_box.child_height}px"
		style:top="{$crop[1] * $editor_box.child_height +
			($editor_box.child_top - $editor_box.parent_top)}px"
		style:left="{$crop[0] * $editor_box.child_width +
			($editor_box.child_left - $editor_box.parent_left)}px"
	></div>
</div>

<style>
	.wrap {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.border {
		position: absolute;
		border: var(--block-border-color) 1px solid;
		pointer-events: none;
	}

	.stage-wrap {
		margin: var(--size-8);
		margin-bottom: var(--size-1);
	}

	.bg {
	}

	.image-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		max-height: 100%;
	}
</style>
