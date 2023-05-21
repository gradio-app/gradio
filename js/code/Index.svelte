<script lang="ts">
	import { createEventDispatcher, afterUpdate } from "svelte";
	import { _ } from "svelte-i18n";

	import type { LoadingStatus } from "../app/src/components/StatusTracker/types";

	import Code from "./interactive/Code.svelte";
	import StatusTracker from "../app/src/components/StatusTracker/StatusTracker.svelte";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { Code as CodeIcon } from "@gradio/icons";

	import Widget from "./interactive/Widgets.svelte";

	const dispatch = createEventDispatcher<{
		change: typeof value;
		input: undefined;
	}>();

	export let value: string = "";
	export let value_is_output: boolean = false;
	export let language: string = "";
	export let lines: number = 5;
	export let target: HTMLElement;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let mode: "static" | "dynamic";
	export let label: string = "Code";
	export let show_label: boolean = true;
	export let loading_status: LoadingStatus;

	let dark_mode = target.classList.contains("dark");

	function handle_change() {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});
	$: value, handle_change();
</script>

{#if mode === "static"}
	<Block variant={"solid"} padding={false} {elem_id} {elem_classes} {visible}>
		<StatusTracker {...loading_status} />

		<BlockLabel Icon={CodeIcon} {show_label} {label} float={false} />

		{#if !value}
			<Empty size="large" unpadded_box={true}>
				<CodeIcon />
			</Empty>
		{:else}
			<Widget {language} {value} />

			<Code bind:value {language} {lines} {dark_mode} readonly />
		{/if}
	</Block>
{:else}
	<Block variant={"solid"} padding={false} {elem_id} {elem_classes} {visible}>
		<StatusTracker {...loading_status} />

		<BlockLabel Icon={CodeIcon} {show_label} {label} float={false} />

		<Code bind:value {language} {lines} {dark_mode} />
	</Block>
{/if}

<style>
</style>
