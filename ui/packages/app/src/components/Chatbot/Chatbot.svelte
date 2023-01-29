<script lang="ts">
	import { ChatBot } from "@gradio/chatbot";
	import { Block, BlockLabel } from "@gradio/atoms";
	import type { LoadingStatus } from "../StatusTracker/types";
	import type { Styles } from "@gradio/utils";
	import { Chat } from "@gradio/icons";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: Array<[string, string]> = [];
	export let style: Styles = {};
	export let label: string;
	export let show_label: boolean = true;
	export let color_map: Record<string, string> = {};

	$: if (!style.color_map && Object.keys(color_map).length) {
		style.color_map = color_map;
	}

	export let loading_status: LoadingStatus | undefined;
</script>

<Block padding={false} {elem_id} {visible}>
	{#if show_label}
		<BlockLabel
			{show_label}
			Icon={Chat}
			label={label || "Chatbot"}
			disable={typeof style.container === "boolean" && !style.container}
		/>
	{/if}
	<ChatBot
		{style}
		{value}
		pending_message={loading_status?.status === "pending"}
		on:change
	/>
</Block>
