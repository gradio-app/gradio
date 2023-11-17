<script lang="ts">
	import { createEventDispatcher, getContext, onMount, tick } from "svelte";
	import { DropdownArrow } from "@gradio/icons";
	import { click_outside } from "../utils/events";
	import { layer_manager, type LayerScene } from "./utils";
	import { EDITOR_KEY, type EditorContext } from "../ImageEditor.svelte";
	import type { FileData } from "@gradio/client";

	let show_layers = false;

	export let layer_files: (FileData | null)[] | null = [];

	const { pixi, current_layer, dimensions, register_context } =
		getContext<EditorContext>(EDITOR_KEY);

	const LayerManager = layer_manager();
	let layers: LayerScene[] = [];

	register_context("layers", {
		init_fn: () => {
			new_layer();
		},
		reset_fn: () => {
			LayerManager.reset();
		}
	});

	async function new_layer(): Promise<void> {
		if (!$pixi) return;

		const [active_layer, all_layers] = LayerManager.add_layer(
			$pixi.layer_container,
			$pixi.renderer,
			...$dimensions
		);

		$current_layer = active_layer;
		layers = all_layers;
	}

	$: render_layer_files(layer_files);

	function is_not_null<T>(x: T | null): x is T {
		return x !== null;
	}

	async function render_layer_files(
		_layer_files: typeof layer_files
	): Promise<void> {
		await tick();
		if (!_layer_files || _layer_files.length == 0) return;
		if (!$pixi) return;

		const fetch_promises = await Promise.all(
			_layer_files.map((f) => {
				if (!f || !f.url) return null;

				return fetch(f.url);
			})
		);

		const blobs = await Promise.all(
			fetch_promises.map((p) => {
				if (!p) return null;
				return p.blob();
			})
		);

		LayerManager.reset();

		let last_layer: [LayerScene, LayerScene[]] | null = null;
		for (const blob of blobs.filter(is_not_null)) {
			last_layer = await LayerManager.add_layer_from_blob(
				$pixi.layer_container,
				$pixi.renderer,
				blob
			);
		}

		if (!last_layer) return;

		$current_layer = last_layer[0];
		layers = last_layer[1];
	}

	onMount(async () => {
		await tick();
		if (!$pixi) return;

		$pixi = { ...$pixi!, get_layers: LayerManager.get_layers };
	});
</script>

<div
	class="layer-wrap"
	class:closed={!show_layers}
	use:click_outside={() => (show_layers = false)}
>
	<button aria-label="Show Layers" on:click={() => (show_layers = !show_layers)}
		>Layers<span class="layer-toggle"><DropdownArrow /></span></button
	>
	{#if show_layers}
		<ul>
			{#each layers as layer, i (i)}
				<li>
					<button
						class:selected_layer={$current_layer === layer}
						on:click={() =>
							($current_layer = LayerManager.change_active_layer(i))}
						>Layer {i + 1}</button
					>
				</li>
			{/each}
			<li>
				<button aria-label="Add Layer" on:click={new_layer}> +</button>
			</li>
		</ul>
	{/if}
</div>

<style>
	.layer-toggle {
		width: 20px;
		transform: rotate(0deg);
	}

	.closed .layer-toggle {
		transform: rotate(-90deg);
	}

	.layer-wrap {
		position: absolute;
		bottom: 0;
		left: 0;
		display: inline-block;
		border: 1px solid var(--block-border-color);
		border-radius: var(--radius-md);

		transition: var(--button-transition);
		box-shadow: var(--button-shadow);

		text-align: left;
		border-bottom: none;
		border-left: none;
		border-bottom-right-radius: 0;
		border-top-left-radius: 0;
		background-color: var(--background-fill-primary);
		overflow: hidden;
	}

	.layer-wrap button {
		display: inline-flex;
		justify-content: flex-start;
		align-items: flex-start;
		padding: var(--size-2) var(--size-4);
		width: 100%;
		border-bottom: 1px solid var(--block-border-color);
	}

	.layer-wrap li:last-child button {
		border-bottom: none;
		text-align: center;
	}

	.closed > button {
		border-bottom: none;
	}

	.layer-wrap button:hover {
		background-color: var(--background-fill-secondary);
	}

	.selected_layer {
		background-color: var(--color-accent) !important;
		color: white;
		font-weight: bold;
	}
</style>
