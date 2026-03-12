<svelte:options immutable={true} />

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import { Block, BlockTitle, IconButtonWrapper } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import { dequal } from "dequal";
	import type { CheckboxGroupProps, CheckboxGroupEvents } from "./types";

	let props = $props();

	let gradio = new Gradio<CheckboxGroupEvents, CheckboxGroupProps>(props);

	function toggle_choice(choice: string | number): void {
		if (gradio.props.value.includes(choice)) {
			gradio.props.value = gradio.props.value.filter((v) => v !== choice);
		} else {
			gradio.props.value = [...gradio.props.value, choice];
		}
		gradio.dispatch("input");
	}

	function toggle_select_all(): void {
		const all_values = gradio.props.choices.map(
			([, internal_value]) => internal_value
		);
		if (gradio.props.value.length === all_values.length) {
			gradio.props.value = [];
		} else {
			gradio.props.value = all_values.slice();
		}
		gradio.dispatch("input");
	}

	let select_all_state = $derived.by(() => {
		const all_values = gradio.props.choices.map(
			([, internal_value]) => internal_value
		);
		if (gradio.props.value.length === 0) return "unchecked";
		if (gradio.props.value.length === all_values.length) return "checked";
		return "indeterminate";
	});

	let disabled = $derived(!gradio.shared.interactive);
	let old_value = gradio.props.value;
	$effect(() => {
		gradio.props.value;
		if (dequal(old_value, gradio.props.value)) {
			return;
		}

		old_value = gradio.props.value;
		gradio.dispatch("change", $state.snapshot(gradio.props.value));
	});
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	type="fieldset"
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on_clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
	{#if gradio.shared.show_label && gradio.props.buttons && gradio.props.buttons.length > 0}
		<IconButtonWrapper
			buttons={gradio.props.buttons}
			on_custom_button_click={(id) => {
				gradio.dispatch("custom_button_click", { id });
			}}
		/>
	{/if}
	<BlockTitle
		show_label={gradio.shared.show_label ||
			(gradio.props.show_select_all && gradio.shared.interactive)}
		info={gradio.props.info}
	>
		{#if gradio.props.show_select_all && gradio.shared.interactive}
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
					{gradio.shared.show_label ? gradio.shared.label : "Select All"}
				</button>
			</div>
		{:else if gradio.shared.show_label}
			{gradio.shared.label || gradio.i18n("checkbox.checkbox_group")}
		{/if}
	</BlockTitle>

	<div class="wrap" data-testid="checkbox-group">
		{#each gradio.props.choices as [display_value, internal_value], i}
			<label
				class:disabled
				class:selected={gradio.props.value.includes(internal_value)}
			>
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
								selected: !gradio.props.value.includes(internal_value)
							});
						}
					}}
					checked={gradio.props.value.includes(internal_value)}
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
		cursor: not-allowed !important;
	}

	input[disabled] {
		opacity: 0.75;
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
