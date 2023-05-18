<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";
	import { Block, BlockLabel } from "@gradio/atoms";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";
	import type { ThemeMode } from "js/app/src/components/types";
	import { Chat } from "@gradio/icons";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: Array<
		[string | FileData | null, string | FileData | null]
	> = [];
	let _value: Array<[string | FileData | null, string | FileData | null]>;
	export let style: Styles = {};
	export let label: string;
	export let show_label: boolean = true;
	export let root: string;
	export let root_url: null | string;
	export let selectable: boolean = false;
	export let theme_mode: ThemeMode;

	const redirect_src_url = (src: string) =>
		src.replace('src="/file', `src="${root}file`);

	$: _value = value
		? value.map(([user_msg, bot_msg]) => [
				typeof user_msg === "string"
					? redirect_src_url(user_msg)
					: normalise_file(user_msg, root, root_url),
				typeof bot_msg === "string"
					? redirect_src_url(bot_msg)
					: normalise_file(bot_msg, root, root_url)
		  ])
		: [];
	export let loading_status: LoadingStatus | undefined = undefined;
</script>

<Block {elem_id} {elem_classes} {visible} padding={false}>
	{#if show_label}
		<BlockLabel
			{show_label}
			Icon={Chat}
			float={false}
			label={label || "Chatbot"}
			disable={typeof style.container === "boolean" && !style.container}
		/>
	{/if}
	<ChatBot
		{style}
		{selectable}
		{theme_mode}
		value={_value}
		pending_message={loading_status?.status === "pending"}
		on:change
		on:select
	/>
</Block>
