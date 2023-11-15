<script lang="ts">
	import { createEventDispatcher, getContext, onMount, tick } from "svelte";
	import { DropdownArrow } from "@gradio/icons";
	import { click_outside } from "../utils/events";
	import { layer_manager, type LayerScene } from "./utils";
	import { EDITOR_KEY, type EditorContext } from "../ImageEditor.svelte";

	let show_layers = false;

	const dispatch = createEventDispatcher<{
		new_layer: void;
	}>();

	const { pixi, current_layer, dimensions } =
		getContext<EditorContext>(EDITOR_KEY);

	const LayerManager = layer_manager();
	let layers: LayerScene[] = [];

	function once(fn: () => void): () => void {
		let called = false;
		return () => {
			if (called) return;
			called = true;
			fn();
		};
	}
	const once_layer = once(new_layer);

	$: $pixi && once_layer();

	function new_layer(): void {
		console.log("boooooo");
		if (!$pixi) return;
		const [active_layer, all_layers] = LayerManager.add_layer(
			$pixi.layer_container,
			$pixi.renderer,
			...$dimensions
		);

		$current_layer = active_layer;
		layers = all_layers;
	}

	onMount(async () => {
		await tick();
		if (!$pixi) return;
		function reset(): void {
			LayerManager.reset();
			$pixi?.resize(...$dimensions);

			new_layer();
		}
		$pixi = { ...$pixi!, reset, get_layers: LayerManager.get_layers };
	});
</script>

<div
	class="layer-wrap"
	class:closed={!show_layers}
	use:click_outside={() => (show_layers = false)}
>
	<button on:click={() => (show_layers = !show_layers)}
		>Layers <span class="layer-toggle"><DropdownArrow /></span></button
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
				<button on:click={new_layer}> +</button>
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
