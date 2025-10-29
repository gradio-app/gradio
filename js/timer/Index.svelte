<script lang="ts">
	import { onDestroy } from "svelte";
	import type { TimerProps, TimerEvents } from "./types";
	import { Gradio } from "@gradio/utils";

	const props = $props();
	const gradio = new Gradio<TimerEvents, TimerProps>(props);

	let interval: NodeJS.Timeout | undefined = undefined;

	$effect(() => {
		if (interval) clearInterval(interval);
		if (gradio.props.active) {
			interval = setInterval(() => {
				console.log("document.visibilityState", document.visibilityState)
				if (document.visibilityState === "visible"){
					console.log("dispatching tick")
					gradio.dispatch("tick");
				}
			}, gradio.props.value * 1000);
		}
	});
	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>
