<script lang="ts">
	import { playable } from "../../utils/helpers";
	import { onMount } from "svelte";

	export let value: string;
	export let samples_dir: string;
	let video: HTMLVideoElement;

	onMount(() => {
		video.muted = true;
		video.playsInline = true;
		video.controls = false;
		video.setAttribute("muted", "");
		video.play();
		video.pause();
	});
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
{#if playable(value)}
	<video
		muted
		playsinline
		bind:this={video}
		on:mouseover={video.play}
		on:mouseout={video.pause}
		class="gr-sample-video"
		src={samples_dir + value}
	/>
{:else}
	<div class="gr-sample-video">{value}</div>
{/if}
