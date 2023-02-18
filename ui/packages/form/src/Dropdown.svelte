<script lang="ts">
	import { fly } from "svelte/transition";
	import { createEventDispatcher } from "svelte";
	import { BlockTitle } from "@gradio/atoms";
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

	$: if (!multiselect) {
		dispatch("change", value);
	}

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

	$: readonly = !multiselect && typeof value === "string";
	const iconClearPath =
		"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";

	function add(option: string) {
		if (Array.isArray(value) && value.length < max_choices) {
			value.push(option);
			dispatch("change", value);
		}
		value = value;
	}

	function remove(option: string) {
		if (Array.isArray(value)) {
			value = value.filter((v: string) => v !== option);
			dispatch("change", value);
		}
	}

	function optionsVisibility(show: boolean) {
		if (typeof show === "boolean") {
			showOptions = show;
		} else {
			showOptions = !showOptions;
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
			optionsVisibility(false);
		}
	}

	function remove_all(e: any) {
		value = [];
		inputValue = "";
		e.preventDefault();
		dispatch("change", value);
	}

	function handleOptionMousedown(e: any) {
		const option = e.target.dataset.value;
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
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
							>
								<path d={iconClearPath} />
							</svg>
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
					on:focus={() => optionsVisibility(true)}
					on:blur={() => optionsVisibility(false)}
					on:keyup={handleKeyup}
				/>
				<div
					class:hide={!value?.length || disabled}
					class="token-remove remove-all"
					title="Remove All"
					on:click={remove_all}
				>
					<svg
						class="icon-clear"
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
					>
						<path d={iconClearPath} />
					</svg>
				</div>
				<svg
					class="dropdown-arrow"
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 18 18"
				>
					<path d="M5 8l4 4 4-4z" />
				</svg>
			</div>
		</div>

		{#if showOptions && !disabled}
			<ul
				class="options"
				aria-expanded={showOptions}
				transition:fly={{ duration: 200, y: 5 }}
				on:mousedown|preventDefault={handleOptionMousedown}
			>
				{#each filtered as choice}
					<li
						class="item"
						role="button"
						class:selected={value?.includes(choice)}
						class:active={activeOption === choice}
						class:bg-gray-100={activeOption === choice}
						class:dark:bg-gray-600={activeOption === choice}
						data-value={choice}
						aria-label={choice}
					>
						<span class:hide={!value?.includes(choice)} class="inner-item pr-1">
							✓
						</span>
						{choice}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</label>

<style>
	.wrap {
		position: relative;
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
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
		margin-left: var(--size-2);
		outline: none;
		border: none;
		background: inherit;
		width: var(--size-full);
		color: var(--color-text-body);
		font-size: var(--scale-1);
	}

	input:disabled {
		cursor: not-allowed;
	}

	.remove-all {
		margin-left: var(--size-1);
		width: 20px;
		height: 20px;
	}

	.dropdown-arrow {
		fill: var(--color-text-body);
		margin-right: var(--size-2);
		width: var(--size-5);
	}

	.options {
		position: absolute;
		z-index: var(--layer-5);
		margin-left: 0;
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--radius-lg);
		background: var(--color-background-primary);
		width: var(--size-full);
		max-height: var(--size-32);
		overflow: auto;
		color: var(--color-text-body);
		list-style: none;
	}

	.item {
		display: flex;
		cursor: pointer;
		padding: var(--size-2);
	}

	.item:hover {
		background: var(--color-background-secondary);
	}

	.active {
		background: var(--color-background-secondary);
	}

	.inner-item {
		padding-right: var(--size-1);
	}

	.hide {
		visibility: hidden;
	}
</style>
