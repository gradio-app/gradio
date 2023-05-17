<script>
	import DocsNav from "../../../components/DocsNav.svelte";
	import MetaTags from "../../../components/MetaTags.svelte";
	import dataflow_svg from "../../../assets/img/dataflow.svg";

	export let data;

	let components = data.components;
	let helpers = data.helpers;
	let routes = data.routes;
	let ordered_events = data.ordered_events;
	let py_client = data.py_client;

	let readme_html = data.readme_html;
</script>

<MetaTags
	title={"Gradio Python Client Docs"}
	url={"https://gradio.app/docs/python-client"}
	canonical={"https://gradio.app/docs/python-client"}
	description={"The lightweight Gradio client library that makes it easy to use any Gradio app as an API"}
/>

<main class="container mx-auto px-4 flex gap-4">
	<DocsNav
		current_nav_link={"js-client"}
		{components}
		{helpers}
		{routes}
		{py_client}
	/>

	<div class="flex flex-col w-full min-w-full lg:w-10/12 lg:min-w-0">
		<div>
			<p
				class="bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 px-4 py-1 mr-2 rounded-full text-orange-800 mb-1 w-fit float-left"
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

		<div class="flex justify-between mt-4">
			<a
				href="/docs/job"
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
</main>

<style>
	code {
		font-size: 1rem;
	}
</style>
