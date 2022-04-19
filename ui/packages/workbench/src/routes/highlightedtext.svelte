<script lang="ts">
	import { HighlightedText } from "@gradio/highlighted-text";
</script>

<h2>With legend</h2>
<HighlightedText
	show_legend={true}
	value={[
		["one", "1"],
		["two", "2"],
		["three", "3"],
		["two", "2"],
		["three", "3"]
	]}
/>

<h2>Without legend</h2>
<HighlightedText
	value={[
		["one", "1"],
		["two", "2"],
		["three", "3"],
		["two", "2"],
		["three", "3"]
	]}
/>

<h2>Custom color_map with legend</h2>
<HighlightedText
	show_legend={true}
	value={[
		["one", "+"],
		["two", "-"],
		["three", "-"],
		["two", "+"],
		["three", "-"]
	]}
	color_map={{ "+": "limegreen", "-": "crimson" }}
/>

<h2>Custom color_map without legend</h2>
<HighlightedText
	value={[
		["one", "+"],
		["two", "-"],
		["three", "-"],
		["two", "+"],
		["three", "-"]
	]}
	color_map={{ "+": "limegreen", "-": "crimson" }}
/>
