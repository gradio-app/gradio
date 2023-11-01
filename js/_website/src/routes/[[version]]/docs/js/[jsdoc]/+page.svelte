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

			<div class="js_readme">
				<div class="lg:ml-10 mt-5">
					<div class="prose text-lg max-w-full">
						{@html readme_html}
					</div>
				</div>
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
