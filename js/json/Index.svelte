<script lang="ts" context="module">
	export { default as BaseJSON } from "./shared/JSON.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import JSON from "./shared/JSON.svelte";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { JSON as JSONIcon } from "@gradio/icons";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

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
		clear_status: LoadingStatus;
	}>;
	export let open = false;
	export let theme_mode: "system" | "light" | "dark";
	export let show_indices: boolean;
	export let height: string | number | undefined = undefined;

	$: {
		if (value !== old_value) {
			old_value = value;
			gradio.dispatch("change");
		}
	}

	let label_height = 0;
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
	allow_overflow={false}
	{height}
>
	<div bind:clientHeight={label_height}>
		{#if label}
			<BlockLabel
				Icon={JSONIcon}
				{show_label}
				{label}
				float={false}
				disable={container === false}
			/>
		{/if}
	</div>

	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>

	<JSON {value} {open} {theme_mode} {show_indices} {label_height} />
</Block>
