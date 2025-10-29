<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseImageUploader } from "./shared/ImageUploader.svelte";
	export { default as BaseStaticImage } from "./shared/ImagePreview.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { SimpleImageProps, SimpleImageEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import ImagePreview from "./shared/ImagePreview.svelte";
	import ImageUploader from "./shared/ImageUploader.svelte";

	import { Block, UploadText } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";

	const props = $props();
	const gradio = new Gradio<SimpleImageEvents, SimpleImageProps>(props);

	let dragging = $state(false);
	let old_value = $state(gradio.props.value);

	$effect(() => {
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});
</script>

{#if !gradio.shared.interactive}
	<Block
		visible={gradio.shared.visible}
		variant={"solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		allow_overflow={false}
		container={gradio.shared.container}
		scale={gradio.shared.scale}
		min_width={gradio.shared.min_width}
	>
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
		<ImagePreview
			value={gradio.props.value}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			show_download_button={gradio.props.show_download_button}
			i18n={gradio.i18n}
		/>
	</Block>
{:else}
	<Block
		visible={gradio.shared.visible}
		variant={gradio.props.value === null ? "dashed" : "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		allow_overflow={false}
		container={gradio.shared.container}
		scale={gradio.shared.scale}
		min_width={gradio.shared.min_width}
	>
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>

		<ImageUploader
			upload={(...args) => gradio.shared.client.upload(...args)}
			stream_handler={(...args) => gradio.shared.client.stream(...args)}
			bind:value={gradio.props.value}
			root={gradio.root}
			on:clear={() => gradio.dispatch("clear")}
			on:drag={({ detail }) => (dragging = detail)}
			on:upload={() => gradio.dispatch("upload")}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
		>
			<UploadText i18n={gradio.i18n} type="image" placeholder={gradio.props.placeholder} />
		</ImageUploader>
	</Block>
{/if}
