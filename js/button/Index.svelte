<script context="module" lang="ts">
	export { default as BaseButton } from "./shared/Button.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import type { SharedProps } from "@gradio/utils";

	import Button from "./shared/Button.svelte";

	let _props: { shared_props: SharedProps; props: {} } = $props();
	const gradio = new Gradio<never, {}>(_props);

	function handle_click() {
		gradio.dispatch("click");
	}
</script>

<Button
	value={gradio.props.value}
	variant={gradio.props.variant}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	size={gradio.props.size}
	scale={gradio.props.scale}
	link={gradio.props.link}
	icon={gradio.props.icon}
	min_width={gradio.shared.min_width}
	visible={gradio.shared.visible}
	disabled={!gradio.shared.interactive}
	on:click={handle_click}
>
	{gradio.props.value ?? ""}
</Button>
