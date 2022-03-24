<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { JSON } from "@gradio/json";

	export let value: any;
	export let theme: string;
	export let style: string | null;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");

	if ($$props.default) value = $$props.default;
</script>

<JSON {theme} {style} {value} />
