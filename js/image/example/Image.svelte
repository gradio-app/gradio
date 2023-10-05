<script lang="ts">
	import { Image } from "../static";

	export let value: string;
	export let samples_dir: string;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<div
	class="image-container"
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	<Image
		src={samples_dir + value}
		alt=""
	/>
</div>

<style>
	.image-container {
		border-radius: var(--radius-lg);
		max-width: none;
	}

	.image-container.selected {
		border-color: var(--border-color-accent);
	}

	.image-container.table {
		margin: 0 auto;
		border: 2px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		width: var(--size-20);
		height: var(--size-20);
		object-fit: cover;
	}

	.image-container.gallery {
		border: 2px solid var(--border-color-primary);
		height: var(--size-20);
		max-height: var(--size-20);
		object-fit: cover;
	}
</style>
