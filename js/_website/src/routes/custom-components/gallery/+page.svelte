<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import { onMount, tick } from "svelte";
	import type { ComponentData } from "./utils";
	import { clickOutside } from "./utils";
	import Card from "./Card.svelte";
	import Close from "$lib/icons/Close.svelte";

	const API = "https://gradio-custom-component-gallery-backend.hf.space/";
	const OFFSET = 0;
	const LIMIT = 50;

	let components: ComponentData[] = [];
	let selection: string = "";

	let selected_component: ComponentData | null = null;

	const COLOR_SETS = [
		"from-red-50 via-red-100 to-red-50",
		"from-green-50 via-green-100 to-green-50",
		"from-yellow-50 via-yellow-100 to-yellow-50",
		"from-pink-50 via-pink-100 to-pink-50",
		"from-blue-50 via-blue-100 to-blue-50",
		"from-purple-50 via-purple-100 to-purple-50"
	];

	let color_mapping: { [key: string]: string } = {};

	function define_colors(components: ComponentData[]) {
		let counter = 0;
		for (const component of components) {
			if (counter >= COLOR_SETS.length) {
				counter = 0;
			}
			if (!(component.id in color_mapping)) {
				color_mapping[component.id] = COLOR_SETS[counter];
			}
			component.background_color = color_mapping[component.id];
			counter++;
		}
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
		define_colors(components);
	}

	onMount(fetch_components);

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
		await tick();
		e.preventDefault();
		fetch_components(selection.split(","));
	}

	let placeholder: string;
	$: placeholder = "Search through Custom Components";
</script>

<MetaTags
	title="Gradio Custom Components Gallery"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Search through a gallery of custom components."
/>

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<input
		type="text"
		class="w-full border border-gray-200 p-1 rounded-md outline-none text-center text-lg mb-1 focus:placeholder-transparent focus:shadow-none focus:border-orange-500 focus:ring-0"
		{placeholder}
		autocomplete="off"
		on:keyup={handle_keypress}
		bind:value={selection}
	/>
	<div class="text-gray-600 mb-0 mx-auto w-fit text-sm">
		Search by component name, keyword or description.
		<a
			class="link text-gray-600"
			href="https://www.gradio.app/guides/five-minute-guide"
			>Read more about Custom Components.</a
		>
	</div>
	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 !m-0 !mt-8">
		{#each components as component (component.id)}
			<div
				on:click={(event) => {
					handle_box_click(component);
					event.stopPropagation();
				}}
				class=" cursor-pointer px-3 pt-3 h-40 group font:thin relative rounded-xl shadow-sm hover:shadow-alternate transition-shadow bg-gradient-to-tr {component.background_color}"
			>
				<h2
					class="text-md font-semibold text-gray-700 max-w-full truncate py-1"
				>
					{component.name}
				</h2>
				<p class="description text-md font-light py-1">
					{component.description}
				</p>
				<span
					class="text-md text-gray-500 text-end max-w-full font-light overflow-hidden py-1"
				>
					{component.tags.split(",").join(" · ")}</span
				>
			</div>
		{/each}
	</div>
</div>
{#if selected_component}
	<div
		class="details-panel open"
		use:clickOutside={() => {
			selected_component = null;
		}}
	>
		<button
			class="absolute right-6 top-6 w-4"
			on:click={() => (selected_component = null)}
		>
			<Close />
		</button>
		<Card data={selected_component}></Card>
	</div>
{/if}

<style>
	.close-button {
		position: absolute;
		top: 0;
		right: 5;
		width: var(--size-1);
		color: var(--body-text-color);
	}

	.details-panel {
		position: fixed;
		top: 5%;
		right: 5%;
		height: 90%;
		width: 90%;
		z-index: 1000;
		display: flex;
		flex-direction: column;
	}

	.description {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
