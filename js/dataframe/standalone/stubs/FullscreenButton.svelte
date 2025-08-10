<!-- Standalone stub for FullscreenButton -->
<script lang="ts">
	import { createEventDispatcher } from "svelte";

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
			<!-- Minimize icon -->
			<svg viewBox="0 0 16 16" width="16" height="16">
				<path d="M1 1h6v6H1V1zm8 8h6v6H9V9z" fill="currentColor" />
			</svg>
		{:else}
			<!-- Maximize icon -->
			<svg viewBox="0 0 16 16" width="16" height="16">
				<path d="M2 2v12h12V2H2zm10 10H4V4h8v8z" fill="currentColor" />
			</svg>
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
