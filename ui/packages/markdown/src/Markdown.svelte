<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import "./typography.css";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: string;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div
	{elem_id}
	{visible}
	class:hidden={visible === false}
	class="output-markdown gr-prose"
	style="max-width: 100%"
>
	{@html value}
</div>
