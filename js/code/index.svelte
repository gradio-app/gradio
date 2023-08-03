<script lang="ts">
	import { createEventDispatcher, afterUpdate } from "svelte";
	import { _ } from "svelte-i18n";

	import type { LoadingStatus } from "@gradio/statustracker/types";

	import StaticCode from "./static";
	import InteractiveCode from "./interactive";

	export let value = "";
	export let value_is_output = false;
	export let language = "";
	export let lines = 5;
	export let target: HTMLElement;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let mode: "static" | "dynamic";
	export let label = "Code";
	export let show_label = true;
	export let loading_status: LoadingStatus;
</script>

{#if mode == "static"}
	<StaticCode
		bind:value
		bind:value_is_output
		{language}
		{lines}
		{target}
		{elem_id}
		{elem_classes}
		{visible}
		{label}
		{show_label}
		{loading_status}
		on:change
		on:input
	/>
{:else}
	<InteractiveCode
		bind:value
		bind:value_is_output
		{language}
		{lines}
		{target}
		{elem_id}
		{elem_classes}
		{visible}
		{label}
		{show_label}
		{loading_status}
		on:change
		on:input
	/>
{/if}
