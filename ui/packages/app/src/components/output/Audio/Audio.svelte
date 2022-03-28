<script lang="ts">
	import { afterUpdate } from "svelte";
	export let value: string;
	export let theme: string;

	let audio: HTMLAudioElement;
	afterUpdate(() => (audio.src = value));
</script>

<audio bind:this={audio} class="w-full" {theme} controls>
	<source src={value} />
</audio>
