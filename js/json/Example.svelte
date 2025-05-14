<script lang="ts">
	import JSON from "./shared/JSON.svelte";

	export let value: any;
	export let theme_mode: "system" | "light" | "dark" = "system";
	let show_indices = false;
	let label_height = 0;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<div
	class="container"
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
	class:border={value}
>
	{#if value}
		<JSON
			{value}
			open={true}
			{theme_mode}
			{show_indices}
			{label_height}
			interactive={false}
			show_copy_button={false}
		/>
	{/if}
</div>

<style>
	.container :global(img) {
		width: 100%;
		height: 100%;
	}

	.container.selected {
		border-color: var(--border-color-accent);
	}
	.border.table {
		border: 1px solid var(--border-color-primary);
	}

	.container.table {
		margin: 0 auto;
		border-radius: var(--radius-lg);
		overflow: hidden;
		width: 100%;
		height: 100%;
		max-width: var(--size-40);
		max-height: var(--size-20);
		object-fit: cover;
	}

	.container.gallery {
		width: 100%;
		max-width: 100%;
		object-fit: cover;
		max-width: var(--size-40);
		max-height: var(--size-20);
		overflow: hidden;
	}
</style>
