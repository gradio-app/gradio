<script lang="ts">
	import { HighlightedText } from "@gradio/highlighted-text";
</script>

<h2 class="my-2">With legend</h2>
<HighlightedText
	show_legend={true}
	value={[
		["one", "1"],
		["two", "2"],
		["three", "3"],
		["The", null],
		["two", "2"],
		["three", "3"]
	]}
/>

<h2 class="my-2">Without legend</h2>
<HighlightedText
	value={[
		["Frank ", "Name"],
		["lives in ", null],
		["Paris", "Loc"],
		[" and is aged ", null],
		["37", "Age"]
	]}
/>

<h2 class="my-2">Custom color_map with legend</h2>
<HighlightedText
	show_legend={true}
	value={[
		["one", "+"],
		["two", "-"],
		["three", "-"],
		["two", "+"],
		["three", "-"]
	]}
	color_map={{ "+": "green", "-": "red" }}
/>

<h2 class="my-2">Custom color_map without legend</h2>
<HighlightedText
	value={[
		["one", "+"],
		["two", "-"],
		["three", "-"],
		["two", "+"],
		["three", "-"]
	]}
	color_map={{ "+": "orange", "-": "purple" }}
/>
