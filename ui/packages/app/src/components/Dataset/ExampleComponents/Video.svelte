<script lang="ts">
	import { playable } from "../../utils/helpers";

	export let value: string;
	export let samples_dir: string;
	let video: HTMLVideoElement;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
{#if playable(value)}
	<video
		bind:this={video}
		on:mouseover={video.play}
		on:mouseout={video.pause}
		class="gr-sample-video"
		src={samples_dir + value}
	/>
{:else}
	<div class="gr-sample-video">{value}</div>
{/if}
