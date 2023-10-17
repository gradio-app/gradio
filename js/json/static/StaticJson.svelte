<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import JSONComponent from "./JSON.svelte";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { JSON as JSONIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { _ } from "svelte-i18n";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: any;
	let old_value: any;
	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let gradio: Gradio<{
		change: never;
	}>;

	$: {
		if (value !== old_value) {
			old_value = value;
			gradio.dispatch("change");
		}
	}

	function is_empty(obj: object): boolean {
		return (
			obj &&
			Object.keys(obj).length === 0 &&
			Object.getPrototypeOf(obj) === Object.prototype &&
			JSON.stringify(obj) === "{}"
		);
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

	{#if value && value !== '""' && !is_empty(value)}
		<JSONComponent {value} />
	{:else}
		<Empty>
			<JSONIcon />
		</Empty>
	{/if}
</Block>
