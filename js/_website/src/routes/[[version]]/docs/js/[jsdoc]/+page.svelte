<script lang="ts">
	import JSDocsNav from "$lib/components/JSDocsNav.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";

	export let data;

	let name = data.name;
	let readme_html = data.readme_html;
	let js_pages = data.js_pages;

	let js_components = js_pages.filter((c) => c !== "js-client");
	$: name = data.name;

	$: prev_obj =
		$page.params?.jsdoc === "atoms"
			? "storybook"
			: js_components[
					js_components.findIndex((page: any) => page === $page.params?.jsdoc) -
						1
				];
	$: next_obj =
		js_components[
			js_components.findIndex((page: any) => page === $page.params?.jsdoc) + 1
		];

	$: readme_html = data.readme_html;
</script>

<MetaTags
	title={"Gradio " + name + " JS Docs"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description={"How to use " + name + " in JS"}
/>

<main class="container mx-auto px-4 flex flex-col gap-4">
	<div class="flex w-full">
		<JSDocsNav current_nav_link={name} {js_components} />

		<div class="flex flex-col w-full min-w-full lg:w-10/12 lg:min-w-0">
			<div>
				<p
					class="lg:ml-10 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 px-4 py-1 mr-2 rounded-full text-orange-800 mb-1 w-fit float-left"
				>
					New to Gradio? Start here: <a class="link" href="/quickstart"
						>Getting Started</a
					>
				</p>
				<p
					class="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 px-4 py-1 rounded-full text-green-800 mb-1 w-fit float-left sm:float-right"
				>
					See the <a class="link" href="/changelog">Release History</a>
				</p>
			</div>
			<div class="w-full flex flex-wrap justify-between my-4">
				{#if prev_obj}
					<a
						href="./{prev_obj}"
						class="lg:ml-10 text-left px-4 py-1 bg-gray-50 rounded-full hover:underline max-w-[48%]"
					>
						<div class="flex text-lg">
							<span class="text-orange-500 mr-1">&#8592;</span>
							<p class="whitespace-nowrap overflow-hidden text-ellipsis">
								{prev_obj}
							</p>
						</div>
					</a>
				{:else}
					<div />
				{/if}
				{#if next_obj}
					<a
						href="./{next_obj}"
						class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline max-w-[48%]"
					>
						<div class="flex text-lg">
							<p class="whitespace-nowrap overflow-hidden text-ellipsis">
								{next_obj}
							</p>
							<span class="text-orange-500 ml-1">&#8594;</span>
						</div>
					</a>
				{:else}
					<div />
				{/if}
			</div>
			<div class="js_readme">
				<div class="lg:ml-10 mt-5">
					<div class="prose text-lg max-w-full">
						{@html readme_html}
					</div>
				</div>
			</div>
			<div class="w-full flex flex-wrap justify-between my-4">
				{#if prev_obj}
					<a
						href="./{prev_obj}"
						class="lg:ml-10 text-left px-4 py-1 bg-gray-50 rounded-full hover:underline max-w-[48%]"
					>
						<div class="flex text-lg">
							<span class="text-orange-500 mr-1">&#8592;</span>
							<p class="whitespace-nowrap overflow-hidden text-ellipsis">
								{prev_obj}
							</p>
						</div>
					</a>
				{:else}
					<div />
				{/if}
				{#if next_obj}
					<a
						href="./{next_obj}"
						class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline max-w-[48%]"
					>
						<div class="flex text-lg">
							<p class="whitespace-nowrap overflow-hidden text-ellipsis">
								{next_obj}
							</p>
							<span class="text-orange-500 ml-1">&#8594;</span>
						</div>
					</a>
				{:else}
					<div />
				{/if}
			</div>
		</div>
	</div>
</main>

<style>
	code {
		font-size: 1rem !important;
	}

	:global(.js_readme pre) {
		padding: 1rem !important;
	}
</style>
