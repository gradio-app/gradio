<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { fly } from "svelte/transition";
	import { BlockTitle } from "@gradio/atoms";
	export let id = "";
	export let placeholder = "";
	export let label: string;
	export let value: string | Array<string> | undefined = undefined;
	export let multiselect: boolean = false;
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

	function handleBlur(e: any) {
		optionsVisibility(false);
	}

	function handleKeyup(e: any) {
		if (e.keyCode === 13) {
			if (Array.isArray(value)) {
				value.includes(activeOption) ? remove(activeOption) : add(activeOption);
				inputValue = "";
			}
		}
		if ([38, 40].includes(e.keyCode)) {
			// up and down arrows
			const increment = e.keyCode === 38 ? -1 : 1;
			const calcIndex = filtered.indexOf(activeOption) + increment;
			activeOption =
				calcIndex < 0
					? filtered[filtered.length - 1]
					: calcIndex === filtered.length
					? filtered[0]
					: filtered[calcIndex];
		}
	}

	function handleTokenClick(e: any) {
		if (e.target.closest(".token-remove")) {
			e.stopPropagation();
			remove(
				e.target.closest(".token").getElementsByTagName("span")[0].textContent
			);
		} else if (e.target.closest(".remove-all")) {
			value = [];
			inputValue = "";
		} else {
			optionsVisibility(true);
		}
	}

	function handleOptionMousedown(e: any) {
		const option = e.target.dataset.value;
		if (option !== undefined) {
			if (value?.includes(option)) {
				remove(option);
			} else {
				add(option);
			}
		}
	}
</script>

{#if !multiselect}
	<label>
		<BlockTitle {show_label}>{label}</BlockTitle>
		<select
			class="gr-box gr-input w-full disabled:cursor-not-allowed"
			bind:value
			{disabled}
		>
			{#each choices as choice}
				<option>{choice}</option>
			{/each}
		</select>
	</label>
{:else}
	<div class="relative border rounded-md" readonly>
		<div
			class="items-center flex flex-wrap relative"
			class:showOptions
			on:click={handleTokenClick}
		>
			{#if Array.isArray(value)}
				{#each value as s}
					<div
						class="token gr-input-label flex items-center text-gray-700 text-sm space-x-2 border py-1.5 px-3 rounded-lg cursor-pointer bg-white shadow-sm checked:shadow-inner my-1 mx-1"
					>
						<div
							class:hidden={disabled}
							class="token-remove items-center bg-gray-500 rounded-full fill-white flex justify-center min-w-min"
							title="Remove {s}"
						>
							<svg
								class="icon-clear"
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
							>
								<path d={iconClearPath} />
							</svg>
						</div>
						<span>{s}</span>
					</div>
				{/each}
			{/if}
			<div class="items-center flex flex-1 min-w-min border-none">
				<input
					class="border-none bg-inherit text-2xl w-full outline-none text-white disabled:cursor-not-allowed"
					{id}
					{disabled}
					autocomplete="off"
					bind:value={inputValue}
					on:blur={handleBlur}
					on:keyup={handleKeyup}
					{placeholder}
				/>
				<div
					class:hidden={!value?.length || disabled}
					class="remove-all items-center bg-gray-500 rounded-full fill-white flex justify-center h-5 ml-1 min-w-min disabled:hidden"
					title="Remove All"
				>
					<svg
						class="icon-clear"
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
					>
						<path d={iconClearPath} />
					</svg>
				</div>
				<svg
					class="dropdown-arrow fill-white"
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 18 18"><path d="M5 8l4 4 4-4z" /></svg
				>
			</div>
		</div>

		{#if showOptions && !disabled}
			<ul
				class="z-50 text-white shadow ml-0 list-none max-h-32 overflow-auto absolute w-full fill-gray-500 bg-gray-100 dark:bg-gray-700"
				transition:fly={{ duration: 200, y: 5 }}
				on:mousedown|preventDefault={handleOptionMousedown}
			>
				{#each filtered as choice}
					<li
						class="cursor-pointer p-2 hover:bg-gray-300"
						class:selected={value?.includes(choice)}
						class:active={activeOption === choice}
						data-value={choice}
					>
						{choice}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style lang="postcss">
	li:last-child {
		@apply rounded-b;
	}
	li:not(.selected):hover {
		@apply bg-gray-400;
	}
	li.selected {
		@apply bg-orange-400 text-white;
	}
	li.selected:nth-child(even) {
		@apply bg-orange-300 text-white;
	}
	li.active {
		@apply bg-gray-400;
	}
	li.selected.active,
	li.selected:hover {
		@apply bg-orange-200 text-white;
	}
</style>
