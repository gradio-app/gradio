<script lang="ts">
	import type { TimerProps, TimerEvents } from "./types";
	import { Gradio } from "@gradio/utils";

	const props = $props();
	const gradio = new Gradio<TimerEvents, TimerProps>(props);

	let interval: NodeJS.Timeout | undefined = $state(undefined);
	const active = $derived(gradio.props.active);
	const value = $derived(gradio.props.value);

	$effect(() => {
		if (interval) clearInterval(interval);
		if (active) {
			interval = setInterval(() => {
				if (document.visibilityState === "visible") {
					gradio.dispatch("tick");
				}
			}, value * 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>
