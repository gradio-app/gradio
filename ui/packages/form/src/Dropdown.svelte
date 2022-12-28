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

	let activeOption: any,
		showOptions = false;
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

	function handleTokenClick(e: any) {
		if (e.target.closest(".token-remove")) {
			e.stopPropagation();
			remove(
				e.target.closest(".token").getElementsByTagName("span")[0].textContent
			);
		} else if (e.target.closest(".remove-all")) {
			value = [];
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
						class="token items-center bg-gray-400 rounded-xl flex my-0.5 mr-2 ml-1 max-h-6 py-0.5 px-2 whitespace-nowrap"
					>
						<span>{s}</span>
						<div
							class="token-remove items-center bg-gray-500 rounded-full fill-white flex justify-center ml-0.5 min-w-min"
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
					</div>
				{/each}
			{/if}
			<div class="items-center flex flex-1 min-w-min border-none">
				<input
					class="border-none bg-inherit text-2xl w-full outline-none"
					{id}
					autocomplete="off"
					on:blur={handleBlur}
					{placeholder}
					readonly
				/>
				<div
					class="remove-all items-center bg-gray-500 rounded-full fill-white flex justify-center h-5 ml-1 min-w-min"
					title="Remove All"
					class:hidden={!value?.length}
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

		{#if showOptions}
			<ul
				class="z-50 text-neutral-800 shadow ml-0 list-none max-h-32 overflow-auto absolute w-full fill-gray-500"
				transition:fly={{ duration: 200, y: 5 }}
				on:mousedown|preventDefault={handleOptionMousedown}
			>
				{#each choices as choice}
					<li
						class="bg-gray-100 cursor-pointer p-2 hover:bg-gray-300"
						class:selected={value?.includes(choice)}
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
		@apply bg-slate-200;
	}
	li.selected {
		@apply bg-blue-900 text-white;
	}
	li.selected:nth-child(even) {
		@apply bg-blue-800 text-white;
	}
	li.selected.active,
	li.selected:hover {
		@apply bg-blue-700 text-white;
	}
</style>
