<script lang="ts">
	import DocsNav from "$lib/components/DocsNav.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { onDestroy } from "svelte";
	import { page } from "$app/stores";


	export let data: any = {};

	let name: string = data.name;
	let obj = data.obj;
	let mode = data.mode;
	let components = data.components;
	let helpers = data.helpers;
	let modals = data.modals;
	let routes = data.routes;
	let py_client = data.py_client;
	let on_main: boolean;
	let wheel: string = data.wheel;
	let url_version: string = data.url_version;

	let current_selection = 0;

	let y: number;
	let header_targets: { [key: string]: HTMLElement } = {};
	let target_elem: HTMLElement;

	onDestroy(() => {
		header_targets = {};
	});

	let current_target: HTMLElement;

	$: for (const target in header_targets) {
		target_elem = document.querySelector(`#${target}`) as HTMLElement;
		if (
			y > target_elem?.offsetTop - 50 &&
			y < target_elem?.offsetTop + target_elem?.offsetHeight
		) {
			current_target = header_targets[target];
			current_target.classList.add("text-orange-500");
			Object.values(header_targets).forEach((target) => {
				if (target !== current_target) {
					target.classList.remove("text-orange-500");
				}
			});
		} 
	}

	$: obj = data.obj;
	$: mode = data.mode;
	$: on_main = data.on_main;
	$: components = data.components;
	$: helpers = data.helpers;
	$: modals = data.modals;
	$: routes = data.routes;
	$: py_client = data.py_client;
	$: url_version = data.url_version;

	let import_promise: any = null;
	let component_name = $page.params?.doc;

	$: component_name = $page.params?.doc;

	function import_component(component_name: string) {
		import_promise = import(`/src/lib/templates/gradio/${component_name}.svx`)
	}

	$: import_component(component_name);
		
	
	function get_headers() {
		let headers : any[] = []
		const h3_elements = document.querySelectorAll('h3');
		console.log("h3_elements", h3_elements);
		h3_elements.forEach((element) => {
			headers.push({ title: element.textContent, id: element.id });
	});
		return headers;
	}
	var headers : any[] = []

	var dynamic_component: any = null;

	$: if (dynamic_component) {
		headers = get_headers();
	}

</script>

<MetaTags
	title={"Gradio " + obj.name + " Docs"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description={obj.description}
/>

<svelte:window bind:scrollY={y} />

<main class="container mx-auto px-4 flex gap-4">
	<div class="flex w-full">
		<DocsNav
			current_nav_link={obj.name.toLowerCase()}
			{components}
			{helpers}
			{modals}
			{routes}
			{py_client}
		/>

		<div class="flex flex-col w-full min-w-full lg:w-8/12 lg:min-w-0">
			<div>
				<p
					class="bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 px-4 py-1 mr-2 rounded-full text-orange-800 mb-1 w-fit float-left lg:ml-10"
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

			<div class="flex justify-between mt-4 lg:ml-10">
				{#if obj.prev_obj}
					<a
						href="./{obj.prev_obj.toLowerCase()}"
						class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline"
					>
						<div class="text-lg">
							<span class="text-orange-500">&#8592;</span>
							{obj.prev_obj.replace("-", " ")}
						</div>
					</a>
				{:else}
					<div />
				{/if}
				{#if obj.next_obj}
					<a
						href="./{obj.next_obj.toLowerCase()}"
						class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline"
					>
						<div class="text-lg">
							{obj.next_obj.replace("-", " ")}
							<span class="text-orange-500">&#8594;</span>
						</div>
					</a>
				{:else}
					<div />
				{/if}
			</div>

				<div class="flex flex-row">
					<div class="lg:ml-10">
						<div class="obj" id={obj.slug}>
							{#if import_promise}
								{#await import_promise}
								{:then {default: def}}
								<svelte:component this={def} bind:this={dynamic_component} />
								{/await}
							{/if}
						</div>
					</div>
				</div>


			<div class="lg:ml-10 flex justify-between my-4">
				{#if obj.prev_obj}
					<a
						href="./{obj.prev_obj.toLowerCase()}"
						class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline"
					>
						<div class="text-lg">
							<span class="text-orange-500">&#8592;</span>
							{obj.prev_obj.replace("-", " ")}
						</div>
					</a>
				{:else}
					<div />
				{/if}
				{#if obj.next_obj}
					<a
						href="./{obj.next_obj.toLowerCase()}"
						class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline"
					>
						<div class="text-lg">
							{obj.next_obj.replace("-", " ")}
							<span class="text-orange-500">&#8594;</span>
						</div>
					</a>
				{:else}
					<div />
				{/if}
			</div>
		</div>

		<div
			class="float-right top-8 hidden sticky h-screen overflow-y-auto lg:block lg:w-2/12"
		>
			<div class="mx-8">
				<a class="thin-link py-2 block text-lg" href="#{obj.slug}">{obj.name}</a
				>
				{#if headers && headers.length > 0}
					<ul class="text-slate-700 text-lg leading-6">
						{#each headers as header}
							<li>
								<a
									bind:this={header_targets[header.id]}
									href="#{header.id}"
									class="thin-link block py-2 font-light second-nav-link"
									>{header.title}</a
								>
							</li>
						{/each}
					</ul>
				{/if}
						<!-- {#if method_headers.length > 0}
							{#each method_headers as method_header}
								<li class="">
									<a
										bind:this={header_targets[method_header[1]]}
										href="#{method_header[1]}"
										class="thin-link block py-2 font-light second-nav-link sub-link"
										>&nbsp&nbsp&nbsp&nbsp{method_header[0]}</a
									>
								</li>
							{/each}
						{/if} -->
						<!-- {#if obj.guides && obj.guides.length > 0}
							<li>
								<a
									bind:this={header_targets["guides"]}
									href="#guides"
									class="thin-link block py-2 font-light second-nav-link"
									>Guides</a
								>
							</li>
						{/if}
					</ul>
				{/if} -->
			</div>
		</div>
	</div>
</main>

<style>
	.sub-link {
		border-color: #f3f4f6 !important;
	}
</style>
