<script lang="ts" context="module">
	import type { Writable, Readable } from "svelte/store";
	import type { Spring } from "svelte/motion";
	import { type PixiApp } from "./utils/pixi";
	import { type CommandManager } from "./utils/commands";

	export const EDITOR_KEY = Symbol("editor");
	export type context_type = "bg" | "layers" | "crop" | "draw" | "erase";
	type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

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
		active_tool: Writable<"bg" | null>;
		crop: Writable<[number, number, number, number]>;
		position_spring: Spring<{
			x: number;
			y: number;
		}>;
		command_manager: CommandManager;

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

	//reset
	// clear bg
	// clear layers
	// reset app

	// new bg
	// reset
	// add bg
	// new layer
</script>

<script lang="ts">
	import { onMount, setContext } from "svelte";
	import { writable } from "svelte/store";
	import { spring } from "svelte/motion";
	import { Rectangle } from "pixi.js";

	import { command_manager } from "./utils/commands";

	import { type LayerScene } from "./layers/utils";
	import { create_pixi_app, type ImageBlobs } from "./utils/pixi";
	import Controls from "./Controls.svelte";

	export let antialias = true;
	export let active_tool: "bg" | null = null;
	export let crop_size: [number, number] = [800, 600];

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

	const crop = writable<[number, number, number, number]>([0, 0, ...crop_size]);
	const position_spring = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.1,
			damping: 0.5
		}
	);
	const pixi = writable<PixiApp | null>(null);

	const CommandManager = command_manager();

	const { can_redo, can_undo } = CommandManager;
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
		active_tool: writable(active_tool),
		crop,
		position_spring,
		command_manager: CommandManager,

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
			console.log("reset");
			const _sorted_contexts = $contexts.sort((a, b) => {
				return sort_order.indexOf(a) - sort_order.indexOf(b);
			});
			for (const k of _sorted_contexts) {
				if (k in $reset_context && typeof $reset_context[k] === "function") {
					$reset_context[k]?.();
				}
			}

			// $pixi?.reset?.();
			for (const k of _sorted_contexts) {
				if (k in $init_context && typeof $init_context[k] === "function") {
					if (k === "bg" && !clear_image) {
						continue;
					} else {
						$init_context[k]?.(dimensions);
					}
				}

				// $pixi?.reset?.();
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

	function handle_remove(): void {
		$dimensions = crop_size || [800, 600];
		// $reset?.();
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
</script>

<div data-testid="image" class="image-container">
	<Controls
		can_undo={$can_undo}
		can_redo={$can_redo}
		on:undo={CommandManager.undo}
		on:redo={CommandManager.redo}
		on:remove_image={handle_remove}
	/>
	<div class="wrap" bind:this={canvas_wrap}>
		<div
			bind:this={pixi_target}
			class="stage-wrap"
			style:transform="translate({$position_spring.x}px, {$position_spring.y}px)"
		></div>
	</div>
	<slot />
</div>

<style>
	.wrap {
		width: 100%;
		height: 100%;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.stage-wrap {
		margin: var(--size-8);
		margin-bottom: var(--size-1);
		/* border: var(--block-border-color) 1px solid; */
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
