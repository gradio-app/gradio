<script>
	import "@gradio/theme/reset.css";
	import "@gradio/theme/global.css";
	import "@gradio/theme/pollen.css";
	import "@gradio/theme/typography.css";
	import * as svelte from "svelte";
	// import { onMount } from "svelte";
	const is_browser = typeof window !== "undefined";
	if(is_browser) {
		window.__gradio__svelte__internal = svelte;
	}
</script>
<slot></slot>
