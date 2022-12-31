<script lang="ts">
	export let value: string;
	export let samples_dir: string;
	export let type: "gallery" | "table";
	export let selected: boolean = false;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img
	src={samples_dir + value}
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
/>

<style>
	img {
		flex: none;
		border-radius: var(--radius-lg);
		max-width: none;
		border: 2px solid var(--color-border-primary);
	}

	img:hover,
	img.selected {
		border-color: var(--color-accent-light);
	}

	.table {
		object-fit: cover;
		height: var(--size-20);
		width: var(--size-20);
	}

	.gallery {
		object-fit: cover;
		max-height: var(--size-20);
	}
</style>
