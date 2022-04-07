<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { JSON } from "@gradio/json";

	export let value: any;
	export let default_value: any;
	export let theme: string;
	export let style: string | null;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");

	if (default_value) value = default_value;
</script>

<JSON {theme} {style} {value} />
