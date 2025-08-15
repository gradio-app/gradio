<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Maximize, Minimize } from "@gradio/icons";

	export let value = false;
	export let visible = true;

	const dispatch = createEventDispatcher();
</script>

{#if visible}
	<button
		class="fullscreen-btn"
		on:click={() => dispatch("click", !value)}
		aria-label={value ? "Exit fullscreen" : "Enter fullscreen"}
	>
		{#if value}
			<Minimize />
		{:else}
			<Maximize />
		{/if}
	</button>
{/if}

<style>
	.fullscreen-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
	}

	.fullscreen-btn:hover {
		background: rgba(0, 0, 0, 0.1);
	}
</style>
