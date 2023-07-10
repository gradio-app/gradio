<script lang="ts">
	import { getContext } from "svelte";

	export let value: string;
	export let samples_dir: string;
	export let type: "gallery" | "table";
	export let selected = false;

	let src = samples_dir + value;
	let ready = true;

	// For Wasm version, we need to fetch the file from the server running in the Wasm worker.
	const get_file_from_wasm = getContext<((pathname: string) => Promise<Blob>) | undefined>("get_file_from_wasm");
	$: if (get_file_from_wasm) {
		ready = false;
		const path = new URL(samples_dir + value).pathname;
		get_file_from_wasm(path).then((blob) => {
			src = URL.createObjectURL(blob);
			ready = true;
		})
	}
</script>

<!-- TODO: fix -->
<!-- svelte-ignore a11y-missing-attribute -->
{#if ready}
<img
	src={src}
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
/>
{/if}

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
