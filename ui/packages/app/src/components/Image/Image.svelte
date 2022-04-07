<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Image } from "@gradio/image";

	export let value: null | string = null;
	export let default_value: null | string = null;
	export let style: string = "";
	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" = "editor";
	export let label: string;

	export let mode: "static" | "dynamic";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	if (default_value) value = default_value;

	$: value, dispatch("change");
</script>

{#if mode === "static"}
	<div
		class="output-image w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
		{style}
	>
		<!-- svelte-ignore a11y-missing-attribute -->
		<img class="w-full h-full object-contain" src={value} />
	</div>
{:else}
	<Image
		bind:value
		{style}
		{source}
		{tool}
		on:edit
		on:clear
		on:change
		{label}
	/>
{/if}
