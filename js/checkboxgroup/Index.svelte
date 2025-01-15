<svelte:options immutable={true} />

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { Block, BlockTitle } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let gradio: Gradio<{
		change: never;
		select: SelectData;
		input: never;
		clear_status: LoadingStatus;
	}>;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: (string | number)[] = [];
	export let choices: [string, string | number][];
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let label = gradio.i18n("checkbox.checkbox_group");
	export let info: string | undefined = undefined;
	export let show_label = true;
	export let root: string;

	export let loading_status: LoadingStatus;
	export let interactive = true;
	export let old_value = value.slice();

	function toggle_choice(choice: string | number): void {
		if (value.includes(choice)) {
			value = value.filter((v) => v !== choice);
		} else {
			value = [...value, choice];
		}
		gradio.dispatch("input");
	}

	$: disabled = !interactive;

	$: if (JSON.stringify(old_value) !== JSON.stringify(value)) {
		old_value = value;
		gradio.dispatch("change");
	}
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	type="fieldset"
	{container}
	{scale}
	{min_width}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
	<BlockTitle {root} {show_label} {info}>{label}</BlockTitle>

	<div class="wrap" data-testid="checkbox-group">
		{#each choices as [display_value, internal_value], i}
			<label class:disabled class:selected={value.includes(internal_value)}>
				<input
					{disabled}
					on:change={() => toggle_choice(internal_value)}
					on:input={(evt) =>
						gradio.dispatch("select", {
							index: i,
							value: internal_value,
							selected: evt.currentTarget.checked
						})}
					on:keydown={(event) => {
						if (event.key === "Enter") {
							toggle_choice(internal_value);
							gradio.dispatch("select", {
								index: i,
								value: internal_value,
								selected: !value.includes(internal_value)
							});
						}
					}}
					checked={value.includes(internal_value)}
					type="checkbox"
					name={internal_value?.toString()}
					title={internal_value?.toString()}
				/>
				<span class="ml-2">{display_value}</span>
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
		border-radius: var(--checkbox-border-radius);
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
		border-color: var(--checkbox-label-border-color-selected);
	}

	label > * + * {
		margin-left: var(--size-2);
	}

	input {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--checkbox-shadow);
		border: var(--checkbox-border-width) solid var(--checkbox-border-color);
		border-radius: var(--checkbox-border-radius);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
	}

	input:checked,
	input:checked:hover,
	input:checked:focus {
		border-color: var(--checkbox-border-color-selected);
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
	}

	input:checked:focus {
		border-color: var(--checkbox-border-color-focus);
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
	}

	input:hover {
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-color-hover);
	}

	input:not(:checked):focus {
		border-color: var(--checkbox-border-color-focus);
	}

	input[disabled],
	.disabled {
		cursor: not-allowed;
	}

	input:hover {
		cursor: pointer;
	}
</style>
