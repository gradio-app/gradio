<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton } from "@gradio/atoms";
	import { Maximize, Minimize } from "@gradio/icons";

	const dispatch = createEventDispatcher<{
		fullscreen: boolean;
	}>();

	export let fullscreen;
</script>

{#if fullscreen}
	<IconButton
		Icon={Minimize}
		label="Exit fullscreen mode"
		on:click={() => dispatch("fullscreen", false)}
	/>
{:else}
	<IconButton
		Icon={Maximize}
		label="Fullscreen"
		on:click={() => dispatch("fullscreen", true)}
	/>
{/if}
