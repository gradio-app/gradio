<script lang="ts">
	import DocsNav from "$lib/components/DocsNav.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";

	export let data;

	let components = data.components;
	let helpers = data.helpers;
	let modals = data.modals;
	let routes = data.routes;
	let py_client = data.py_client;

	let readme_html = data.readme_html;
	$: components = data.components;
	$: helpers = data.helpers;
	$: modals = data.modals;
	$: routes = data.routes;
	$: py_client = data.py_client;
</script>

<MetaTags
	title={"Gradio Python Client Docs"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description={"The lightweight Gradio client library that makes it easy to use any Gradio app as an API"}
/>

<main class="container mx-auto px-4 flex gap-4">
	<div class="flex w-full">
		<DocsNav
			current_nav_link={"js-client"}
			{components}
			{helpers}
			{modals}
			{routes}
			{py_client}
		/>

		<div class="flex flex-col w-full min-w-full lg:w-8/12 lg:min-w-0">
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

			<div class="lg:ml-10 flex justify-between mt-4">
				<a
					href="./job"
					class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline"
				>
					<div class="text-lg">
						<span class="text-orange-500">&#8592;</span> Job
					</div>
				</a>
			</div>
			<div class="flex flex-row">
				<div class="lg:w-3/4 lg:ml-10 lg:mr-24">
					<div class="prose text-lg max-w-full">
						{@html readme_html}
					</div>
				</div>
			</div>
		</div>
		<div
			class="float-right top-8 hidden sticky h-screen overflow-y-auto lg:w-2/12 lg:block"
		></div>
	</div>
</main>

<style>
	code {
		font-size: 1rem;
	}
</style>
