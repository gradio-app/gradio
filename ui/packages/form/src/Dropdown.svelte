<script lang="ts">
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

	let input: any,
		inputValue: string,
		activeOption: any,
		showOptions = false,
		selected: any = {},
		slot;
	const iconClearPath =
		"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";

	function add(token: string) {
		selected[token] = token;
	}

	function remove(value: string) {
		const { [value]: val, ...rest } = selected;
		selected = rest;
	}

	function optionsVisibility(show: boolean) {
		if (typeof show === "boolean") {
			showOptions = show;
			show && input.focus();
		} else {
			showOptions = !showOptions;
		}
		if (!showOptions) {
			activeOption = undefined;
		}
	}

	function handleKeyup(e: any) {
		if (e.keyCode === 13) {
			Object.keys(selected).includes(activeOption)
				? remove(activeOption)
				: add(activeOption);
			inputValue = "";
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
			selected = [];
			inputValue = "";
		} else {
			optionsVisibility(true);
		}
	}

	function handleOptionMousedown(e: any) {
		const value = e.target.dataset.value;
		if (selected[value]) {
			remove(value);
		} else {
			add(value);
			input.focus();
		}
	}
	$: if (multiselect) {
		console.log(selected)
		value = Object.values(selected);
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
			{#each Object.values(selected) as s}
				<div
					class="token items-center bg-gray-400 rounded-xl flex my-0.5 mr-2 ml-1 max-h-6 py-0.5 px-2 whitespace-nowrap"
					data-id={s.value}
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
			<div class="items-center flex flex-1 min-w-min border-none">
				<input
					class="border-none bg-inherit text-2xl w-full outline-none"
					{id}
					autocomplete="off"
					bind:value={inputValue}
					bind:this={input}
					on:keyup={handleKeyup}
					on:blur={handleBlur}
					{placeholder}
					readonly
				/>
				<div
					class="remove-all items-center bg-gray-500 rounded-full fill-white flex justify-center h-5 ml-1 min-w-min"
					title="Remove All"
					class:hidden={!Object.keys(selected).length}
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

		<select bind:this={slot} type="multiple" class="hidden"><slot /></select>

		{#if showOptions}
			<ul
				class="z-50 text-neutral-800 shadow ml-0 list-none max-h-16 overflow-auto absolute w-full fill-gray-500"
				transition:fly={{ duration: 200, y: 5 }}
				on:mousedown|preventDefault={handleOptionMousedown}
			>
				{#each choices as choice}
					<li
						class="bg-gray-100 cursor-pointer p-2 hover:bg-gray-300"
						class:selected={selected[choice]}
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
