<script lang="ts">
	import { onMount, tick } from "svelte";
	import type { ComponentData } from "./utils";
	import { getRandomIntInclusive, classToEmojiMapping } from "./utils";
	import Card from "./Card.svelte";
	import Close from "$lib/icons/Close.svelte";

	const API = "https://gradio-custom-component-gallery-backend.hf.space/";
	const OFFSET = 0;
	const LIMIT = 50;

	let components: ComponentData[] = [];
	let selection: string = "";

	let selected_component: ComponentData | null = null;

	const COLOR_SETS = [
		["from-green-100", "to-green-50"],
		["from-yellow-100", "to-yellow-50"],
		["from-red-100", "to-red-50"],
		["from-blue-100", "to-blue-50"],
		["from-pink-100", "to-pink-50"],
		["from-purple-100", "to-purple-50"],
		["from-green-100", "to-green-50"],
		["from-yellow-100", "to-yellow-50"],
		["from-red-100", "to-red-50"],
		["from-blue-100", "to-blue-50"],
		["from-pink-100", "to-pink-50"],
		["from-purple-100", "to-purple-50"]
	];

	function random_color(): string {
		const color = COLOR_SETS[getRandomIntInclusive(0, COLOR_SETS.length - 1)];
		return `${color[0]} ${color[1]}`;
	}

	const handle_box_click = (component: ComponentData) => {
		selected_component = component;
	};

	async function fetch_components(selection: string[] = []) {
		components = await fetch(
			`${API}components?offset=${OFFSET}&limit=${LIMIT}&name_or_tags=${selection.join(
				","
			)}`
		)
			.then((response) => response.json())
			.catch((error) => `Error: ${error}`);
		components.map((x) => (x.background_color = random_color()));
	}

	onMount(fetch_components);

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
		await tick();
		if (e.key === "Enter") {
			e.preventDefault();
			fetch_components(selection.split(","));
		}
	}
</script>

<div class="flex flex-col relative h-full">
	<input
		type="text"
		class="m-8 border border-gray-200 p-1 rounded-md outline-none text-center text-lg mb-1 focus:placeholder-transparent focus:shadow-none focus:border-orange-500 focus:ring-0"
		placeholder="Search component names, keywords and descriptions. Separate multiple keywords with commas and press Enter."
		autocomplete="off"
		on:keypress={handle_keypress}
		bind:value={selection}
	/>
	<div class="grid relative">
		{#each components as component (component.id)}
			<div
				on:click={() => handle_box_click(component)}
				class="box h-36 group font:thin relative rounded-xl shadow-sm hover:shadow-alternate transition-shadow bg-gradient-to-r {component.background_color}"
			>
				<div class="absolute opacity-30 text-6xl mb-1">
					{classToEmojiMapping[component.template] || "❓"}
				</div>
				<h2
					class="group-hover:underline font-md text-black font-bold max-w-full truncate text-center"
				>
					{component.name}
				</h2>
				<span
					class="font-sm text-gray-600 text-end max-w-full truncate"
					style="position:absolute; bottom:0;"
				>
					Tags: {component.tags.split(",").join(", ")}</span
				>
			</div>
		{/each}
	</div>
</div>
{#if selected_component}
	<div class="details-panel open">
		<button
			class="absolute right-3 top-3 w-4"
			on:click={() => (selected_component = null)}
		>
			<Close />
		</button>
		<div>
			<p class="text-4xl text-black text-center font-bold">
				{selected_component.name}
			</p>
		</div>
		<Card data={selected_component}></Card>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 16px;
		margin: 16px;
	}

	.close-button {
		position: absolute;
		top: 0;
		right: 5;
		width: var(--size-1);
		color: var(--body-text-color);
	}

	.box {
		border: 1px solid #ddd;
		padding: 16px;
		cursor: pointer;
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: left;
	}

	.details-panel {
		overflow-y: scroll;
		position: fixed;
		top: 0;
		right: 0;
		height: 100%;
		width: 80%;
		background-color: white;
		box-shadow: -4px 0 4px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		transition: transform 0.3s ease-out;
		transform: translateX(100%);
		display: flex;
		flex-direction: column;
	}

	.details-panel.open {
		transform: translateX(0);
	}
</style>
