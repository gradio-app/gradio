<script lang="ts">
	import { createEventDispatcher } from "svelte";
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: string;
	export let min_height = false;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	let target: HTMLElement;

	$: value, dispatch("change");
</script>

<div
	id={elem_id}
	class:min={min_height}
	class="prose {elem_classes.join(' ')}"
	class:hide={!visible}
	bind:this={target}
	data-testid="markdown"
>
	{@html value}
</div>

<style>
	div :global(.math.inline) {
		fill: var(--body-text-color);
		display: inline-block;
		vertical-align: middle;
		padding: var(--size-1-5) -var(--size-1);
		color: var(--body-text-color);
	}

	div :global(.math.inline svg) {
		display: inline;
		margin-bottom: 0.22em;
	}

	div {
		max-width: 100%;
	}

	.min {
		min-height: var(--size-24);
	}
	.hide {
		display: none;
	}
</style>
