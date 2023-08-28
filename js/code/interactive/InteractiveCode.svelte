<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { afterUpdate } from "svelte";

	import type { LoadingStatus } from "@gradio/statustracker";
	import { _ } from "svelte-i18n";
	import Code from "../shared";
	import { StatusTracker } from "@gradio/statustracker";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { Code as CodeIcon } from "@gradio/icons";

	export let value = "";
	export let value_is_output = false;
	export let language = "";
	export let lines = 5;
	export let target: HTMLElement;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let label = $_("code.code");
	export let show_label = true;
	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		change: typeof value;
		input: never;
	}>;

	let dark_mode = target.classList.contains("dark");

	function handle_change(): void {
		gradio.dispatch("change", value);
		if (!value_is_output) {
			gradio.dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});
	$: value, handle_change();
</script>

<Block variant={"solid"} padding={false} {elem_id} {elem_classes} {visible}>
	<StatusTracker {...loading_status} />

	<BlockLabel Icon={CodeIcon} {show_label} {label} float={false} />

	<Code bind:value {language} {lines} {dark_mode} />
</Block>
