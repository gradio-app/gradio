<script lang="ts">
	export let value: [string, string];
	export let samples_dir: string;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<!-- TODO: fix -->
<!-- svelte-ignore a11y-missing-attribute -->
<div
	class="wrap"
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	<img src={samples_dir + value[0]} />

	<img src={samples_dir + value[1]} />
	<span></span>
</div>

<style>
	.wrap {
		position: relative;
		height: var(--size-64);
		width: var(--size-40);
		overflow: hidden;
		border-radius: var(--radius-lg);
	}
	img {
		height: var(--size-64);
		width: var(--size-40);
		position: absolute;
		/* border-radius: var(--radius-lg); */
		/* max-width: none; */
		object-fit: cover;
	}

	.wrap.selected {
		border-color: var(--color-accent);
	}
	.wrap img:first-child {
		clip-path: inset(0 50% 0 0%);
	}

	.wrap img:nth-of-type(2) {
		clip-path: inset(0 0 0 50%);
	}
	span {
		position: absolute;
		top: 0;
		left: calc(50% - 0.75px);
		height: var(--size-64);
		width: 1.5px;
		background: var(--border-color-primary);
	}

	.table {
		margin: 0 auto;
		border: 2px solid var(--border-color-primary);
		border-radius: var(--radius-lg);
	}

	.gallery {
		border: 2px solid var(--border-color-primary);
		/* max-height: var(--size-20); */
		object-fit: cover;
	}
</style>
