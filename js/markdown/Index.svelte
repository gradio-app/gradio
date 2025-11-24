<script context="module" lang="ts">
	export { default as BaseMarkdown } from "./shared/Markdown.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import Markdown from "./shared/Markdown.svelte";

	import { StatusTracker } from "@gradio/statustracker";
	import { Block } from "@gradio/atoms";

	import type { MarkdownProps, MarkdownEvents } from "./types";

	let props = $props();
	const gradio = new Gradio<MarkdownEvents, MarkdownProps>(props);
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	container={gradio.shared.container}
	allow_overflow={true}
	overflow_behavior="auto"
	height={gradio.props.height}
	min_height={gradio.props.min_height}
	max_height={gradio.props.max_height}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		variant="center"
<<<<<<< HEAD
		on:clear_status={() =>
=======
		on_clear_status={() =>
>>>>>>> main
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
	<div
		class:padding={gradio.props.padding}
		class:pending={gradio.shared.loading_status?.status === "pending"}
	>
		<Markdown
			value={gradio.props.value}
			elem_classes={gradio.shared.elem_classes}
			visible={gradio.shared.visible}
			rtl={gradio.props.rtl}
			on:change={() => gradio.dispatch("change")}
			on:copy={(e) => gradio.dispatch("copy", e.detail)}
			latex_delimiters={gradio.props.latex_delimiters}
			sanitize_html={gradio.props.sanitize_html}
			line_breaks={gradio.props.line_breaks}
			header_links={gradio.props.header_links}
			show_copy_button={gradio.props.buttons?.includes("copy")}
			loading_status={gradio.shared.loading_status}
			theme_mode={gradio.shared.theme_mode}
		/>
	</div>
</Block>

<style>
	div {
		transition: 150ms;
	}

	.pending {
		opacity: 0.2;
	}

	.padding {
		padding: var(--block-padding);
	}
</style>
