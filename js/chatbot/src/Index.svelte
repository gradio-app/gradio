<script lang="ts">
	import ChatBot from "./static";
	import { Block, BlockLabel } from "@gradio/atoms";
	import type { LoadingStatus } from "../../app/src/components/StatusTracker/types";
	import type { ThemeMode } from "js/app/src/components/types";
	import { Chat } from "@gradio/icons";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import StatusTracker from "../../app/src/components/StatusTracker/StatusTracker.svelte";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: [string | FileData | null, string | FileData | null][] = [];
	let _value: [string | FileData | null, string | FileData | null][];
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let container = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let label: string;
	export let show_label = true;
	export let root: string;
	export let root_url: null | string;
	export let selectable = false;
	export let theme_mode: ThemeMode;
	export let show_share_button = false;

	const redirect_src_url = (src: string): string =>
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
	export let height = 400;
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
		<ChatBot
			{selectable}
			{show_share_button}
			{theme_mode}
			value={_value}
			{latex_delimiters}
			pending_message={loading_status?.status === "pending"}
			on:change
			on:select
			on:share
			on:error
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
</style>
