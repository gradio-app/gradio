<script lang="ts">
	import { Image } from "@gradio/image";

	export let value: null | string;
	export let theme: string;
	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" = "editor";

	export let is_static: boolean;
</script>

{#if is_static}
	<div
		class="output-image w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
		{theme}
	>
		<!-- svelte-ignore a11y-missing-attribute -->
		<img class="w-full h-full object-contain" src={value} />
	</div>
{:else}
	<Image bind:value {theme} {source} {tool} on:change />
{/if}
