<script lang="ts">
	import { createEventDispatcher } from "svelte";

	export let elem_id: string = "";
	export let value: string;
	export let visible: boolean = true;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<div class="output-html min-h-[4rem]" id={elem_id} class:!hidden={!visible}>
	{@html value}
</div>
