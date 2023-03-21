<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let value: string;
	export let visible: boolean = true;
	export let min_height = false;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div
	class="prose {elem_classes.join(' ')}"
	class:min={min_height}
	id={elem_id}
	class:hide={!visible}
>
	{@html value}
</div>

<style>
	.min {
		min-height: var(--size-24);
	}
	.hide {
		display: none;
	}
</style>
