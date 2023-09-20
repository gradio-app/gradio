<script lang="ts">
	import { Image } from "@gradio/wasm/svelte";

	export let value: string;
	export let samples_dir: string;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<Image
	src={samples_dir + value}
	class={[
		type === "table" && "table",
		type === "gallery" && "gallery",
		selected && "selected"
	]
		.filter((c) => c)
		.join(" ")}
	alt=""
/>

<style>
	img {
		border-radius: var(--radius-lg);
		max-width: none;
	}

	img.selected {
		border-color: var(--border-color-accent);
	}

	.table {
		margin: 0 auto;
		border: 2px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		width: var(--size-20);
		height: var(--size-20);
		object-fit: cover;
	}

	.gallery {
		border: 2px solid var(--border-color-primary);
		max-height: var(--size-20);
		object-fit: cover;
	}
</style>
