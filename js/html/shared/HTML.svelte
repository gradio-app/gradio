<script lang="ts">
	import { createEventDispatcher } from "svelte";
	export let elem_classes: string[] = [];
	export let value: string;
	export let visible = true;
	export let min_height = false;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div
	class="prose {elem_classes.join(' ')}"
	class:min={min_height}
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
