<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import { Maximize, Minimize } from "@gradio/icons";

	let {
		fullscreen,
		onclick
	}: {
		fullscreen: boolean;
		onclick: (fullscreen: boolean) => void;
	} = $props();
</script>

{#if fullscreen}
	<IconButton
		Icon={Minimize}
		label="Exit fullscreen mode"
		onclick={() => onclick(false)}
	/>
{:else}
	<IconButton
		Icon={Maximize}
		label="Fullscreen"
		onclick={() => onclick(true)}
	/>
{/if}
