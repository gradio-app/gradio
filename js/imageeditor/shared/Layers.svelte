<script lang="ts">
	// import { getContext, onMount, tick } from "svelte";

	import { click_outside } from "./utils/events";
	// import { layer_manager, type LayerScene } from "./utils";
	// import { EDITOR_KEY, type EditorContext } from "../ImageEditor.svelte";
	// import type { FileData } from "@gradio/client";
	import { Layers, Clear, ArrowUp, ArrowDown, Plus } from "@gradio/icons";
	import { IconButton } from "@gradio/atoms";
	import { createEventDispatcher } from "svelte";
	import type { Writable } from "svelte/store";

	const dispatch = createEventDispatcher<{
		new_layer: void;
		change_layer: string;
		move_layer: { id: string; direction: "up" | "down" };
		delete_layer: string;
	}>();

	export let layers: Writable<{
		active_layer: string;
		layers: { name: string; id: string }[];
	}>;
	// let show_layers = false;

	// export let layer_files: (FileData | null)[] | null = [];
	// export let enable_layers = true;

	// const {
	// 	pixi,
	// 	current_layer,
	// 	dimensions,
	// 	register_context,
	// 	command_manager,
	// 	current_history
	// } = getContext<EditorContext>(EDITOR_KEY);

	// const { can_undo } = command_manager;

	// const LayerManager = layer_manager();
	// const manager_current_layer = LayerManager.active_layer;
	// const layers = LayerManager.layers;

	// $: current_layer.set($manager_current_layer);

	// register_context("layers", {
	// 	init_fn: () => {
	// 		new_layer();
	// 	},
	// 	reset_fn: () => {
	// 		LayerManager.reset();
	// 	}
	// });

	// async function validate_layers(): Promise<void> {
	// 	let invalid = $layers.some(
	// 		(layer) =>
	// 			layer.composite.texture?.width != $dimensions[0] ||
	// 			layer.composite.texture?.height != $dimensions[1]
	// 	);
	// 	if (invalid) {
	// 		LayerManager.reset();
	// 		if (!layer_files || layer_files.length == 0) new_layer();
	// 		else render_layer_files(layer_files);
	// 	}
	// }
	// $: $dimensions, validate_layers();

	// async function new_layer(): Promise<void> {
	// 	if (!$pixi) return;

	// 	const new_layer = LayerManager.add_layer(
	// 		$pixi.layer_container,
	// 		$pixi.renderer,
	// 		...$dimensions
	// 	);

	// 	if ($can_undo || $layers.length > 0) {
	// 		command_manager.execute(new_layer);
	// 	} else {
	// 		new_layer.execute();
	// 	}
	// }

	// $: render_layer_files(layer_files);

	// function is_not_null<T>(x: T | null): x is T {
	// 	return x !== null;
	// }

	// async function render_layer_files(
	// 	_layer_files: typeof layer_files
	// ): Promise<void> {
	// 	await tick();
	// 	if (!_layer_files || _layer_files.length == 0) {
	// 		LayerManager.reset();
	// 		new_layer();
	// 		return;
	// 	}
	// 	if (!$pixi) return;

	// 	const fetch_promises = await Promise.all(
	// 		_layer_files.map((f) => {
	// 			if (!f || !f.url) return null;

	// 			return fetch(f.url);
	// 		})
	// 	);

	// 	const blobs = await Promise.all(
	// 		fetch_promises.map((p) => {
	// 			if (!p) return null;
	// 			return p.blob();
	// 		})
	// 	);

	// 	LayerManager.reset();

	// 	for (const blob of blobs.filter(is_not_null)) {
	// 		const new_layer = await LayerManager.add_layer_from_blob(
	// 			$pixi.layer_container,
	// 			$pixi.renderer,
	// 			blob,
	// 			$pixi.view
	// 		);

	// 		if ($can_undo && $layers.length === 0) {
	// 			command_manager.execute(new_layer);
	// 		} else {
	// 			new_layer.execute();
	// 		}
	// 	}
	// }

	// onMount(async () => {
	// 	await tick();
	// 	if (!$pixi) return;

	// 	$pixi = { ...$pixi!, get_layers: LayerManager.get_layers };
	// });

	export let enable_layers = true;
	export let show_layers = false;

	// $: current_layer.set($manager_current_layer);

	function new_layer(): void {
		dispatch("new_layer");
	}

	function change_layer(id: string): void {
		dispatch("change_layer", id);
		show_layers = false;
	}

	function move_layer(id: string, direction: "up" | "down"): void {
		dispatch("move_layer", { id, direction });
	}

	function delete_layer(id: string): void {
		dispatch("delete_layer", id);
	}
</script>

{#if enable_layers}
	<div
		class="layer-wrap"
		class:closed={!show_layers}
		use:click_outside={() => (show_layers = false)}
	>
		<button
			aria-label="Show Layers"
			on:click|stopPropagation={() => (show_layers = !show_layers)}
			><span class="icon"><Layers /></span>
			{$layers.layers.find((l) => l.id === $layers.active_layer)?.name}
		</button>
		{#if show_layers}
			<ul>
				{#each $layers.layers as { id, name }, i (i)}
					<li>
						<button
							class:selected_layer={$layers.active_layer === id}
							aria-label={`layer-${i + 1}`}
							on:click|stopPropagation={() => change_layer(id)}>{name}</button
						>
						{#if $layers.layers.length > 1}
							<div>
								{#if i > 0}
									<IconButton
										on:click={(e) => {
											e.stopPropagation();
											move_layer(id, "up");
										}}
										Icon={ArrowUp}
										size="x-small"
									/>
								{/if}
								{#if i < $layers.layers.length - 1}
									<IconButton
										on:click={(e) => {
											e.stopPropagation();
											move_layer(id, "down");
										}}
										Icon={ArrowDown}
										size="x-small"
									/>
								{/if}
								{#if $layers.layers.length > 1}
									<IconButton
										on:click={(e) => {
											e.stopPropagation();
											delete_layer(id);
										}}
										Icon={Clear}
										size="x-small"
									/>
								{/if}
							</div>
						{/if}
					</li>
				{/each}
				<li class="add-layer">
					<IconButton
						Icon={Plus}
						aria-label="Add Layer"
						on:click={(e) => {
							e.stopPropagation();
							new_layer();
						}}
						size="x-small"
					/>
				</li>
			</ul>
		{/if}
	</div>
{/if}

<style>
	.add-layer {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: var(--spacing-sm) 0 0 0;
	}

	.add-layer :global(button) {
		width: 100%;
	}
	.icon {
		width: 16px;
		color: var(--body-text-color);
		margin-right: var(--spacing-lg);
		transition: color 0.15s ease;
	}

	.layer-wrap {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid var(--border-color-primary);
		z-index: var(--layer-1);
		border-top-left-radius: var(--radius-lg);

		width: auto;
		bottom: 0;
		right: 0;
		border-bottom: 0;
		border-right: 0;
		box-shadow: var(--shadow-drop);
	}

	.layer-wrap button {
		justify-content: flex-start;
		align-items: center;
		width: 100%;
		display: flex;
		font-size: var(--text-sm);
		line-height: var(--line-sm);
		transition: all 0.15s ease;
		padding: var(--spacing-md);
		border-radius: var(--radius-sm);
	}

	.layer-wrap button:hover {
		background-color: unset;
	}

	.layer-wrap button:hover .icon {
		color: var(--color-accent);
	}

	.selected_layer {
		color: var(--color-accent);
		font-weight: var(--weight-semibold);
	}

	ul {
		position: absolute;
		bottom: 0;
		right: 0;
		background: var(--block-background-fill);
		width: max-content;
		min-width: 100%;
		list-style: none;
		z-index: var(--layer-top);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-drop-lg);
		padding: var(--spacing-sm);
		transform: translate(-1px, 1px);
	}

	/* .sep {
		height: 12px;
		background-color: var(--block-border-color);
		width: 1px;
		display: block;
		margin-left: var(--spacing-xl);
	} */

	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		/* border-radius: var(--radius-sm); */
		transition: background-color 0.15s ease;
		border-bottom: 1px solid var(--border-color-primary);
	}

	li:hover {
		background-color: var(--background-fill-secondary);
	}

	li:last-child {
		border-bottom: none;
	}
	li:last-child:hover {
		background-color: unset;
	}

	li div {
		display: flex;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm);
	}
	li > button {
		padding: var(--spacing-sm) var(--spacing-md);
	}

	li > div > button {
		opacity: 0.7;
		transition: opacity 0.15s ease;
	}

	li > div > button:hover {
		opacity: 1;
	}
</style>
