<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";
	import { Block, BlockLabel, IconButton } from "@gradio/atoms";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { ThemeMode } from "js/app/src/components/types";
	import { Chat } from "@gradio/icons";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import { Community } from "@gradio/icons";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: Array<
		[string | FileData | null, string | FileData | null]
	> = [];
	let _value: Array<[string | FileData | null, string | FileData | null]>;
	export let latex_delimiters: Array<{
		left: string;
		right: string;
		display: boolean;
	}>;
	export let container: boolean = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let label: string;
	export let show_label: boolean = true;
	export let root: string;
	export let root_url: null | string;
	export let selectable: boolean = false;
	export let theme_mode: ThemeMode;
	export let shareable: boolean = true;

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
	export let height: number = 400;
</script>

<Block
	{elem_id}
	{elem_classes}
	{visible}
	padding={false}
	{container}
	{scale}
	{min_width}
	{height}
	allow_overflow={false}
>
	{#if loading_status}
		<StatusTracker
			{...loading_status}
			show_progress={loading_status.show_progress === "hidden"
				? "hidden"
				: "minimal"}
		/>
	{/if}
	<div class="wrapper">
		{#if show_label}
			<BlockLabel
				{show_label}
				Icon={Chat}
				float={false}
				label={label || "Chatbot"}
				disable={container === false}
			/>
		{/if}
		{#if shareable && value.length > 0}
			<div class="icon-button">
				<IconButton Icon={Community} label="Post" show_label={true} />
			</div>
		{/if}
		<ChatBot
			{selectable}
			{theme_mode}
			value={_value}
			{latex_delimiters}
			pending_message={loading_status?.status === "pending"}
			on:change
			on:select
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
	}
	.icon-button {
		position: absolute;
		top: 6px;
		right: 6px;
	}
</style>
