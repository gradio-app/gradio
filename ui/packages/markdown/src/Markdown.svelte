<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import "./typography.css";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: string;
	export let min_height = false;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div
	id={elem_id}
	class:min-h-[4rem]={min_height}
	class="output-markdown gr-prose"
	class:hidden={!visible}
	style="max-width: 100%"
>
	{@html value}
</div>
