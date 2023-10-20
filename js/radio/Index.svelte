<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { afterUpdate } from "svelte";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let gradio: Gradio<{
		change: never;
		select: SelectData;
		input: never;
	}>;
	export let label = gradio.i18n("radio.radio");
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string | number | null = null;
	export let value_is_output = false;
	export let choices: [string, number][] = [];
	export let show_label: boolean;
	export let container = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let mode: "static" | "interactive";

	function handle_change(): void {
		gradio.dispatch("change");
		if (!value_is_output) {
			gradio.dispatch("input");
		}
	}

	afterUpdate(() => {
		value_is_output = false;
	});
	$: value, handle_change();

	$: disabled = mode === "static";
</script>

<Block
	{visible}
	type="fieldset"
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>

	<BlockTitle {show_label} {info}>{label}</BlockTitle>

	<div class="wrap">
		{#each choices as choice, i (i)}
			<label
				class:disabled
				class:selected={value === choice[1]}
				data-testid={`${choice[1]}-radio-label`}
			>
				<input
					{disabled}
					bind:group={value}
					on:input={() =>
						gradio.dispatch("select", { value: choice[1], index: i })}
					type="radio"
					name="radio-{elem_id}"
					value={choice[1]}
				/>
				<span class="ml-2">{choice[0]}</span>
			</label>
		{/each}
	</div>
</Block>

<style>
	.wrap {
		display: flex;
		flex-wrap: wrap;
		gap: var(--checkbox-label-gap);
	}
	label {
		display: flex;
		align-items: center;
		transition: var(--button-transition);
		cursor: pointer;
		box-shadow: var(--checkbox-label-shadow);
		border: var(--checkbox-label-border-width) solid
			var(--checkbox-label-border-color);
		border-radius: var(--button-small-radius);
		background: var(--checkbox-label-background-fill);
		padding: var(--checkbox-label-padding);
		color: var(--checkbox-label-text-color);
		font-weight: var(--checkbox-label-text-weight);
		font-size: var(--checkbox-label-text-size);
		line-height: var(--line-md);
	}

	label:hover {
		background: var(--checkbox-label-background-fill-hover);
	}
	label:focus {
		background: var(--checkbox-label-background-fill-focus);
	}

	label.selected {
		background: var(--checkbox-label-background-fill-selected);
		color: var(--checkbox-label-text-color-selected);
	}

	label > * + * {
		margin-left: var(--size-2);
	}

	input {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--checkbox-shadow);
		border: var(--checkbox-border-width) solid var(--checkbox-border-color);
		border-radius: var(--radius-full);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
	}

	input:checked,
	input:checked:hover {
		border-color: var(--checkbox-border-color-selected);
		background-image: var(--radio-circle);
		background-color: var(--checkbox-background-color-selected);
	}

	input:hover {
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-color-hover);
	}

	input:focus {
		border-color: var(--checkbox-border-color-focus);
		background-color: var(--checkbox-background-color-focus);
	}

	input:checked:focus {
		border-color: var(--checkbox-border-color-focus);
		background-image: var(--radio-circle);
		background-color: var(--checkbox-background-color-selected);
	}

	input[disabled],
	.disabled {
		cursor: not-allowed;
	}
</style>
