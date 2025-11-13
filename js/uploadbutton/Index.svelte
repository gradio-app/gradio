<script lang="ts" context="module">
	export { default as BaseUploadButton } from "./shared/UploadButton.svelte";
</script>

<script lang="ts">
	import type { UploadButtonProps, UploadButtonEvents } from "./types";
	import type { FileData } from "@gradio/client";
	import { Gradio } from "@gradio/utils";
	import UploadButton from "./shared/UploadButton.svelte";

	const props = $props();
	const gradio = new Gradio<UploadButtonEvents, UploadButtonProps>(props);

	let value = $state(gradio.props.value);

	$effect(() => {
		if (value !== gradio.props.value) {
			gradio.props.value = value;
		}
	});

	async function handle_event(
		detail: null | FileData | FileData[],
		event: "change" | "upload" | "click"
	): Promise<void> {
		gradio.props.value = detail;
		gradio.dispatch(event);
	}

	const disabled = $derived(!gradio.shared.interactive);
</script>

<UploadButton
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	visible={gradio.shared.visible}
	file_count={gradio.props.file_count}
	file_types={gradio.props.file_types}
	size={gradio.props.size}
	scale={gradio.shared.scale}
	icon={gradio.props.icon}
	min_width={gradio.shared.min_width}
	root={gradio.shared.root}
	{value}
	{disabled}
	variant={gradio.props.variant}
	label={gradio.shared.label}
	max_file_size={gradio.shared.max_file_size}
	on:click={() => gradio.dispatch("click")}
	on:change={({ detail }) => handle_event(detail, "change")}
	on:upload={({ detail }) => handle_event(detail, "upload")}
	on:error={({ detail }) => {
		gradio.dispatch("error", detail);
	}}
	upload={(...args) => gradio.shared.client.upload(...args)}
>
	{gradio.shared.label ?? ""}
</UploadButton>
