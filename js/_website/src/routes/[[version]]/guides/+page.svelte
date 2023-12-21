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

	{#each data.guides_by_category as { category, guides }, i (category)}
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
