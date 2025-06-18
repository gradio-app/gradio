<script context="module" lang="ts">
	export { default as BaseChatBot } from "./shared/ChatBot.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData, LikeData, CopyData } from "@gradio/utils";

	import ChatBot from "./shared/ChatBot.svelte";
	import type { UndoRetryData } from "./shared/utils";
	import { Block, BlockLabel } from "@gradio/atoms";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { Chat } from "@gradio/icons";
	import type { FileData } from "@gradio/client";
	import { StatusTracker } from "@gradio/statustracker";
	import type {
		Message,
		ExampleMessage,
		TupleFormat,
		NormalisedMessage
	} from "./types";

	import { normalise_tuples, normalise_messages } from "./shared/utils";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: TupleFormat | Message[] = [];
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let label: string;
	export let show_label = true;
	export let root: string;
	export let _selectable = false;
	export let likeable = false;
	export let feedback_options: string[] = ["Like", "Dislike"];
	export let feedback_value: (string | null)[] | null = null;
	export let show_share_button = false;
	export let rtl = false;
	export let show_copy_button = true;
	export let show_copy_all_button = false;
	export let sanitize_html = true;
	export let layout: "bubble" | "panel" = "bubble";
	export let type: "tuples" | "messages" = "tuples";
	export let render_markdown = true;
	export let line_breaks = true;
	export let autoscroll = true;
	export let _retryable = false;
	export let _undoable = false;
	export let group_consecutive_messages = true;
	export let allow_tags: string[] | boolean = false;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let gradio: Gradio<{
		change: typeof value;
		select: SelectData;
		share: ShareData;
		error: string;
		like: LikeData;
		clear_status: LoadingStatus;
		example_select: SelectData;
		option_select: SelectData;
		edit: SelectData;
		retry: UndoRetryData;
		undo: UndoRetryData;
		clear: null;
		copy: CopyData;
	}>;

	let _value: NormalisedMessage[] | null = [];

	$: _value =
		type === "tuples"
			? normalise_tuples(value as TupleFormat, root)
			: normalise_messages(value as Message[], root);

	export let avatar_images: [FileData | null, FileData | null] = [null, null];
	export let like_user_message = false;
	export let loading_status: LoadingStatus | undefined = undefined;
	export let height: number | string | undefined;
	export let resizable: boolean;
	export let min_height: number | string | undefined;
	export let max_height: number | string | undefined;
	export let editable: "user" | "all" | null = null;
	export let placeholder: string | null = null;
	export let examples: ExampleMessage[] | null = null;
	export let theme_mode: "system" | "light" | "dark";
	export let allow_file_downloads = true;
	export let watermark: string | null = null;
</script>

<Block
	{elem_id}
	{elem_classes}
	{visible}
	padding={false}
	{scale}
	{min_width}
	{height}
	{resizable}
	{min_height}
	{max_height}
	allow_overflow={true}
	flex={true}
	overflow_behavior="auto"
>
	{#if loading_status}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			show_progress={loading_status.show_progress === "hidden"
				? "hidden"
				: "minimal"}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>
	{/if}
	<div class="wrapper">
		{#if show_label}
			<BlockLabel
				{show_label}
				Icon={Chat}
				float={true}
				label={label || "Chatbot"}
			/>
		{/if}
		<ChatBot
			i18n={gradio.i18n}
			selectable={_selectable}
			{likeable}
			{feedback_options}
			{feedback_value}
			{show_share_button}
			{show_copy_all_button}
			value={_value}
			{latex_delimiters}
			display_consecutive_in_same_bubble={group_consecutive_messages}
			{render_markdown}
			{theme_mode}
			{editable}
			pending_message={loading_status?.status === "pending"}
			generating={loading_status?.status === "generating"}
			{rtl}
			{show_copy_button}
			{like_user_message}
			show_progress={loading_status?.show_progress || "full"}
			on:change={() => gradio.dispatch("change", value)}
			on:select={(e) => gradio.dispatch("select", e.detail)}
			on:like={(e) => gradio.dispatch("like", e.detail)}
			on:share={(e) => gradio.dispatch("share", e.detail)}
			on:error={(e) => gradio.dispatch("error", e.detail)}
			on:example_select={(e) => gradio.dispatch("example_select", e.detail)}
			on:option_select={(e) => gradio.dispatch("option_select", e.detail)}
			on:retry={(e) => gradio.dispatch("retry", e.detail)}
			on:undo={(e) => gradio.dispatch("undo", e.detail)}
			on:clear={() => {
				value = [];
				gradio.dispatch("clear");
			}}
			on:copy={(e) => gradio.dispatch("copy", e.detail)}
			on:edit={(e) => {
				if (value === null || value.length === 0) return;
				if (type === "messages") {
					//@ts-ignore
					value[e.detail.index].content = e.detail.value;
				} else {
					//@ts-ignore
					value[e.detail.index[0]][e.detail.index[1]] = e.detail.value;
				}
				value = value;
				gradio.dispatch("edit", e.detail);
			}}
			{avatar_images}
			{sanitize_html}
			{line_breaks}
			{autoscroll}
			{layout}
			{placeholder}
			{examples}
			{_retryable}
			{_undoable}
			upload={(...args) => gradio.client.upload(...args)}
			_fetch={(...args) => gradio.client.fetch(...args)}
			load_component={gradio.load_component}
			msg_format={type}
			{allow_file_downloads}
			{allow_tags}
			{watermark}
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
