<script lang="ts">
	import { onDestroy } from "svelte";
	import type { TimerProps, TimerEvents } from "./types";
	import { Gradio } from "@gradio/utils";

	const props = $props();
	const gradio = new Gradio<TimerEvents, TimerProps>(props);

	let interval: ReturnType<typeof setInterval> | undefined = undefined;

	// Use local reactive state to ensure the effect properly tracks changes
	let timer_value = $state(gradio.props.value);
	let timer_active = $state(gradio.props.active);

	// Sync local state with gradio props when they change
	$effect(() => {
		timer_value = gradio.props.value;
		timer_active = gradio.props.active;
	});

	// Manage the interval based on active state and value
	$effect(() => {
		// Clear any existing interval
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}

		// Only start a new interval if the timer is active
		if (timer_active && timer_value > 0) {
			interval = setInterval(() => {
				if (document.visibilityState === "visible") {
					gradio.dispatch("tick");
				}
			}, timer_value * 1000);
		}
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>
