<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let elem_classes: string[] = [];
	export let value: string;
	export let visible = true;

	const dispatch = createEventDispatcher<{
		change: undefined;
		click: undefined;
	}>();

	$: value, dispatch("change");
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
	class="prose {elem_classes.join(' ')}"
	class:hide={!visible}
	on:click={() => dispatch("click")}
>
	{@html value}
</div>

<style>
	.hide {
		display: none;
	}
</style>
