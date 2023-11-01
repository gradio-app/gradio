<script lang="ts">
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	export let data: {
		[key: string]: any;
	};

	let search_query = "";

	function search() {
		for (const category in data.guides_by_category) {
			for (const guide in data.guides_by_category[category].guides) {
				let g = data.guides_by_category[category].guides[guide];
				data.guides_by_category[category].guides[guide].hidden = !(
					g.pretty_name.toLowerCase().includes(search_query.toLowerCase()) ||
					g.content.toLowerCase().includes(search_query.toLowerCase())
				);
			}
		}
	}

	function isNotHidden(guide: any) {
		return !guide.hidden;
	}

	function categoryNotHidden(category: any) {
		return category.guides.filter(isNotHidden).length !== 0;
	}
	import DropDown from "$lib/components/VersionDropdown.svelte";
</script>

<MetaTags
	title="Gradio Guides"
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="Step-by-Step Gradio Tutorials"
/>

<div class="container mx-auto px-4 relative pt-8 mb-0">
	<input
		id="search-by-tag"
		type="text"
		class="w-full border border-gray-200 p-1 rounded-md outline-none text-center text-lg mb-1 focus:placeholder-transparent focus:shadow-none focus:border-orange-500 focus:ring-0"
		placeholder="What do you want to build?"
		autocomplete="off"
		bind:value={search_query}
		on:keyup={search}
	/>

	<div class="text-gray-600 mb-0 mx-auto w-fit text-sm">
		Search through
		<span id="counter">{data.total_guides}</span>
		Guides.
		<a
			class="link text-gray-600"
			href="https://github.com/gradio-app/gradio/tree/main/guides/CONTRIBUTING.md"
			>Contribute here</a
		>
	</div>

	<div class="mt-[-28px] mb-[28px] flex justify-end">
		<DropDown />
	</div>

	<!-- CUSTOM COMPONENTS HIGHLIGHT -->
	<div class="category mb-8 p-4 border-orange-300 border rounded-xl">
		<h2 class="mb-4 text-2xl font-thin block">
			<svg
				class="inline align-baseline"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				version="1.1"
				width="18"
				height="18"
				viewBox="0 0 256 256"
				xml:space="preserve"
			>
				<defs> </defs>
				<g
					style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;"
					transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
				>
					<path
						d="M 89.011 87.739 c -0.599 -1.371 -1.294 -2.652 -1.968 -3.891 l -0.186 -0.343 l -15.853 -15.91 c -0.371 -0.375 -0.746 -0.748 -1.12 -1.12 c -0.671 -0.667 -1.342 -1.335 -1.997 -2.018 l -1.459 -1.437 l 23.316 -23.317 l -1.704 -1.704 c -9.111 -9.112 -22.925 -12.518 -35.353 -8.759 l -6.36 -6.359 c 0.769 -7.805 -2.017 -15.69 -7.503 -21.175 L 37.123 0 L 0 37.122 l 1.706 1.704 c 5.487 5.487 13.368 8.271 21.176 7.503 l 6.36 6.36 C 25.484 65.115 28.889 78.93 38 88.041 l 1.703 1.704 l 23.316 -23.316 l 1.438 1.458 c 0.679 0.653 1.344 1.321 2.009 1.989 c 0.373 0.374 0.745 0.748 1.117 1.116 l 15.699 15.7 l 0.566 0.352 c 1.239 0.673 2.52 1.369 3.891 1.968 L 90 90 L 89.011 87.739 z"
						style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255 124 1); fill-rule: nonzero; opacity: 1;"
						transform=" matrix(1 0 0 1 0 0) "
						stroke-linecap="round"
					/>
				</g>
			</svg>

			Custom Components<sup class="text-orange-500">NEW</sup>
		</h2>
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{#each ["Five Minute Guide", "Key Component Concepts", "Configuration", "Backend", "Frontend", "Frequently Asked Questions"] as guide}
				<a
					class="guide-box flex lg:col-span-1 flex-col group overflow-hidden relative rounded-xl shadow-sm hover:shadow-alternate transition-shadow bg-gradient-to-r {data
						.COLOR_SETS[3][0]} {data.COLOR_SETS[3][1]}"
					href="./guides/{guide.toLowerCase().replace(/ /g, '-')}"
				>
					<div class="flex flex-col p-4 h-min">
						<h2 class="group-hover:underline text-lg">{guide}</h2>
						<div class="tags-holder"></div>
					</div>
				</a>
			{/each}
		</div>
	</div>

	{#each data.guides_by_category as { category, guides }, i (category)}
		{#if !(category == "Custom Components")}
			<div class="category mb-8 p-4">
				<h2
					class:hidden={guides.filter(isNotHidden).length === 0}
					class="mb-4 text-2xl font-thin block"
				>
					{category}
				</h2>
				<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{#each guides as guide (guide.name)}
						<a
							class:hidden={guide.hidden}
							class="guide-box flex lg:col-span-1 flex-col group overflow-hidden relative rounded-xl shadow-sm hover:shadow-alternate transition-shadow bg-gradient-to-r {data
								.COLOR_SETS[i][0]} {data.COLOR_SETS[i][1]}"
							href=".{guide.url}"
						>
							<div class="flex flex-col p-4 h-min">
								<h2 class="group-hover:underline text-lg">
									{guide.pretty_name}
								</h2>
								<div class="tags-holder">
									{#if guide.tags}
										<p class="text-gray-600">
											<!--
                    -->{#each guide.tags as tag, j (tag)}<!--
                    -->{tag}{#if j !== guide.tags.length - 1},&nbsp;{/if}<!--
                    -->{/each}<!--
                -->
										</p>
									{/if}
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{/each}

	<div
		class:hidden={data.guides_by_category.filter(categoryNotHidden).length !==
			0}
		class="no-guides hidden text-center text-xl text-gray-500"
	>
		<p class="mb-4">Sorry, we couldn't find a guide with this query...</p>
		<p>
			Try a different term, or <a class="link" href="/docs">see the docs</a>
		</p>
	</div>
</div>
