<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { _ } from "svelte-i18n";

	import type { LoadingStatus } from "../app/src/components/StatusTracker/types";

	import Code from "./interactive/Code.svelte";
	import StatusTracker from "../app/src/components/StatusTracker/StatusTracker.svelte";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { Code as CodeIcon } from "@gradio/icons";

	import Widget from "./interactive/Widgets.svelte";

	const dispatch = createEventDispatcher<{
		change: typeof value;
	}>();

	export let value: string = "";
	export let language: string = "";
	export let target: HTMLElement;
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let mode: "static" | "dynamic";
	export let label: string = "Code";
	export let loading_status: LoadingStatus;

	let dark_mode = target.classList.contains("dark");

	$: dispatch("change", value);

	$: console.log(value, language);
</script>

{#if mode === "static"}
	<Block variant={"solid"} padding={false} {elem_id} {visible}>
		<StatusTracker {...loading_status} />

		<BlockLabel Icon={CodeIcon} {label} />

		{#if !value}
			<Empty size="large" unpadded_box={true}>
				<CodeIcon />
			</Empty>
		{:else}
			<Widget {language} {value} />

			<Code bind:value {language} {dark_mode} readonly />
		{/if}
	</Block>
{:else}
	<Block variant={"solid"} padding={false} {elem_id} {visible}>
		<StatusTracker {...loading_status} />

		<BlockLabel Icon={CodeIcon} {label} />

		<Code bind:value {language} {dark_mode} />
	</Block>
{/if}

<style>
</style>
