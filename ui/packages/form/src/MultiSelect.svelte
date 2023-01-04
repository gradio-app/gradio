<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { fly } from "svelte/transition";
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

	const iconCheckMarkPath =
		"M 2.328125 4.222656 L 27.734375 4.222656 L 27.734375 24.542969 L 2.328125 24.542969 Z M 2.328125 4.222656";

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
		// enter key
		if (e.keyCode === 13) {
			if (Array.isArray(value) && activeOption != undefined) {
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
		e.preventDefault();
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

<div class="relative border rounded-md">
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
						class="token-remove items-center bg-gray-400 dark:bg-gray-700 rounded-full fill-white flex justify-center min-w-min p-0.5"
						title="Remove {s}"
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
					<span>{s}</span>
				</div>
			{/each}
		{/if}
		<div class="items-center flex flex-1 min-w-min border-none">
			<input
				class="border-none bg-inherit ml-2 text-lg w-full outline-none text-gray-700 dark:text-white disabled:cursor-not-allowed"
				{disabled}
				autocomplete="off"
				bind:value={inputValue}
				on:blur={handleBlur}
				on:keyup={handleKeyup}
				{placeholder}
			/>
			<div
				class:hidden={!value?.length || disabled}
				class="remove-all items-center bg-gray-400 dark:bg-gray-700 rounded-full fill-white flex justify-center h-5 ml-1 min-w-min disabled:hidden p-0.5"
				title="Remove All"
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
				class="dropdown-arrow mr-2 min-w-min fill-gray-500 dark:fill-white"
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 18 18"><path d="M5 8l4 4 4-4z" /></svg
			>
		</div>
	</div>

	{#if showOptions && !disabled}
		<ul
			class="z-50 shadow ml-0 list-none max-h-32 overflow-auto absolute w-full fill-gray-500 bg-white dark:bg-gray-700 dark:text-white rounded-md"
			transition:fly={{ duration: 200, y: 5 }}
			on:mousedown|preventDefault={handleOptionMousedown}
		>
			{#each filtered as choice}
				<li
					class="cursor-pointer flex p-2 hover:bg-gray-100 dark:md:hover:bg-gray-600"
					class:selected={value?.includes(choice)}
					class:active={activeOption === choice}
					data-value={choice}
				>
					<span class:invisible={!value?.includes(choice)} class="pr-1">✓</span>
					{choice}
				</li>
			{/each}
		</ul>
	{/if}
</div>
