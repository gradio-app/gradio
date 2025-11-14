<script lang="ts">
	import { Gradio } from "@gradio/utils";
	let props = $props();

	const gradio = new Gradio<{ change: never }, { value: any }>(props);

	$effect(() => {
		gradio.props.value && gradio.dispatch("change");
	});
</script>
