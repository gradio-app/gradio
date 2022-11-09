<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { _ } from "svelte-i18n";

	import type { FileData } from "@gradio/upload";
	import type { LoadingStatus } from "../StatusTracker/types";

	import { Code } from "@gradio/code";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { Code as CodeIcon } from "@gradio/icons";
	import type { Styles } from "@gradio/utils";
	export let style: Styles = {};

	const dispatch = createEventDispatcher<{
		change: typeof value;
		stream: typeof value;
		error: string;
	}>();

	export let value: {
		lang: string;
		code: string;
	} = { lang: "", code: "" };

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let mode: "static" | "dynamic";
	export let source: "microphone" | "upload";
	export let label: string = "Code";
	// export let root: string;
	// export let show_label: boolean;
	// export let pending: boolean;
	// export let streaming: boolean;
	// export let root_url: null | string;

	export let loading_status: LoadingStatus;

	$: console.log({ label, value });
</script>

<Block
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	color={"grey"}
	padding={false}
	{elem_id}
	{visible}
>
	<StatusTracker {...loading_status} />

	<BlockLabel Icon={CodeIcon} {label} />

	<Code
		{label}
		bind:value={value.code}
		lang={value.lang}
		readonly={mode === "static"}
	/>
</Block>
