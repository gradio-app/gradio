<script lang="ts">
	import Layers from "./Layers.svelte";
	import type { Writable } from "svelte/store";

	let {
		layers,
		enable_additional_layers = true,
		enable_layers = true,
		show_layers = false,
		onnew_layer,
		onchange_layer,
		onmove_layer,
		ondelete_layer,
		ontoggle_layer_visibility
	}: {
		layers: Writable<{
			active_layer: string;
			layers: {
				name: string;
				id: string;
				user_created: boolean;
				visible: boolean;
			}[];
		}>;
		enable_additional_layers?: boolean;
		enable_layers?: boolean;
		show_layers?: boolean;
		onnew_layer?: () => void;
		onchange_layer?: (id: string) => void;
		onmove_layer?: (value: { id: string; direction: "up" | "down" }) => void;
		ondelete_layer?: (id: string) => void;
		ontoggle_layer_visibility?: (id: string) => void;
	} = $props();
</script>

<div class="toolbar-wrap-wrap">
	<div class="toolbar-wrap">
		{#if enable_layers}
			<Layers
				{layers}
				{enable_additional_layers}
				{enable_layers}
				{show_layers}
				{onnew_layer}
				{onchange_layer}
				{onmove_layer}
				{ondelete_layer}
				{ontoggle_layer_visibility}
			/>
		{/if}
	</div>
</div>

<style>
	.toolbar-wrap-wrap {
		position: absolute;
		right: 0;
		bottom: 0;
		width: fit-content;
		max-height: 100%;
		overflow-y: auto;
		display: flex;
		flex-direction: column-reverse;
	}

	.toolbar-wrap {
		min-width: 110px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		right: 0;
		bottom: 0;
		border: 1px solid var(--block-border-color);
		border-radius: 0;
		border-top-left-radius: var(--radius-md);
		border-right: none;
		border-bottom: none;
		z-index: 1000;
		background-color: var(--block-background-fill);
	}
</style>
