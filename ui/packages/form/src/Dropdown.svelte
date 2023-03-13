<script lang="ts">
	import DropdownOptions from "./DropdownOptions.svelte";
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { Remove, DropdownArrow } from "@gradio/icons";
	import type { SelectData } from "@gradio/utils";
	export let label: string;
	export let info: string | undefined = undefined;
	export let value: string | Array<string> | undefined;
	export let multiselect: boolean = false;
	export let max_choices: number;
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: string | Array<string> | undefined;
		select: SelectData;
	}>();

	let inputValue: string,
		activeOption: string,
		showOptions = false;

	$: filtered = choices.filter((o) =>
		inputValue ? o.toLowerCase().includes(inputValue.toLowerCase()) : o
	);
	$: if (
		(activeOption && !filtered.includes(activeOption)) ||
		(!activeOption && inputValue)
	)
		activeOption = filtered[0];

	$: readonly =
		(!multiselect && typeof value === "string") ||
		(multiselect && Array.isArray(value) && value.length === max_choices);

	// The initial value of value is [] so that can
	// cause infinite loops in the non-multiselect case
	$: if (!multiselect && !Array.isArray(value)) {
		dispatch("change", value);
	}

	function add(option: string) {
		if (Array.isArray(value)) {
			if (!max_choices || value.length < max_choices) {
				value.push(option);
				dispatch("select", {
					index: choices.indexOf(option),
					value: option,
					selected: true
				});
				dispatch("change", value);
			}
			showOptions = !(value.length === max_choices);
		}
		value = value;
	}

	function remove(option: string) {
		if (Array.isArray(value)) {
			value = value.filter((v: string) => v !== option);
			dispatch("select", {
				index: choices.indexOf(option),
				value: option,
				selected: false
			});
			dispatch("change", value);
		}
	}

	function remove_all(e: any) {
		if (multiselect) {
			value = [];
		} else {
			value = "";
		}

		inputValue = "";
		e.preventDefault();
		dispatch("change", value);
	}

	function handleOptionMousedown(e: any) {
		const option = e.detail.target.dataset.value;
		inputValue = "";

		if (option !== undefined) {
			if (!multiselect) {
				value = option;
				inputValue = "";
				showOptions = false;
				dispatch("select", {
					index: choices.indexOf(option),
					value: option,
					selected: true
				});
				dispatch("change", value);
				return;
			}
			if (value?.includes(option)) {
				remove(option);
			} else {
				add(option);
			}
		}
	}

	function handleKeyup(e: any) {
		if (e.key === "Enter" && activeOption != undefined) {
			if (!multiselect) {
				value = activeOption;
				inputValue = "";
			} else if (multiselect && Array.isArray(value)) {
				value.includes(activeOption) ? remove(activeOption) : add(activeOption);
				inputValue = "";
			}
		}
		if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			const increment = e.key === "ArrowUp" ? -1 : 1;
			const calcIndex = filtered.indexOf(activeOption) + increment;
			activeOption =
				calcIndex < 0
					? filtered[filtered.length - 1]
					: calcIndex === filtered.length
					? filtered[0]
					: filtered[calcIndex];
		}
		if (e.key === "Escape") {
			showOptions = false;
		}
	}
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label>
	<BlockTitle {show_label} {info}>{label}</BlockTitle>

	<div class="wrap">
		<div class="wrap-inner" class:showOptions>
			{#if Array.isArray(value)}
				{#each value as s}
					<div on:click|preventDefault={() => remove(s)} class="token">
						<span>{s}</span>
						<div
							class:hidden={disabled}
							class="token-remove"
							title="Remove {s}"
						>
							<Remove />
						</div>
					</div>
				{/each}
			{:else}
				<span class="single-select">{value}</span>
			{/if}
			<div class="secondary-wrap">
				<input
					class="border-none"
					{disabled}
					{readonly}
					autocomplete="off"
					bind:value={inputValue}
					on:focus={() =>
						(showOptions =
							Array.isArray(value) && value.length === max_choices
								? false
								: true)}
					on:blur={() => (showOptions = false)}
					on:keyup={handleKeyup}
				/>
				<div
					class:hide={!value?.length || disabled}
					class="token-remove remove-all"
					title="Remove All"
					on:click={remove_all}
				>
					<Remove />
				</div>
				<DropdownArrow />
			</div>
		</div>
		<DropdownOptions
			bind:value
			{showOptions}
			{filtered}
			{activeOption}
			{disabled}
			on:change={handleOptionMousedown}
		/>
	</div>
</label>

<style>
	.wrap {
		position: relative;
		box-shadow: var(--input-shadow);
		border: var(--input-border-width) solid var(--color-border-primary);
		border-radius: var(--input-radius);
		background: var(--input-background);
	}

	.wrap:focus-within {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
	}

	.wrap-inner {
		display: flex;
		position: relative;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--checkbox-label-gap);
		padding: var(--checkbox-label-gap);
	}

	.token {
		display: flex;
		align-items: center;
		transition: var(--button-transition);
		cursor: pointer;
		box-shadow: var(--checkbox-label-shadow);
		border: var(--checkbox-label-border-width) solid
			var(--checkbox-label-border-color);
		border-radius: var(--button-small-radius);
		background: var(--checkbox-label-background);
		padding: var(--checkbox-label-padding);
		color: var(--checkbox-text-color);
		font-weight: var(--checkbox-label-text-weight);
		font-size: var(--checkbox-label-text-size);
		line-height: var(--line-md);
	}

	.token > * + * {
		margin-left: var(--size-2);
	}

	.token-remove {
		fill: var(--body-text-color);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		border: var(--checkbox-border-width) solid var(--color-border-primary);
		border-radius: var(--radius-full);
		background: var(--color-background-primary);
		padding: var(--size-0-5);
		width: 18px;
		height: 18px;
	}

	.single-select {
		margin: var(--spacing-sm);
		color: var(--body-text-color);
	}

	.secondary-wrap {
		display: flex;
		flex: 1 1 0%;
		align-items: center;
		border: none;
		min-width: min-content;
	}

	input {
		margin: var(--spacing-sm);
		outline: none;
		border: none;
		background: inherit;
		width: var(--size-full);
		color: var(--body-text-color);
		font-size: var(--input-text-size);
	}

	input:disabled {
		cursor: not-allowed;
	}

	.remove-all {
		margin-left: var(--size-1);
		width: 20px;
		height: 20px;
	}
</style>
