<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HighlightedText } from "@gradio/highlighted-text";

	export let value: Array<[string, string | number]>;
	export let style: string = "";
	export let show_legend: boolean;
	export let color_map: Record<string, string> = {};

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<HighlightedText {value} {style} {show_legend} {color_map} />
