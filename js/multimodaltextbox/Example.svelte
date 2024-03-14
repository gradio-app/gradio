<script lang="ts">
	import { onMount } from "svelte";
	import { Image } from "@gradio/image/shared";
	import type { FileData } from "@gradio/client";

	export let value: { text: string; files: FileData[] } = {
		text: "",
		files: []
	};
	export let type: "gallery" | "table";
	export let selected = false;

	let size: number;
	let el: HTMLDivElement;

	function set_styles(element: HTMLElement, el_width: number): void {
		if (!element || !el_width) return;
		el.style.setProperty(
			"--local-text-width",
			`${el_width < 150 ? el_width : 200}px`
		);
		el.style.whiteSpace = "unset";
	}

	onMount(() => {
		set_styles(el, size);
	});
</script>

<div
	bind:clientWidth={size}
	bind:this={el}
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{value.text ? value.text : ""}
	{#each value.files as file}
		{#if file.mime_type && file.mime_type.includes("image")}
			<Image src={file.path} alt="" />
		{:else}
			{file.path}
		{/if}
	{/each}
</div>

<style>
	.gallery {
		padding: var(--size-1) var(--size-2);
	}

	div {
		overflow: hidden;
		min-width: var(--local-text-width);

		white-space: nowrap;
	}
</style>
