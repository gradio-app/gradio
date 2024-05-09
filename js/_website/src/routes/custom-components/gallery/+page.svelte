<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import { onMount, tick } from "svelte";
	import type { ComponentData } from "./utils";
	import { clickOutside } from "./utils";

	const API = "https://gradio-custom-component-gallery-backend.hf.space/";

	let components: ComponentData[] = [];
	let selection: string = "";
	let link_copied = false;

	let selected_component: ComponentData | null = null;
	let components_length: number = 0;

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
			`${API}components?name_or_tags=${selection.join(",")}`
		)
			.then((response) => response.json())
			.catch((error) => `Error: ${error}`);
		define_colors(components);
		if (!components_length) {
			components_length = components.length;
		}
		components = components.sort((a, b) => b["likes"] - a["likes"]);
		const id = $page.url.searchParams.get("id");
		selected_component =
			components.find((component) => component.id === id) ?? null;
	}

	onMount(fetch_components);

	async function handle_keypress(e: KeyboardEvent): Promise<void> {
		await tick();
		e.preventDefault();
		fetch_components(selection.split(","));
	}

	function copy_link(id: string) {
		const url = $page.url;
		url.searchParams.set("id", id);
		const link = url.toString();
		navigator.clipboard.writeText(link).then(() => {
			window.setTimeout(() => {
				link_copied = false;
			}, 1000);
		});
	}
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
		placeholder="What are you looking for?"
		autocomplete="off"
		on:keyup={handle_keypress}
		bind:value={selection}
	/>
	<div class="text-gray-600 mb-0 mx-auto w-fit text-sm">
		Search through {components_length} components by name, keyword or description.
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
				class=" cursor-pointer px-3 pt-3 h-40 group font:thin relative rounded-xl shadow-sm transform hover:scale-[1.02] hover:shadow-alternate transition bg-gradient-to-tr {component.background_color}"
			>
				<h2
					class="text-md font-semibold text-gray-700 max-w-full truncate py-1"
				>
					{component.name.startsWith("gradio_")
						? component.name.slice(7)
						: component.name}
				</h2>

				{#if component.likes}
					<p
						class="text-sm font-light py-1"
						style="position: absolute; top: 5%; right: 5%"
					>
						<span
							class="bg-white p-1 rounded-md text-gray-700 inline-flex align-middle"
						>
							<svg
								class="mr-1 self-center"
								xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								aria-hidden="true"
								focusable="false"
								role="img"
								width="1em"
								height="1em"
								preserveAspectRatio="xMidYMid meet"
								viewBox="0 0 32 32"
								fill="currentColor"
								><path
									d="M22.45,6a5.47,5.47,0,0,1,3.91,1.64,5.7,5.7,0,0,1,0,8L16,26.13,5.64,15.64a5.7,5.7,0,0,1,0-8,5.48,5.48,0,0,1,7.82,0L16,10.24l2.53-2.58A5.44,5.44,0,0,1,22.45,6m0-2a7.47,7.47,0,0,0-5.34,2.24L16,7.36,14.89,6.24a7.49,7.49,0,0,0-10.68,0,7.72,7.72,0,0,0,0,10.82L16,29,27.79,17.06a7.72,7.72,0,0,0,0-10.82A7.49,7.49,0,0,0,22.45,4Z"
								></path></svg
							>
							<p class="">{component.likes ? component.likes : ""}</p>
						</span>
					</p>
				{/if}
				<p class="description text-md font-light py-1">
					{component.description}
				</p>
				<p
					class="text-sm font-light py-1"
					style="position: absolute; bottom: 5%; left: 5%"
				>
					<span class="bg-white p-1 rounded-md text-gray-700">
						@{component.author}
					</span>
				</p>
				{#if component.template && component.template != "Fallback"}
					<p
						class="text-sm font-light py-1"
						style="position: absolute; bottom: 5%; right: 5%"
					>
						<span class="bg-white p-1 rounded-md text-gray-700">
							{component.template}
						</span>
					</p>
				{/if}
			</div>
		{/each}
	</div>
</div>

{#each components as component (component.id)}
	<div
		class="details-panel open border border-gray-200 shadow-xl rounded-xl bg-white p-5"
		class:hidden={!(selected_component == component)}
		class:flex={selected_component == component}
		use:clickOutside={() => {
			selected_component = null;
		}}
	>
		<div class="self-end mr-8 flex">
			{#if !link_copied}
				<button
					on:click={(e) => {
						link_copied = true;
						copy_link(component.id);
					}}
					class="rounded-md w-fit px-3.5 py-1 text-sm font-semibold text-white bg-orange-300 hover:drop-shadow-sm mr-4"
				>
					Share
				</button>
			{:else}
				<span
					class="rounded-md w-fit px-3.5 py-1 text-sm font-semibold text-white bg-orange-300 hover:drop-shadow-sm mr-4"
				>
					Link copied to clipboard!
				</span>
			{/if}
			<a
				href={`https://huggingface.co/spaces/${component.id}`}
				target="_blank"
				class="rounded-md w-fit px-3.5 py-1 text-sm font-semibold text-white bg-orange-300 hover:drop-shadow-sm"
			>
				Go to Space <span aria-hidden="true">→</span>
			</a>
		</div>
		<iframe
			src={`https://${component.subdomain}.hf.space?__theme=light`}
			height="100%"
			width="100%"
		></iframe>
	</div>
{/each}

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
		flex-direction: column;
	}

	.description {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
