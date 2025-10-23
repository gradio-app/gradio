<script context="module" lang="ts">
	export { default as BaseChatBot } from "./shared/ChatBot.svelte";
</script>

<script lang="ts">
	import ChatBot from "./shared/ChatBot.svelte";
	import { Block, BlockLabel } from "@gradio/atoms";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { Chat } from "@gradio/icons";
	import type { FileData } from "@gradio/client";
	import { StatusTracker } from "@gradio/statustracker";
	import type {
		Message,
		ExampleMessage,
		TupleFormat,
		NormalisedMessage,
	} from "./types";
	import type { SharedProps } from "@gradio/core";
	import type { ChatbotProps, ChatbotEvents } from "./types";
	import { normalise_tuples, normalise_messages } from "./shared/utils";
	import { Gradio } from "@gradio/utils";
	// export let elem_id = "";
	// export let elem_classes: string[] = [];
	// export let visible: boolean | "hidden" = true;
	// export let value: TupleFormat | Message[] = [];
	// export let scale: number | null = null;
	// export let min_width: number | undefined = undefined;
	// export let label: string;
	// export let show_label = true;
	// export let root: string;
	// export let _selectable = false;
	// export let likeable = false;
	// export let feedback_options: string[] = ["Like", "Dislike"];
	// export let feedback_value: (string | null)[] | null = null;
	// export let show_share_button = false;
	// export let rtl = false;
	// export let show_copy_button = true;
	// export let show_copy_all_button = false;
	// export let sanitize_html = true;
	// export let layout: "bubble" | "panel" = "bubble";
	// export let type: "tuples" | "messages" = "tuples";
	// export let render_markdown = true;
	// export let line_breaks = true;
	// export let autoscroll = true;
	// export let _retryable = false;
	// export let _undoable = false;
	// export let group_consecutive_messages = true;
	// export let allow_tags: string[] | boolean = false;
	// export let latex_delimiters: {
	// 	left: string;
	// 	right: string;
	// 	display: boolean;
	// }[];
	// export let gradio: Gradio<{
	// 	change: typeof value;
	// 	select: SelectData;
	// 	share: ShareData;
	// 	error: string;
	// 	like: LikeData;
	// 	clear_status: LoadingStatus;
	// 	example_select: SelectData;
	// 	option_select: SelectData;
	// 	edit: SelectData;
	// 	retry: UndoRetryData;
	// 	undo: UndoRetryData;
	// 	clear: null;
	// 	copy: CopyData;
	// }>;

	// $: _value =
	// 	type === "tuples"
	// 		? normalise_tuples(value as TupleFormat, root)
	// 		: normalise_messages(value as Message[], root);

	// export let avatar_images: [FileData | null, FileData | null] = [null, null];
	// export let like_user_message = false;
	// export let loading_status: LoadingStatus | undefined = undefined;
	// export let height: number | string | undefined;
	// export let resizable: boolean;
	// export let min_height: number | string | undefined;
	// export let max_height: number | string | undefined;
	// export let editable: "user" | "all" | null = null;
	// export let placeholder: string | null = null;
	// export let examples: ExampleMessage[] | null = null;
	// export let theme_mode: "system" | "light" | "dark";
	// export let allow_file_downloads = true;
	// export let watermark: string | null = null;

	let props = $props();
	const gradio = new Gradio<ChatbotEvents, ChatbotProps>(props);

	let _value: NormalisedMessage[] | null = $derived(
		gradio.props.type === "tuples"
			? normalise_tuples(gradio.props.value as TupleFormat, gradio.shared.root)
			: normalise_messages(gradio.props.value as Message[], gradio.shared.root),
	);
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
			show_progress={gradio.shared.loading_status.show_progress === "hidden"
				? "hidden"
				: "minimal"}
			on:clear_status={() =>
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
			show_share_button={gradio.props.show_share_button}
			show_copy_all_button={gradio.props.show_copy_all_button}
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
			show_copy_button={gradio.props.show_copy_button}
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
				if (gradio.props.type === "messages") {
					//@ts-ignore
					gradio.props.value[e.detail.index].content = e.detail.value;
				} else {
					//@ts-ignore
					value[e.detail.index[0]][e.detail.index[1]] = e.detail.value;
				}

				gradio.dispatch("edit", e.detail);
			}}
			avatar_images={gradio.props.avatar_images}
			sanitize_html={gradio.props.sanitize_html}
			line_breaks={gradio.props.line_breaks}
			autoscroll={gradio.shared.autoscroll}
			layout={gradio.props.layout}
			placeholder={gradio.props.placeholder}
			examples={gradio.props.examples}
			_retryable={gradio.props._retryable}
			_undoable={gradio.props._undoable}
			upload={(...args) => gradio.shared.client.upload(...args)}
			_fetch={(...args) => gradio.shared.client.fetch(...args)}
			load_component={gradio.load_component}
			msg_format={gradio.props.type}
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
