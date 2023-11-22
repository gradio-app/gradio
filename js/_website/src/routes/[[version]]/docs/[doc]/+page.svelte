<script lang="ts">
	import Demos from "$lib/components/Demos.svelte";
	import DocsNav from "$lib/components/DocsNav.svelte";
	import FunctionDoc from "$lib/components/FunctionDoc.svelte";
	import EventListeners from "$lib/components/EventListeners.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import anchor from "$lib/assets/img/anchor.svg";
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

	let headers: [string, string][];
	let method_headers: [string, string][];
	$: headers = data.headers;
	$: method_headers = data.method_headers;

	let current_selection = 0;

	function handleAnchorClick(event: MouseEvent) {
		event.preventDefault();
		const link = event.currentTarget as HTMLAnchorElement;
		const anchorId = new URL(link?.href).hash.replace("#", "");
		const anchor = document.getElementById(anchorId);
		window.scrollTo({
			top: anchor?.offsetTop,
			behavior: "smooth"
		});
	}

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

	$: obj = data.obj;
	$: mode = data.mode;
	$: on_main = data.on_main;
	$: components = data.components;
	$: helpers = data.helpers;
	$: modals = data.modals;
	$: routes = data.routes;
	$: py_client = data.py_client;
	$: url_version = data.url_version;
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
						<div class="flex flex-row items-center justify-between">
							<h3 id="{obj.slug}-header" class="group text-3xl font-light py-4">
								{obj.name}
								<a
									href="#{obj.slug}-header"
									class="invisible group-hover-visible"
									on:click={handleAnchorClick}
									><img class="anchor-img" src={anchor} /></a
								>
							</h3>
						</div>

						<div class="codeblock">
							{#if obj.override_signature}
								<pre><code class="code language-python"
										>{obj.override_signature}</code
									></pre>
							{:else}
								<pre><code class="code language-python"
										>{obj.parent}.<span>{obj.name}&lpar;</span
										><!--
                -->{#each obj.parameters as param}<!--
                  -->{#if !("kwargs" in param) && !("default" in param) && param.name != "self"}<!--
                    -->{param.name}, <!--
                  -->{/if}<!--
                -->{/each}<!--  
                -->···<span
											>&rpar;</span
										></code
									></pre>
							{/if}
						</div>

						{#if mode === "components"}
							<div class="embedded-component">
								{#key obj.name}
									{#if obj.name !== "State"}
										{#if url_version === "main"}
											<gradio-app
												space={"gradio/" +
													obj.name.toLowerCase() +
													"_component_main"}
											/>
										{:else if url_version === "3.50.2"}
											<gradio-app
												space={"gradio/" +
													obj.name.toLowerCase() +
													"_component_3-x"}
											/>
										{:else}
											<gradio-app
												space={"gradio/" +
													obj.name.toLowerCase() +
													"_component"}
											/>
										{/if}
									{/if}
								{/key}
							</div>
						{/if}

						<div id="description">
							<h4 class="mt-8 text-xl text-orange-500 font-light group">
								Description
								<a
									href="#description"
									class="invisible group-hover-visible"
									on:click={handleAnchorClick}
									><img class="anchor-img-small" src={anchor} /></a
								>
							</h4>
							<p class="mb-2 text-lg text-gray-600">{@html obj.description}</p>
						</div>

						{#if mode === "components"}
							<div id="behavior">
								<h4 class="mt-4 text-xl text-orange-500 font-light group">
									Behavior
									<a href="#behavior" class="invisible group-hover-visible"
										><img class="anchor-img-small" src={anchor} /></a
									>
								</h4>
								<p class="text-lg text-gray-500">
									<span class="text-gray-700">As input: </span>
									{@html obj.preprocessing}
								</p>
								<p class="text-lg text-gray-500">
									<span class="text-gray-700">As output:</span>
									{@html obj.postprocessing}
								</p>
								{#if obj.examples_format}
									<p class="text-lg text-gray-500">
										<span class="text-gray-700"
											>Format expected for examples:</span
										>
										{@html obj.examples_format}
									</p>
								{/if}
								{#if obj.events && obj.events.length > 0}
									<p class="text-lg text-gray-500">
										<span class="text-gray-700">Supported events:</span>
										<em>{@html obj.events}</em>
									</p>
								{/if}
							</div>
						{/if}

						{#if obj.example}
							<div id="example-usage">
								<h4 class="mt-4 text-xl text-orange-500 font-light group">
									Example Usage
									<a
										href="#example-usage"
										class="invisible group-hover-visible"
										on:click={handleAnchorClick}
										><img class="anchor-img-small" src={anchor} /></a
									>
								</h4>
								<div class="codeblock">
									<pre><code class="code language-python"
											>{@html obj.highlighted_example}</code
										></pre>
								</div>
							</div>
						{/if}

						{#if (obj.parameters.length > 0 && obj.parameters[0].name != "self") || obj.parameters.length > 1}
							<div id="initialization">
								<h4 class="mt-6 text-xl text-orange-500 font-light group">
									Initialization
									<a
										href="#initialization"
										class="invisible group-hover-visible"
										><img class="anchor-img-small" src={anchor} /></a
									>
								</h4>
								<table class="table-fixed w-full leading-loose">
									<thead class="text-left">
										<tr>
											<th class="px-3 pb-3 w-2/5 text-gray-700 font-semibold"
												>Parameter</th
											>
											<th class="px-3 pb-3 text-gray-700 font-semibold"
												>Description</th
											>
										</tr>
									</thead>
									<tbody
										class=" rounded-lg bg-gray-50 border border-gray-100 overflow-hidden text-left align-top divide-y"
									>
										{#each obj.parameters as param}
											{#if param["name"] != "self"}
												<tr
													class="group hover:bg-gray-200/60 odd:bg-gray-100/80"
												>
													<td class="p-3 w-2/5 break-words">
														<code class="block">
															{param["name"]}
														</code>
														<p class="text-gray-500 italic">
															{param["annotation"]}
														</p>
														{#if "default" in param}
															<p class="text-gray-500 font-semibold">
																default: {param["default"]}
															</p>
														{:else if !("kwargs" in param)}
															<p class="text-orange-600 font-semibold italic">
																required
															</p>
														{/if}
													</td>
													<td class="p-3 text-gray-700 break-words">
														<p>{param["doc"] || ""}</p>
													</td>
												</tr>
											{/if}
										{/each}
									</tbody>
								</table>
							</div>
						{/if}

						{#if mode === "components" && obj.string_shortcuts}
							<div id="shortcuts">
								<h4 class="mt-6 text-xl text-orange-500 font-light group">
									Shortcuts
									<a
										href="#shortcuts"
										class="invisible group-hover-visible"
										on:click={handleAnchorClick}
										><img class="anchor-img-small" src={anchor} /></a
									>
								</h4>
								<table class="mb-4 table-fixed w-full">
									<thead class="text-left">
										<tr>
											<th class="px-3 pb-3 text-gray-700 font-semibold w-2/5"
												>Class</th
											>
											<th class="px-3 pb-3 text-gray-700 font-semibold"
												>Interface String Shortcut</th
											>
											<th class="px-3 pb-3 text-gray-700 font-semibold"
												>Initialization</th
											>
										</tr>
									</thead>
									<tbody
										class="text-left divide-y rounded-lg bg-gray-50 border border-gray-100 overflow-hidden"
									>
										{#each obj.string_shortcuts as shortcut}
											<tr class="group hover:bg-gray-200/60 odd:bg-gray-100/80">
												<td class="p-3 w-2/5 break-words">
													<p>
														<code class="lang-python">gradio.{shortcut[0]}</code
														>
													</p>
												</td>
												<td class="p-3 w-2/5 break-words">
													<p>"{shortcut[1]}"</p>
												</td>
												<td class="p-3 text-gray-700 break-words">
													{shortcut[2]}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}

						{#if obj.demos}
							<div id="demos">
								<div class="category my-8" id="examples">
									<h4 class="text-xl text-orange-500 font-light group">
										Demos
										<a
											href="#demos"
											class="invisible group-hover-visible"
											on:click={handleAnchorClick}
											><img class="anchor-img-small" src={anchor} /></a
										>
									</h4>
									<div>
										<div class="demo-window overflow-y-auto h-full w-full mb-4">
											<div
												class="relative mx-auto my-auto rounded-md bg-white"
												style="top: 5%; height: 90%"
											>
												<div class="flex overflow-auto pt-4">
													{#each obj.demos as demo, i}
														<button
															on:click={() => (current_selection = i)}
															class:selected-demo-tab={current_selection == i}
															class="demo-btn px-4 py-2 text-lg min-w-max text-gray-600 hover:text-orange-500"
															name={demo[0]}>{demo[0]}</button
														>
													{/each}
												</div>
												{#each obj.demos as demo, i}
													<div
														class:hidden={current_selection !== i}
														class:selected-demo-window={current_selection == i}
														class="demo-content px-4"
													>
														<Demos
															name={demo[0]}
															code={demo[1]}
															highlighted_code={demo[2]}
															{url_version}
														/>
													</div>
												{/each}
											</div>
										</div>
									</div>
								</div>
							</div>
						{/if}

						{#if obj.fns && obj.fns.length > 0}
							{#if mode === "components"}
								<div id="event-listeners">
									<h4 class="mt-4 p-3 text-xl text-orange-500 font-light group">
										Event Listeners
										<a
											href="#event-listeners"
											class="invisible group-hover-visible"
											on:click={handleAnchorClick}
											><img class="anchor-img-small" src={anchor} /></a
										>
									</h4>
									<div class="flex flex-col gap-8 pl-12">
										<EventListeners fns={obj.fns} />
										<div class="ml-12" />
									</div>
								</div>
							{:else}
								<div id="methods">
									<h4 class="mt-4 p-3 text-xl text-orange-500 font-light group">
										Methods
										<a
											href="#methods"
											class="invisible group-hover-visible"
											on:click={handleAnchorClick}
											><img class="anchor-img-small" src={anchor} /></a
										>
									</h4>
									<div class="flex flex-col gap-8 pl-12">
										{#each obj.fns as fn}
											<FunctionDoc {fn} />
										{/each}
										<div class="ml-12" />
									</div>
								</div>
							{/if}
						{/if}

						{#if obj.guides && obj.guides.length > 0}
							<div id="guides">
								<h4 class="mt-4 p-3 text-xl text-orange-500 font-light group">
									Guides
									<a
										href="#guides"
										class="invisible group-hover-visible"
										on:click={handleAnchorClick}
										><img class="anchor-img-small" src={anchor} /></a
									>
								</h4>

								<div
									class="guides-list grid grid-cols-1 lg:grid-cols-4 gap-4 pb-3 px-3"
								>
									{#each obj.guides as guide, i}
										<a
											class="guide-box flex lg:col-span-1 flex-col group overflow-hidden relative rounded-xl shadow-sm hover:shadow-alternate transition-shadow bg-gradient-to-r {data
												.COLOR_SETS[i][0]} {data.COLOR_SETS[i][1]}"
											target="_blank"
											href="..{guide.url}"
										>
											<div class="flex flex-col p-4 h-min">
												<p class="group-hover:underline text-l">
													{guide.pretty_name}
												</p>
											</div>
										</a>
									{/each}
								</div>
							</div>
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
				<a
					class="thin-link py-2 block text-lg"
					href="#{obj.slug}"
					on:click={handleAnchorClick}>{obj.name}</a
				>
				{#if headers.length > 0}
					<ul class="text-slate-700 text-lg leading-6">
						{#each headers as header}
							<li>
								<a
									bind:this={header_targets[header[1]]}
									href="#{header[1]}"
									class="thin-link block py-2 font-light second-nav-link"
									on:click={handleAnchorClick}>{header[0]}</a
								>
							</li>
						{/each}
						{#if method_headers.length > 0}
							{#each method_headers as method_header}
								<li class="">
									<a
										bind:this={header_targets[method_header[1]]}
										href="#{method_header[1]}"
										class="thin-link block py-2 font-light second-nav-link sub-link"
										on:click={handleAnchorClick}
										>&nbsp&nbsp&nbsp&nbsp{method_header[0]}</a
									>
								</li>
							{/each}
						{/if}
						{#if obj.guides && obj.guides.length > 0}
							<li>
								<a
									bind:this={header_targets["guides"]}
									href="#guides"
									class="thin-link block py-2 font-light second-nav-link"
									on:click={handleAnchorClick}>Guides</a
								>
							</li>
						{/if}
					</ul>
				{/if}
			</div>
		</div>
	</div>
</main>

<style>
	.sub-link {
		border-color: #f3f4f6 !important;
	}
</style>
