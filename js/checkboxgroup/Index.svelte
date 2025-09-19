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
	export let visible: boolean | "hidden" = true;
	export let value: (string | number)[] = [];
	export let choices: [string, string | number][];
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let label = gradio.i18n("checkbox.checkbox_group");
	export let info: string | undefined = undefined;
	export let show_label = true;
	export let show_select_all = false;

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

	function toggle_select_all(): void {
		const all_values = choices.map(([, internal_value]) => internal_value);
		if (value.length === all_values.length) {
			value = [];
		} else {
			value = all_values.slice();
		}
		gradio.dispatch("input");
	}

	$: select_all_state = (() => {
		const all_values = choices.map(([, internal_value]) => internal_value);
		if (value.length === 0) return "unchecked";
		if (value.length === all_values.length) return "checked";
		return "indeterminate";
	})();

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
	<BlockTitle
		show_label={show_label || (show_select_all && interactive)}
		{info}
	>
		{#if show_select_all && interactive}
			<div class="select-all-container">
				<label class="select-all-label">
					<input
						class="select-all-checkbox"
						on:change={toggle_select_all}
						checked={select_all_state === "checked"}
						indeterminate={select_all_state === "indeterminate"}
						type="checkbox"
						title="Select/Deselect All"
					/>
				</label>
				<button type="button" class="label-text" on:click={toggle_select_all}>
					{show_label ? label : "Select All"}
				</button>
			</div>
		{:else if show_label}
			{label}
		{/if}
	</BlockTitle>

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

	.select-all-container {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.select-all-label {
		display: flex;
		align-items: center;
		cursor: pointer;
		margin: 0;
		padding: 0;
		background: none;
		border: none;
		box-shadow: none;
	}

	.select-all-checkbox {
		--ring-color: transparent;
		position: relative;
		box-shadow: var(--checkbox-shadow);
		border: var(--checkbox-border-width) solid var(--checkbox-border-color);
		border-radius: var(--checkbox-border-radius);
		background-color: var(--checkbox-background-color);
		line-height: var(--line-sm);
		margin: 0;
	}

	.select-all-checkbox:checked,
	.select-all-checkbox:checked:hover,
	.select-all-checkbox:checked:focus {
		border-color: var(--checkbox-border-color-selected);
		background-image: var(--checkbox-check);
		background-color: var(--checkbox-background-color-selected);
	}

	.select-all-checkbox:indeterminate,
	.select-all-checkbox:indeterminate:hover {
		border-color: var(--checkbox-border-color-selected);
		background-color: var(--checkbox-background-color-selected);
		position: relative;
	}

	.select-all-checkbox:indeterminate::after {
		content: "";
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 60%;
		height: 2px;
		background-color: white;
	}

	.select-all-checkbox:not(:indeterminate):not(:checked):hover {
		border-color: var(--checkbox-border-color-hover);
		background-color: var(--checkbox-background-color-hover);
		cursor: pointer;
	}

	.label-text {
		margin: 0;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: left;
	}
</style>
