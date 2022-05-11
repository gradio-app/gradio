<script lang="ts">
	import { Dropdown } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";

	export let label: string = "Dropdown";
	export let value: string = "";
	export let style: string = "";
	export let choices: Array<string>;
	export let form_position: "first" | "last" | "mid" | "single" = "single";
	export let show_label: boolean;

	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";
</script>

<Block {form_position}>
	<StatusTracker {...loading_status} />

	<Dropdown bind:value {style} {choices} {label} {show_label} on:change />
</Block>
