<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { HighlightedText } from "@gradio/highlighted-text";

	export let value: Array<[string, string | number]>;
	export let theme: string;
	export let style: string | null;
	export let show_legend: boolean;
	export let color_map: Record<string, string> = {};

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");
</script>

<HighlightedText {value} {theme} {style} {show_legend} {color_map} />
