<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { fly } from "svelte/transition";
	export let placeholder = "";
	export let value: string | Array<string> | undefined = undefined;
	export let choices: Array<string>;
	export let disabled: boolean = false;

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

	const iconClearPath =
		"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";

	function add(option: string) {
		if (Array.isArray(value)) {
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
		if (e.key === "Enter") {
			if (Array.isArray(value) && activeOption != undefined) {
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
			if (value?.includes(option)) {
				remove(option);
			} else {
				add(option);
			}
		}
	}
</script>

<div class="wrap">
	<div class="wrap-inner" class:showOptions>
		{#if Array.isArray(value)}
			{#each value as s}
				<div on:click|preventDefault={() => remove(s)} class="token">
					<span>{s}</span>
					<div class:hidden={disabled} class="token-remove" title="Remove {s}">
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
		{/if}
		<div class="secondary-wrap">
			<input
				class="border-none"
				{disabled}
				autocomplete="off"
				bind:value={inputValue}
				on:focus={() => optionsVisibility(true)}
				on:blur={() => optionsVisibility(false)}
				on:keyup={handleKeyup}
				{placeholder}
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
			transition:fly={{ duration: 200, y: 5 }}
			on:mousedown|preventDefault={handleOptionMousedown}
		>
			{#each filtered as choice}
				<li
					class="item"
					class:selected={value?.includes(choice)}
					class:active={activeOption === choice}
					class:bg-gray-100={activeOption === choice}
					class:dark:bg-gray-600={activeOption === choice}
					data-value={choice}
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

<style>
	.wrap {
		position: relative;
		box-shadow: var(--input-shadow);
		border: var(--input-border-width) solid var(--color-border-primary);
		border-radius: var(--input-radius);
		background: var(--input-background);
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
		width: var(--size-full);
		color: var(--body-text-color);
		font-size: var(--input-text-size);
	}

	input:disabled {
		cursor: not-allowed;
	}

	.remove-all {
		width: 20px;
		height: 20px;
	}

	.dropdown-arrow {
		fill: var(--body-text-color);
		margin-right: var(--size-2);
		width: var(--size-5);
	}

	.options {
		position: absolute;
		z-index: var(--layer-5);
		margin-left: 0;
		box-shadow: var(--shadow-drop-lg);
		border-radius: var(--container-radius);
		background: var(--color-background-primary);
		width: var(--size-full);
		max-height: var(--size-32);
		overflow: auto;
		color: var(--body-text-color);
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
