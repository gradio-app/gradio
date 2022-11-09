<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let elem_id: string = "";
	export let value: string;
	export let visible: boolean = true;
	export let min_height = false;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div
	class:min-h-[4rem]={min_height}
	class="output-html"
	id={elem_id}
	class:!hidden={!visible}
>
	{@html value}
</div>
