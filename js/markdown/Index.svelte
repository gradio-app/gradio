<script context="module" lang="ts">
	export { default as BaseMarkdown } from "./shared/Markdown.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { tick } from "svelte";
	import { Gradio, should_show_scroll_fade } from "@gradio/utils";
	import Markdown from "./shared/Markdown.svelte";

	import { StatusTracker } from "@gradio/statustracker";
	import { Block, ScrollFade } from "@gradio/atoms";

	import type { MarkdownProps, MarkdownEvents } from "./types";

	let props = $props();
	const gradio = new Gradio<MarkdownEvents, MarkdownProps>(props);

	let wrapper: HTMLDivElement;
	let show_fade = $state(false);

	function update_fade(): void {
		if (!gradio.props.height) return;
		show_fade = should_show_scroll_fade(
			wrapper?.closest(".block") as HTMLElement | null,
		);
	}

	$effect(() => {
		const container = wrapper?.closest(".block") as HTMLElement | null;
		if (!container || !gradio.props.height) return;
		container.addEventListener("scroll", update_fade);
		tick().then(update_fade);
		return () => container.removeEventListener("scroll", update_fade);
	});

	$effect(() => {
		if (gradio.props.value !== undefined) tick().then(update_fade);
	});
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
	rtl={gradio.props.rtl}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		variant="center"
		on_clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
	<div
		bind:this={wrapper}
		class:padding={gradio.props.padding}
		class:pending={gradio.shared.loading_status?.status === "pending"}
	>
		<Markdown
			value={gradio.props.value}
			elem_classes={gradio.shared.elem_classes}
			visible={gradio.shared.visible}
			rtl={gradio.props.rtl}
			onchange={() => gradio.dispatch("change")}
			oncopy={(e) => gradio.dispatch("copy", e.detail)}
			latex_delimiters={gradio.props.latex_delimiters}
			sanitize_html={gradio.props.sanitize_html}
			line_breaks={gradio.props.line_breaks}
			header_links={gradio.props.header_links}
			show_copy_button={gradio.props.buttons?.includes("copy")}
			loading_status={gradio.shared.loading_status}
			theme_mode={gradio.shared.theme_mode}
		/>
	</div>
	<ScrollFade visible={show_fade} />
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
