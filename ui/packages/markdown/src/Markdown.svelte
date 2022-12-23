<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import "./typography.css";
	import "./latex.css";
	export let elem_id: string = "";
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
	class="gr-prose"
	class:hide={!visible}
	bind:this={target}
>
	{@html value}
</div>

<style>
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
