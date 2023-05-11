<script lang="ts">
	import DropdownOptions from "./DropdownOptions.svelte";
	import { createEventDispatcher, afterUpdate } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { Remove, DropdownArrow } from "@gradio/icons";
	import type { SelectData } from "@gradio/utils";
	export let label: string;
	export let info: string | undefined = undefined;
	export let value: string | Array<string> | undefined;
	let old_value = Array.isArray(value) ? value.slice() : value;
	export let value_is_output: boolean = false;
	export let multiselect: boolean = false;
	export let max_choices: number;
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let show_label: boolean;
	export let allow_custom_value: boolean = false;

	const dispatch = createEventDispatcher<{
		change: string | Array<string> | undefined;
		input: undefined;
		select: SelectData;
		blur: undefined;
	}>();

	let inputValue: string,
		activeOption: string | null,
		showOptions = false,
		filterInput: HTMLElement;

	$: if (typeof value === "string") {
		inputValue = value;
	}

	$: filtered = choices.filter((o) =>
		inputValue ? o.toLowerCase().includes(inputValue.toLowerCase()) : o
	);

	$: if (!activeOption || !filtered.includes(activeOption)) {
		activeOption = filtered.length ? filtered[0] : null;
	}

	function handle_change() {
		dispatch("change", value);
		if (!value_is_output) {
			dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});
	$: {
		if (JSON.stringify(value) != JSON.stringify(old_value)) {
			old_value = Array.isArray(value) ? value.slice() : value;
			handle_change();
		}
	}

	function add(option: string) {
		value = value as Array<string>;
		if (!max_choices || value.length < max_choices) {
			value.push(option);
			dispatch("select", {
				index: choices.indexOf(option),
				value: option,
				selected: true
			});
		}
		value = value;
	}

	function remove(option: string) {
		value = value as Array<string>;
		value = value.filter((v: string) => v !== option);
		dispatch("select", {
			index: choices.indexOf(option),
			value: option,
			selected: false
		});
	}

	function remove_all(e: any) {
		value = [];
		inputValue = "";
		e.preventDefault();
	}

	function handleOptionMousedown(e: any) {
		const option = e.detail.target.dataset.value;
		if (allow_custom_value) {
			inputValue = option;
		}

		if (option !== undefined) {
			if (multiselect) {
				if (value?.includes(option)) {
					remove(option);
				} else {
					add(option);
				}
				inputValue = "";
			} else {
				value = option;
				inputValue = option;
				showOptions = false;
				dispatch("select", {
					index: choices.indexOf(option),
					value: option,
					selected: true
				});
				return;
			}
		}
	}

	function handleKeydown(e: any) {
		if (e.key === "Enter" && activeOption != undefined) {
			if (!multiselect) {
				if (value !== activeOption) {
					value = activeOption;
					dispatch("select", {
						index: choices.indexOf(value),
						value: value,
						selected: true
					});
				}
				inputValue = activeOption;
				showOptions = false;
			} else if (multiselect && Array.isArray(value)) {
				value.includes(activeOption) ? remove(activeOption) : add(activeOption);
				inputValue = "";
			}
		} else {
			showOptions = true;
			if (e.key === "ArrowUp" || e.key === "ArrowDown") {
				if (activeOption === null) {
					activeOption = filtered[0];
				}
				const increment = e.key === "ArrowUp" ? -1 : 1;
				const calcIndex = filtered.indexOf(activeOption) + increment;
				activeOption =
					calcIndex < 0
						? filtered[filtered.length - 1]
						: calcIndex === filtered.length
						? filtered[0]
						: filtered[calcIndex];
				e.preventDefault();
			} else if (e.key === "Escape") {
				showOptions = false;
			} else if (e.key === "Backspace") {
				if (
					multiselect &&
					(!inputValue || inputValue === "") &&
					Array.isArray(value) &&
					value.length > 0
				) {
					remove(value[value.length - 1]);
					inputValue = "";
				}
			} else {
				showOptions = true;
			}
		}
	}

	$: {
		if (JSON.stringify(value) != JSON.stringify(old_value)) {
			dispatch("change", value);
			old_value = Array.isArray(value) ? value.slice() : value;
		}
	}
</script>

<label>
	<BlockTitle {show_label} {info}>{label}</BlockTitle>

	<div class="wrap">
		<div class="wrap-inner" class:showOptions>
			{#if multiselect && Array.isArray(value)}
				{#each value as s}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
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
			{/if}
			<div class="secondary-wrap">
				<input
					class="border-none"
					class:subdued={value !== inputValue && !allow_custom_value}
					{disabled}
					autocomplete="off"
					bind:value={inputValue}
					bind:this={filterInput}
					on:focus={() => {
						showOptions = !showOptions;
						if (showOptions) {
							inputValue = "";
						} else {
							filterInput.blur();
						}
					}}
					on:keydown={handleKeydown}
					on:keyup={() => {
						if (allow_custom_value) {
							value = inputValue;
						}
					}}
					on:blur={() => {
						if (multiselect) {
							inputValue = "";
						} else if (!allow_custom_value) {
							if (value !== inputValue) {
								if (typeof value === "string" && inputValue == "") {
									inputValue = value;
								} else {
									value = undefined;
									inputValue = "";
								}
							}
						}
						showOptions = false;
					}}
				/>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class:hide={!multiselect || !value?.length || disabled}
					class="token-remove remove-all"
					title="Clear"
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
		border: var(--input-border-width) solid var(--border-color-primary);
		border-radius: var(--input-radius);
		background: var(--input-background-fill);
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
		padding: var(--checkbox-label-padding);
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
		background: var(--checkbox-label-background-fill);
		padding: var(--checkbox-label-padding);
		color: var(--checkbox-label-text-color);
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
		border: var(--checkbox-border-width) solid var(--border-color-primary);
		border-radius: var(--radius-full);
		background: var(--background-fill-primary);
		padding: var(--size-0-5);
		width: 18px;
		height: 18px;
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
		-webkit-text-fill-color: var(--body-text-color);
		-webkit-opacity: 1;
		opacity: 1;
		cursor: not-allowed;
	}

	.remove-all {
		margin-left: var(--size-1);
		width: 20px;
		height: 20px;
	}

	.hide {
		display: none;
	}

	.subdued {
		color: var(--body-text-color-subdued);
	}
</style>
