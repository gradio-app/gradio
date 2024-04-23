<script lang="ts">
	import Demos from "$lib/components/Demos.svelte";
	import DocsNav from "$lib/components/DocsNav.svelte";
	import FunctionDoc from "$lib/components/FunctionDoc.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import anchor from "$lib/assets/img/anchor.svg";
	import { onDestroy } from "svelte";
	import { page } from "$app/stores";

	export let data: any;

	let obj = data.obj;
	let components = data.components;
	let helpers = data.helpers;
	let modals = data.modals;
	let routes = data.routes;
	let headers = data.headers;
	let method_headers = data.method_headers;
	let py_client = data.py_client;

	let current_selection = 0;

	let y: number;
	let header_targets: { [key: string]: HTMLElement } = {};
	let target_elem: HTMLElement;

	onDestroy(() => {
		header_targets = {};
	});

	$: for (const target in header_targets) {
		target_elem = document.querySelector(`#${target}`) as HTMLElement;
		if (
			y > target_elem?.offsetTop - 50 &&
			y < target_elem?.offsetTop + target_elem?.offsetHeight
		) {
			header_targets[target]?.classList.add("current-nav-link");
		} else {
			header_targets[target]?.classList.remove("current-nav-link");
		}
	}

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
	title={"Gradio No Reload Docs"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description={obj.description}
/>

<svelte:window bind:scrollY={y} />

<main class="container mx-auto px-4 flex gap-4">
	<div class="flex w-full">
		<DocsNav
			current_nav_link={"no-reload"}
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
				
			</div>

			<div class="flex flex-row">
				<div class="lg:ml-10">
					<div class="obj" id={obj.slug}>
						<div class="flex flex-row items-center justify-between">
							<h3 id="{obj.slug}-header" class="group text-3xl font-light py-4">
								{obj.name}
								<a
									href="#{obj.slug}-header"
									class="invisible group-hover-visible"
									><img class="anchor-img" src={anchor} /></a
								>
							</h3>
						</div>
						<div class="codeblock">
							<pre><code class="code language-python"
									>{obj.override_signature}</code
								></pre>
						</div>

						<h4
							class="mt-8 text-xl text-orange-500 font-light group"
							id="description"
						>
							Description
							<a href="#description" class="invisible group-hover-visible"
								><img class="anchor-img-small" src={anchor} /></a
							>
						</h4>
						<p class="mb-2 text-lg text-gray-600">{@html obj.description}</p>

						{#if obj.example}
							<h4
								class="mt-4 text-xl text-orange-500 font-light group"
								id="example-usage"
							>
								Example Usage
								<a href="#example-usage" class="invisible group-hover-visible"
									><img class="anchor-img-small" src={anchor} /></a
								>
							</h4>
							<div class="codeblock">
								<pre><code class="code language-python"
										>{@html obj.highlighted_example}</code
									></pre>
							</div>
						{/if}
					</div>
				</div>
			</div>
			<div class="lg:ml-10 flex justify-between my-4">
				<a
					href="./themes"
					class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline"
				>
					<div class="text-lg">
						<span class="text-orange-500">&#8592;</span> themes
					</div>
				</a>
				
			</div>
		</div>
		<div
			class="float-right top-8 hidden sticky h-screen overflow-y-auto lg:block lg:w-2/12"
		>
			<div class="mx-8">
				<a class="thin-link py-2 block text-lg" href="#no-reload">NO RELOAD</a>
				{#if headers.length > 0}
					<ul class="text-slate-700 text-lg leading-6">
						{#each headers as header}
							<li>
								<a
									bind:this={header_targets[header[1]]}
									href="#{header[1]}"
									class="thin-link block py-2 font-light second-nav-link"
									>{header[0]}</a
								>
							</li>
						{/each}
						{#if method_headers.length > 0}
							{#each method_headers as method_header}
								<li class="ml-4">
									<a
										href="#{method_header[1]}"
										class="thin-link block py-2 font-light second-nav-link"
										>{method_header[0]}</a
									>
								</li>
							{/each}
						{/if}
					</ul>
				{/if}
			</div>
		</div>
	</div>
</main>
