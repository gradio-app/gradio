<script lang="ts">
	import { createEventDispatcher, afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import type { SelectData } from "@gradio/utils";

	export let value: (string | number)[] = [];
	let old_value: (string | number)[] = value.slice();
	export let value_is_output = false;
	export let choices: [string, string | number][];
	export let disabled = false;
	export let label: string;
	export let info: string | undefined = undefined;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: (string | number)[];
		input: undefined;
		select: SelectData;
	}>();

	function toggleChoice(choice: string | number): void {
		if (value.includes(choice)) {
			value.splice(value.indexOf(choice), 1);
		} else {
			value.push(choice);
		}
		value = value;
	}

	function handle_change(): void {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}

	afterUpdate(() => {
		value_is_output = false;
	});

	$: {
		if (JSON.stringify(value) !== JSON.stringify(old_value)) {
			old_value = value.slice();
			handle_change();
		}
	}
</script>

<BlockTitle {show_label} {info}>{label}</BlockTitle>

<div class="wrap" data-testid="checkbox-group">
	{#each choices as choice, i}
		<label class:disabled class:selected={value.includes(choice[1])}>
			<input
				{disabled}
				on:change={() => toggleChoice(choice[1])}
				on:input={(evt) =>
					dispatch("select", {
						index: i,
						value: choice[1],
						selected: evt.currentTarget.checked,
					})}
				on:keydown={(event) => {
					if (event.key === "Enter") {
						toggleChoice(choice[1]);
						dispatch("select", {
							index: i,
							value: choice[1],
							selected: !value.includes(choice[1]),
						});
					}
				}}
				checked={value.includes(choice[1])}
				type="checkbox"
				name={choice[1]?.toString()}
				title={choice[1]?.toString()}
			/>
			<span class="ml-2">{choice[0]}</span>
		</label>
	{/each}
</div>

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
</style>
