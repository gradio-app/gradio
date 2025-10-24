<script context="module" lang="ts">
	export { default as BaseDropdown } from "./shared/Dropdown.svelte";
	export { default as BaseDropdownOptions } from "./shared/DropdownOptions.svelte";
	export { default as BaseMultiselect } from "./shared/Multiselect.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import Multiselect from "./shared/Multiselect.svelte";
	import Dropdown from "./shared/Dropdown.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type {DropdownProps, DropdownEvents} from "./types.ts";

	let props = $props();
	const gradio = new Gradio<DropdownEvents, DropdownProps>(props);
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	padding={gradio.shared.container}
	allow_overflow={false}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>

	{#if gradio.props.multiselect}
		<Multiselect
			{gradio}
		/>
	{:else}
		<Dropdown
			{gradio}
		/>
	{/if}
</Block>
