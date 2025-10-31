<script lang="ts">
	import type { SimpleDropdownProps, SimpleDropdownEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";

	const props = $props();
	const gradio = new Gradio<SimpleDropdownEvents, SimpleDropdownProps>(props);

	let display_value = $state("");
	let candidate: [string, string | number][] = [];
	let old_value = $state(gradio.props.value);

	const container = true;

	$effect(() => {
		if (display_value) {
			candidate = gradio.props.choices.filter(
				(choice) => choice[0] === display_value
			);
			gradio.props.value = candidate.length ? candidate[0][1] : "";
			gradio.dispatch("input");
		}
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	padding={container}
	allow_overflow={false}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
>
	{#if gradio.shared.loading_status}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on:clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
	{/if}

	<label class:container>
		<BlockTitle show_label={gradio.shared.show_label} info={undefined}
			>{gradio.shared.label}</BlockTitle
		>
		<select disabled={!gradio.shared.interactive} bind:value={display_value}>
			{#each gradio.props.choices as choice}
				<option>{choice[0]}</option>
			{/each}
		</select>
	</label>
</Block>

<style>
	select {
		--ring-color: transparent;
		display: block;
		position: relative;
		outline: none !important;
		box-shadow:
			0 0 0 var(--shadow-spread) var(--ring-color),
			var(--shadow-inset);
		border: var(--input-border-width) solid var(--border-color-primary);
		border-radius: var(--radius-lg);
		background-color: var(--input-background-base);
		padding: var(--size-2-5);
		width: 100%;
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-sm);
	}

	select:focus {
		--ring-color: var(--color-focus-ring);
		border-color: var(--input-border-color-focus);
	}

	select::placeholder {
		color: var(--color-text-placeholder);
	}

	select[disabled] {
		cursor: not-allowed;
		box-shadow: none;
	}
</style>
