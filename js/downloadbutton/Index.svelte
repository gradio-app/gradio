<script context="module" lang="ts">
	export { default as BaseButton } from "./shared/DownloadButton.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import DownloadButton from "./shared/DownloadButton.svelte";
	import type { DownloadButtonProps, DownloadButtonEvents } from "./types";

	const props = $props();
	const gradio = new Gradio<DownloadButtonEvents, DownloadButtonProps>(props);
</script>

<DownloadButton
	value={gradio.props.value}
	variant={gradio.props.variant}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	size={gradio.props.size}
	scale={gradio.shared.scale}
	icon={gradio.props.icon}
	min_width={gradio.shared.min_width}
	visible={gradio.shared.visible}
	disabled={!gradio.shared.interactive}
	on:click={() => gradio.dispatch("click")}
>
	{gradio.shared.label ?? ""}
</DownloadButton>
