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
		border: 2px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
		max-width: none;
	}

	img:hover,
	img.selected {
		border-color: var(--color-accent-light);
	}

	.table {
		width: var(--size-20);
		height: var(--size-20);
		object-fit: cover;
	}

	.gallery {
		max-height: var(--size-20);
		object-fit: cover;
	}
</style>
