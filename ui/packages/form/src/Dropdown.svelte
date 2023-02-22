<script lang="ts">
	import DropdownOptions from "./DropdownOptions.svelte";
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
	import { Remove, DropdownArrow } from "@gradio/icons";
	export let label: string;
	export let value: string | Array<string> | undefined = undefined;
	export let multiselect: boolean = false;
	export let max_choices: number;
	export let choices: Array<string>;
	export let disabled: boolean = false;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: string | Array<string> | undefined;
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

	$: if (!multiselect) {
		dispatch("change", value);
	}

	function add(option: string) {
		if (Array.isArray(value)) {
			if (value.length < max_choices) {
				value.push(option);
				dispatch("change", value);
			}
			showOptions = !(value.length === max_choices);
		}
		value = value;
	}

	function remove(option: string) {
		if (Array.isArray(value)) {
			value = value.filter((v: string) => v !== option);
			dispatch("change", value);
		}
	}

	function remove_all(e: any) {
		value = [];
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
	<BlockTitle {show_label}>{label}</BlockTitle>

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
		--ring-color: transparent;
		position: relative;
		box-shadow: 0 0 0 var(--shadow-spread) var(--ring-color),
			var(--shadow-inset);
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
	}

	.wrap:focus-within {
		--ring-color: var(--color-focus-ring);
		border-color: var(--input-border-color-focus);
	}

	.wrap-inner {
		display: flex;
		position: relative;
		flex-wrap: wrap;
		align-items: center;
	}

	.token {
		display: flex;
		align-items: center;
		cursor: pointer;
		margin: var(--size-1);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--checkbox-label-border-color-base);
		border-radius: var(--radius-md);
		background: var(--checkbox-label-background-base);
		padding: var(--size-1-5) var(--size-3);
		color: var(--color-text-body);
		font-size: var(--scale-00);
		line-height: var(--line-md);
	}

	.token > * + * {
		margin-left: var(--size-2);
	}

	.token:hover {
		border: 1px solid var(--icon_button-border-color-hover);
		color: var(--color-text-label);
	}

	.token-remove {
		fill: var(--color-text-body);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-full);
		background: var(--color-background-tertiary);
		padding: var(--size-0-5);
		width: 18px;
		height: 18px;
	}

	.token-remove:hover,
	.remove-all:hover {
		border: 1px solid var(--icon_button-border-color-hover);
		color: var(--color-text-label);
	}

	.single-select {
		margin: var(--size-2);
		color: var(--color-text-body);
	}

	.secondary-wrap {
		display: flex;
		flex: 1 1 0%;
		align-items: center;
		border: none;
		min-width: min-content;
	}

	input {
		outline: none;
		border: none;
		background: inherit;
		padding: var(--size-2-5);
		width: 100%;
		color: var(--color-text-body);
		font-size: var(--scale-00);
	}

	input:disabled {
		cursor: not-allowed;
		box-shadow: none;
	}

	.remove-all {
		margin-left: var(--size-1);
		width: 20px;
		height: 20px;
	}
</style>
