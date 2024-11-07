<script lang="ts">
	import { onMount } from "svelte";
	import { Image } from "@gradio/image/shared";
	import { Video } from "@gradio/video/shared";
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
		element.style.setProperty(
			"--local-text-width",
			`${el_width && el_width < 150 ? el_width : 200}px`
		);
		element.style.whiteSpace = "unset";
	}

	onMount(() => {
		set_styles(el, size);
	});
</script>

<div
	class="container"
	bind:clientWidth={size}
	bind:this={el}
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
	class:border={value}
>
	<p>{value.text ? value.text : ""}</p>
	{#each value.files as file}
		{#if file.mime_type && file.mime_type.includes("image")}
			<Image src={file.url} alt="" />
		{:else if file.mime_type && file.mime_type.includes("video")}
			<Video src={file.url} alt="" loop={true} is_stream={false} />
		{:else if file.mime_type && file.mime_type.includes("audio")}
			<audio src={file.url} controls />
		{:else}
			{file.orig_name}
		{/if}
	{/each}
</div>

<style>
	.gallery {
		padding: var(--size-1) var(--size-2);
		display: flex;
		align-items: center;
		gap: 20px;
		overflow-x: auto;
	}

	div {
		overflow: hidden;
		min-width: var(--local-text-width);
		white-space: nowrap;
	}

	.container :global(img),
	.container :global(video) {
		object-fit: contain;
		width: 100px;
		height: 100px;
	}

	.container.selected {
		border-color: var(--border-color-accent);
	}
	.border.table {
		border: 2px solid var(--border-color-primary);
	}

	.container.table {
		margin: 0 auto;
		border-radius: var(--radius-lg);
		overflow-x: auto;
		width: max-content;
		height: max-content;
		object-fit: cover;
		padding: var(--size-2);
	}

	.container.gallery {
		object-fit: cover;
	}

	div > :global(p) {
		font-size: var(--text-lg);
		white-space: normal;
	}
</style>
