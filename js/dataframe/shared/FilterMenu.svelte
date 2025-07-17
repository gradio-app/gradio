<script lang="ts">
	import { onMount } from "svelte";
	import { Check } from "@gradio/icons";
	import DropdownArrow from "../../icons/src/DropdownArrow.svelte";
	import type { FilterDatatype } from "./context/dataframe_context";

	export let on_filter: (
		datatype: FilterDatatype,
		selected_filter: string,
		value: string
	) => void = () => {};

	let menu_element: HTMLDivElement;
	let datatype: "string" | "number" = "string";
	let current_filter = "Contains";
	let filter_dropdown_open = false;
	let filter_input_value = "";

	const filter_options = {
		string: [
			"Contains",
			"Does not contain",
			"Starts with",
			"Ends with",
			"Is",
			"Is not",
			"Is empty",
			"Is not empty"
		],
		number: ["=", "≠", ">", "<", "≥", "≤", "Is empty", "Is not empty"]
	};

	onMount(() => {
		position_menu();
	});

	function position_menu(): void {
		if (!menu_element) return;

		const viewport_width = window.innerWidth;
		const viewport_height = window.innerHeight;
		const menu_rect = menu_element.getBoundingClientRect();

		const x = (viewport_width - menu_rect.width) / 2;
		const y = (viewport_height - menu_rect.height) / 2;

		menu_element.style.left = `${x}px`;
		menu_element.style.top = `${y}px`;
	}

	function handle_filter_input(e: Event): void {
		const target = e.target as HTMLInputElement;
		filter_input_value = target.value;
	}
</script>

<div>
	<div class="background"></div>
	<div bind:this={menu_element} class="filter-menu">
		<div class="filter-datatype-container">
			<span>Filter as</span>
			<button
				on:click|stopPropagation={() => {
					datatype = datatype === "string" ? "number" : "string";
					current_filter = filter_options[datatype][0];
				}}
				aria-label={`Change filter type. Filtering ${datatype}s`}
			>
				{datatype}
			</button>
		</div>

		<div class="input-container">
			<div class="filter-dropdown">
				<button
					on:click|stopPropagation={() =>
						(filter_dropdown_open = !filter_dropdown_open)}
					aria-label={`Change filter. Using '${current_filter}'`}
				>
					{current_filter}
					<DropdownArrow />
				</button>

				{#if filter_dropdown_open}
					<div class="dropdown-filter-options">
						{#each filter_options[datatype] as opt}
							<button
								on:click|stopPropagation={() => {
									current_filter = opt;
									filter_dropdown_open = !filter_dropdown_open;
								}}
								class="filter-option"
							>
								{opt}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<input
				type="text"
				value={filter_input_value}
				on:click|stopPropagation
				on:input={handle_filter_input}
				placeholder="Type a value"
				class="filter-input"
			/>
		</div>

		<button
			class="check-button"
			on:click={() => on_filter(datatype, current_filter, filter_input_value)}
		>
			<Check />
		</button>
	</div>
</div>

<style>
	.background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.4);
		z-index: 20;
	}

	.filter-menu {
		position: fixed;
		background: var(--background-fill-primary);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--size-2);
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		box-shadow: var(--shadow-drop-lg);
		width: 300px;
		z-index: 21;
	}

	.filter-datatype-container {
		display: flex;
		gap: var(--size-2);
		align-items: center;
	}

	.filter-menu span {
		font-size: var(--text-sm);
		color: var(--body-text-color);
	}

	.filter-menu button {
		height: var(--size-6);
		background: none;
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--size-1) var(--size-2);
		color: var(--body-text-color);
		font-size: var(--text-sm);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--size-2);
	}

	.filter-menu button:hover {
		background-color: var(--background-fill-secondary);
	}

	.filter-input {
		width: var(--size-full);
		height: var(--size-6);
		padding: var(--size-2);
		padding-right: var(--size-8);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--table-radius);
		font-size: var(--text-sm);
		color: var(--body-text-color);
		background: var(--background-fill-secondary);
		transition: all 0.2s ease;
	}

	.filter-input:hover {
		border-color: var(--border-color-secondary);
		background: var(--background-fill-primary);
	}

	.filter-input:focus {
		outline: none;
		border-color: var(--color-accent);
		background: var(--background-fill-primary);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	.dropdown-filter-options {
		display: flex;
		flex-direction: column;
		background: var(--background-fill-primary);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-drop-md);
		position: absolute;
		z-index: var(--layer-1);
	}

	.dropdown-filter-options .filter-option {
		border: none;
		justify-content: flex-start;
	}

	.input-container {
		display: flex;
		gap: var(--size-2);
		align-items: center;
	}

	.input-container button {
		width: 130px;
	}

	:global(svg.dropdown-arrow) {
		width: var(--size-4);
		height: var(--size-4);
		margin-left: auto;
	}

	.filter-menu .check-button {
		background: var(--color-accent);
		color: white;
		border: none;
		width: var(--size-full);
		height: var(--size-6);
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--size-1);
	}

	.check-button:hover {
		background: var(--color-accent-soft);
	}
</style>
