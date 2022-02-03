<script>
	import { playable } from "../../utils/helpers";

	export let value, examples_dir;
	let video;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
{#if playable(value)}
	<video
		bind:this={video}
		on:mouseover={video.play}
		on:mouseout={video.pause}
		class="input-video-example h-24 max-w-none"
		src={examples_dir + value}
	/>
{:else}
	<div class="input-video-example">{value}</div>
{/if}
