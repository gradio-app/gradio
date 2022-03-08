<script lang="ts">
	import { HighlightedText } from "@gradio/highlighted-text";

	export let value: Array<[string, string | number]>;
	export let theme: string;
	export let show_legend: boolean;
	export let color_map: Record<string, string> = {};
</script>

<HighlightedText {value} {theme} {show_legend} {color_map} />
