<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let elem_classes: string[] = [];
	export let value: string;
	export let visible = true;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div class="prose {elem_classes.join(' ')}" class:hide={!visible}>
	{@html value}
</div>

<style>
	.hide {
		display: none;
	}
</style>
