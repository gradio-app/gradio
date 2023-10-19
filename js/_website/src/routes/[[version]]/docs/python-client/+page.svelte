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

	let on_main: boolean;
	let wheel: string = data.wheel;

	$: on_main = data.on_main;
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
			current_nav_link={"python-client"}
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

			{#if on_main}
				<div
					class="bg-gray-100 border border-gray-200 text-gray-800 px-3 py-1 mt-4 rounded-lg lg:ml-10"
				>
					<p class="my-2">
						To install Gradio from main, run the following command:
					</p>
					<div class="codeblock">
						<pre class="language-bash" style="padding-right: 50px;"><code
								class="language-bash">pip install {wheel}</code
							></pre>
					</div>
					<p class="float-right text-sm">
						*Note: Setting <code style="font-size: 0.85rem">share=True</code> in
						<code style="font-size: 0.85rem">launch()</code> will not work.
					</p>
				</div>
			{/if}

			<div class="lg:ml-10 flex justify-between mt-4">
				<a
					href="./themes"
					class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline"
				>
					<div class="text-lg">
						<span class="text-orange-500">&#8592;</span> Themes
					</div>
				</a>
				<a
					href="./client"
					class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline"
				>
					<div class="text-lg">
						Client <span class="text-orange-500">&#8594;</span>
					</div>
				</a>
			</div>
			<div class="flex flex-row">
				<div class="lg:w-full lg:ml-10">
					<div class="obj" id="python-client">
						<h2
							id="python-client-header"
							class="text-4xl font-light mb-2 pt-2 text-orange-500"
						>
							Python Client
						</h2>

						<p class="mt-8 mb-2 text-lg">
							The lightweight Gradio client libraries make it easy to use any
							Gradio app as an API. We currently support both a Python client
							library as well as a JavaScript client library.
						</p>

						<p class="mt-2 text-lg">
							The Python client library is <code class="language-bash"
								>gradio_client</code
							>. It's included in the latest versions of the
							<code class="language-bash">gradio</code>
							package, but for a more lightweight experience, you can install it
							using
							<code class="language-bash">pip</code>
							without having to install
							<code class="language-bash">gradio</code>:
						</p>

						<div class="codeblock">
							<pre><code class="language-bash">pip install gradio_client</code
								></pre>
						</div>

						<p class="mt-2 text-lg">
							The library mainly consists of two primary classes: <code
								class="language-bash">Client</code
							>
							and <code class="language-bash">Job</code>. Learn more by reading
							our guide:
							<a
								href="https://gradio.app/guides/getting-started-with-the-python-client/"
								target="_blank">Getting Started with the Python Client</a
							>
						</p>
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
