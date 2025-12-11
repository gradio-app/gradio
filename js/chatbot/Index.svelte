<script context="module" lang="ts">
	export { default as BaseChatBot } from "./shared/ChatBot.svelte";
</script>

<script lang="ts">
	import ChatBot from "./shared/ChatBot.svelte";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { Chat } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import type { Message, ExampleMessage, NormalisedMessage } from "./types";
	import type { ChatbotProps, ChatbotEvents } from "./types";
	import { normalise_messages } from "./shared/utils";
	import { Gradio } from "@gradio/utils";

	let props = $props();

	const gradio = new Gradio<ChatbotEvents, ChatbotProps>(props);

	let _value: NormalisedMessage[] | null = $derived(
		normalise_messages(gradio.props.value as Message[], gradio.shared.root)
	);

	let show_progress = $derived.by(() => {
		if (gradio.shared.loading_status.status === "error") {
			return "full";
		}
		return gradio.shared.loading_status.show_progress === "hidden"
			? "hidden"
			: "minimal";
	});
</script>

<Block
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	visible={gradio.shared.visible}
	padding={false}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	height={gradio.props.height}
	resizable={gradio.props.resizable}
	min_height={gradio.props.min_height}
	max_height={gradio.props.max_height}
	allow_overflow={true}
	flex={true}
	overflow_behavior="auto"
>
	{#if gradio.shared.loading_status}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			{show_progress}
			on_clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
	{/if}
	<div class="wrapper">
		{#if gradio.shared.show_label}
			<BlockLabel
				show_label={gradio.shared.show_label}
				Icon={Chat}
				float={true}
				label={gradio.shared.label || "Chatbot"}
			/>
		{/if}
		<ChatBot
			i18n={gradio.i18n}
			selectable={gradio.props._selectable}
			likeable={gradio.props.likeable}
			feedback_options={gradio.props.feedback_options}
			feedback_value={gradio.props.feedback_value}
			show_share_button={(gradio.props.buttons ?? ["share"]).some(
				(btn) => typeof btn === "string" && btn === "share"
			)}
			show_copy_all_button={(gradio.props.buttons ?? ["copy_all"]).some(
				(btn) => typeof btn === "string" && btn === "copy_all"
			)}
			value={_value}
			latex_delimiters={gradio.props.latex_delimiters}
			display_consecutive_in_same_bubble={gradio.props
				.group_consecutive_messages}
			render_markdown={gradio.props.render_markdown}
			theme_mode={gradio.shared.theme_mode}
			editable={gradio.props.editable}
			pending_message={gradio.shared.loading_status?.status === "pending"}
			generating={gradio.shared.loading_status?.status === "generating"}
			rtl={gradio.props.rtl}
			show_copy_button={(gradio.props.buttons ?? ["copy"]).some(
				(btn) => typeof btn === "string" && btn === "copy"
			)}
			buttons={gradio.props.buttons}
			on_custom_button_click={(id) => {
				gradio.dispatch_to(id, "click", null);
			}}
			like_user_message={gradio.props.like_user_message}
			show_progress={gradio.shared.loading_status?.show_progress || "full"}
			on:change={() => (
				(gradio.props.value = gradio.props.value),
				gradio.dispatch("change", gradio.props.value)
			)}
			on:select={(e) => gradio.dispatch("select", e.detail)}
			on:like={(e) => gradio.dispatch("like", e.detail)}
			on:share={(e) => gradio.dispatch("share", e.detail)}
			on:error={(e) => gradio.dispatch("error", e.detail)}
			on:example_select={(e) => gradio.dispatch("example_select", e.detail)}
			on:option_select={(e) => gradio.dispatch("option_select", e.detail)}
			on:retry={(e) => gradio.dispatch("retry", e.detail)}
			on:undo={(e) => gradio.dispatch("undo", e.detail)}
			on:clear={() => {
				gradio.props.value = [];
				gradio.dispatch("clear");
			}}
			on:copy={(e) => gradio.dispatch("copy", e.detail)}
			on:edit={(e) => {
				if (gradio.props.value === null || gradio.props.value.length === 0)
					return;
				//@ts-ignore
				gradio.props.value[e.detail.index].content = [
					{ text: e.detail.value, type: "text" }
				];
				gradio.dispatch("edit", e.detail);
			}}
			avatar_images={gradio.props.avatar_images}
			sanitize_html={gradio.props.sanitize_html}
			line_breaks={gradio.props.line_breaks}
			autoscroll={gradio.props.autoscroll}
			layout={gradio.props.layout}
			placeholder={gradio.props.placeholder}
			examples={gradio.props.examples}
			_retryable={gradio.props._retryable}
			_undoable={gradio.props._undoable}
			upload={(...args) => gradio.shared.client.upload(...args)}
			_fetch={(...args) => gradio.shared.client.fetch(...args)}
			load_component={gradio.shared.load_component}
			allow_file_downloads={gradio.props.allow_file_downloads}
			allow_tags={gradio.props.allow_tags}
			watermark={gradio.props.watermark}
		/>
	</div>
</Block>

<style>
	.wrapper {
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: start;
		width: 100%;
		height: 100%;
		flex-grow: 1;
	}

	:global(.progress-text) {
		right: auto;
	}
</style>
