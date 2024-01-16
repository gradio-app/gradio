<script lang="ts">
	import { BaseImage as Image } from "@gradio/image";
	import type { EditorData } from "./shared/InteractiveImageEditor.svelte";

	export let value: EditorData;
	export let samples_dir: string;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<div
	class="container"
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	<Image
		src={samples_dir + (value.composite?.path || value.background?.path)}
		alt=""
	/>
</div>

<style>
	.container :global(img) {
		width: 100%;
		height: 100%;
	}

	.container.selected {
		border-color: var(--border-color-accent);
	}

	.container.table {
		margin: 0 auto;
		border: 2px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		width: var(--size-20);
		height: var(--size-20);
		object-fit: cover;
	}

	.container.gallery {
		border: 2px solid var(--border-color-primary);
		height: var(--size-20);
		max-height: var(--size-20);
		object-fit: cover;
	}
</style>
