<script lang="ts">
	import { getContext, onMount, tick } from "svelte";

	import { click_outside } from "../utils/events";
	import { layer_manager, type LayerScene } from "./utils";
	import { EDITOR_KEY, type EditorContext } from "../ImageEditor.svelte";
	import type { FileData } from "@gradio/client";
	import { Layers } from "@gradio/icons";

	let show_layers = false;

	export let layer_files: (FileData | null)[] | null = [];
	export let enable_layers = true;

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

	async function validate_layers(): Promise<void> {
		let invalid = layers.some(
			(layer) =>
				layer.composite.texture?.width != $dimensions[0] ||
				layer.composite.texture?.height != $dimensions[1]
		);
		if (invalid) {
			LayerManager.reset();
			if (!layer_files || layer_files.length == 0) new_layer();
			else render_layer_files(layer_files);
		}
	}
	$: $dimensions, validate_layers();

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
		if (!_layer_files || _layer_files.length == 0) {
			LayerManager.reset();
			new_layer();
			return;
		}
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
				blob,
				$pixi.view
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

{#if enable_layers}
	<div
		class="layer-wrap"
		class:closed={!show_layers}
		use:click_outside={() => (show_layers = false)}
	>
		<button
			aria-label="Show Layers"
			on:click={() => (show_layers = !show_layers)}
			><span class="icon"><Layers /></span> Layer {layers.findIndex(
				(l) => l === $current_layer
			) + 1}
		</button>
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

		<span class="sep"></span>
	</div>
{/if}

<style>
	.icon {
		width: 14px;
		margin-right: var(--spacing-md);
		color: var(--block-label-text-color);
		margin-right: var(--spacing-lg);
		margin-top: 1px;
	}

	.layer-wrap {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.layer-wrap button {
		justify-content: flex-start;
		align-items: flex-start;
		width: 100%;
		border-bottom: 1px solid var(--block-border-color);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--scale-000);
		line-height: var(--line-sm);
		padding-bottom: 1px;
		margin-left: var(--spacing-xl);
		padding: var(--spacing-sm) 0;
	}

	.layer-wrap li:last-child button {
		border-bottom: none;
		text-align: center;
		font-size: var(--scale-0);
		line-height: 1;
		font-weight: var(--weight-bold);
		padding: 5px 0 1px 0;
	}

	.closed > button {
		border-bottom: none;
	}

	.layer-wrap button:hover {
		background-color: none;
	}

	.layer-wrap button:hover .icon {
		color: var(--color-accent);
	}

	.selected_layer {
		background-color: var(--block-background-fill);
		color: var(--color-accent);
		font-weight: bold;
	}

	ul {
		position: absolute;
		bottom: 0;
		left: 0;
		background: var(--block-background-fill);
		width: calc(100% + 1px);
		list-style: none;
		z-index: var(--layer-top);
		border: 1px solid var(--block-border-color);
		padding: var(--spacing-sm) 0;
		text-wrap: none;
		transform: translate(-1px, 1px);
		border-radius: var(--radius-sm);
		border-bottom-right-radius: 0;
	}

	.layer-wrap ul > li > button {
		margin-left: 0;
	}

	.sep {
		height: 12px;
		background-color: var(--block-border-color);
		width: 1px;
		display: block;
		margin-left: var(--spacing-xl);
	}
</style>
