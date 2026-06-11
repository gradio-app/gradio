<script context="module" lang="ts">
	export { default as BaseChatBot } from "./shared/ChatBot.svelte";
</script>

<script lang="ts">
	import ChatBot from "./shared/ChatBot.svelte";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { Chat } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import type { Message, NormalisedMessage } from "./types";
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
	rtl={gradio.props.rtl}
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
				gradio.dispatch("custom_button_click", { id });
			}}
			like_user_message={gradio.props.like_user_message}
			show_progress={gradio.shared.loading_status?.show_progress || "full"}
			onchange={() => {
				gradio.props.value = gradio.props.value;
				gradio.dispatch("change", gradio.props.value);
			}}
			onselect={(data) => gradio.dispatch("select", data)}
			onlike={(data) => gradio.dispatch("like", data)}
			onshare={(data) => gradio.dispatch("share", data)}
			onerror={(message) => gradio.dispatch("error", message)}
			onexampleselect={(data) => gradio.dispatch("example_select", data)}
			onoptionselect={(data) => gradio.dispatch("option_select", data)}
			onretry={(data) => gradio.dispatch("retry", data)}
			onundo={(data) => gradio.dispatch("undo", data)}
			onclear={() => {
				gradio.props.value = [];
				gradio.dispatch("clear");
			}}
			oncopy={(data) => gradio.dispatch("copy", data)}
			onedit={(data) => {
				if (gradio.props.value === null || gradio.props.value.length === 0)
					return;
				//@ts-ignore
				gradio.props.value[data.index].content = [
					{ text: data.value, type: "text" }
				];
				gradio.dispatch("edit", data);
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
