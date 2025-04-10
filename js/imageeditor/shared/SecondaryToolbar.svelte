<script lang="ts">
	import Layers from "./Layers.svelte";
	import type { Writable } from "svelte/store";

	export let layers: Writable<{
		active_layer: string;
		layers: {
			name: string;
			id: string;
			user_created: boolean;
			visible: boolean;
		}[];
	}>;

	export let enable_additional_layers = true;
	export let enable_layers = true;
	export let show_layers = false;
</script>

<div class="toolbar-wrap-wrap">
	<div class="toolbar-wrap">
		{#if enable_layers}
			<Layers
				{layers}
				{enable_additional_layers}
				{enable_layers}
				{show_layers}
				on:new_layer
				on:change_layer
				on:move_layer
				on:delete_layer
				on:toggle_layer_visibility
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
