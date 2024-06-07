<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	export let gradio: Gradio<{
		tick: never;
	}>;
	export let value = 1;
	export let active = true;
	let old_value: number;
	let old_active: boolean;
	let interval: NodeJS.Timeout;

	$: if (old_value !== value || active !== old_active) {
		console.log(active);
		if (interval) clearInterval(interval);
		if (active) {
			interval = setInterval(() => {
				gradio.dispatch("tick");
			}, value * 1000);
		}
		old_value = value;
		old_active = active;
	}
</script>
