<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { JSON } from "@gradio/json";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { JSON as JSONIcon } from "@gradio/icons";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: any;
	let old_value: any;
	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
	export let container: boolean = false;
	export let scale: number = 1;
	export let min_width: number | undefined = undefined;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: {
		if (value !== old_value) {
			old_value = value;
			dispatch("change");
		}
	}
</script>

<Block
	{visible}
	test_id="json"
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
	padding={false}
>
	{#if label}
		<BlockLabel
			Icon={JSONIcon}
			{show_label}
			{label}
			float={false}
			disable={container === false}
		/>
	{/if}

	<StatusTracker {...loading_status} />

	<JSON {value} />
</Block>
