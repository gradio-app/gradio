<script lang="ts">
	import DocsNavCustom from "$lib/components/DocsNavCustom.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";

	export let data;

	let components = data.components;
	let helpers = data.helpers;
	let modals = data.modals;
	let routes = data.routes;
	let py_client = data.py_client;
	let wheel: any = data.wheel;
	let install_command: string = wheel.gradio_js_client_install;

	let readme_html = data.readme_html;
	$: components = data.components;
	$: helpers = data.helpers;
	$: modals = data.modals;
	$: routes = data.routes;
	$: py_client = data.py_client;
	$: on_main = data.on_main;
</script>

<MetaTags
	title={"Gradio Javascript Client Docs"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description={"Make programmatic requests to Gradio applications in JavaScript (TypeScript) from the browser or server-side."}
/>

<main class="container mx-auto px-4 flex gap-4">
	<div class="flex w-full">
		<DocsNavCustom
			items={{
				Installation: "#installation",
				Usage: "#usage",
				client: "#client",
				duplicate: "#duplicate"
			}}
			title={"JavaScript Client"}
		/>

		<div class="flex flex-col w-full min-w-full lg:min-w-0">
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
			<div
				class="bg-gray-100 border border-gray-200 text-gray-800 px-3 py-1 mt-4 rounded-lg lg:ml-10"
			>
				<p class="my-2">
					To install the Gradio JS Client from main, run the following command:
				</p>
				<div class="codeblock mb-2">
					<pre class="language-bash" style="padding-right: 50px;"><code
							class="language-bash">{install_command}</code
						></pre>
				</div>
			</div>

			<div class="lg:ml-10 flex justify-between mt-4"></div>
			<div class="flex flex-row">
				<div class="w-full lg:ml-10 lg:mr-24">
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
		font-size: 1rem;
	}
</style>
