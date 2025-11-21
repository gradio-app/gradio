<script lang="ts">
	import DocsNav from "$lib/components/DocsNav.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import { onNavigate } from "$app/navigation";
	import '$lib/assets/theme.css';

	export let data: any = {};

	let name: string = data.name;
	let on_main: boolean;
	let wheel: any = data.wheel;
	let install_command: string = wheel.gradio_install;
	let url_version: string = data.url_version;

	let y: number;
	let header_targets: { [key: string]: HTMLElement } = {};
	let target_elem: HTMLElement;
	let module = data.module.default;
	$: module = data.module.default;

	let current_target: HTMLElement;

	$: for (const target in header_targets) {
		target_elem = document.querySelector(`#${target}`) as HTMLElement;
		if (
			y > target_elem?.offsetTop - 50 &&
			y < target_elem?.offsetTop + target_elem?.offsetHeight
		) {
			current_target = header_targets[target];
			current_target.classList.add("current-nav-link");
			Object.values(header_targets).forEach((target) => {
				if (target !== current_target && target) {
					target.classList.remove("current-nav-link");
				}
			});
		} 
	}

	$: name = data.name;
	$: on_main = data.on_main;
	$: url_version = data.url_version;
	$: pages = data.pages.gradio;
	$: page_path = data.page_path;

	$: flattened_pages = pages.map((category: any) => category.pages).flat();

	let component_name = $page.params?.doc;
	$: component_name = $page.params?.doc;

	$: prev_obj =
	flattened_pages[
		flattened_pages.findIndex((page: any) => page.name === component_name) - 1
		];
	$: next_obj =
		flattened_pages[
			flattened_pages.findIndex((page: any) => page.name === component_name) + 1
		];
	
	function get_headers() {
		let headers : any[] = []
		const h3_elements = document.querySelectorAll('h3');
		h3_elements.forEach((element) => {
			headers.push({ title: element.textContent, id: element.id });
	});
		const page_title_elem = document.querySelector('h1');
		let page_title = {title: "", id: ""}
		if (page_title_elem) {
			page_title_elem.id = page_title_elem?.textContent?.toLowerCase().replace(/ /g, "-") || "";
			page_title = {title: page_title_elem?.textContent || "", id: page_title_elem.id};
		}
		return { headers: headers, page_title: page_title};
	}
	
	var all_headers : {headers: any[], page_title: {title: string, id: string}} = {headers: [], page_title: {title: "", id: ""}};

	var dynamic_component: any = null;

	$: if (dynamic_component) {
		all_headers = get_headers();
	}

	let show_nav = false;

	onNavigate(() => {
		show_nav = false;
	});

	$: show_nav;

	function get_category(name: string) {
		if (pages) {
			for (let category of pages) {
				for (let page of category.pages) {
					if (page.name === name) {
						return [category.category, page.pretty_name];
					}
				}
			}
		}
	}


	let category_and_name: any[] | undefined = get_category(name);

	$: category_and_name = get_category(name);

</script>

<MetaTags
	title={"Gradio " + all_headers.page_title.title + " Docs"}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description={"Gradio docs for using " + all_headers.page_title.title}
/>

<svelte:window bind:scrollY={y} />

<main class="container mx-auto px-4 pt-8 flex flex-col gap-4">
	<div class="flex items-center p-4 border-b border-t border-slate-900/10 lg:hidden dark:border-slate-50/[0.06]">
		<button 
		on:click={() => (show_nav = !show_nav)}
		type="button" class="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300">
			<svg width="24" height="24"><path d="M5 6h14M5 12h14M5 18h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>
		</button>
		{#if category_and_name}
		<ol class="ml-4 flex text-sm leading-6 whitespace-nowrap min-w-0">
			<li class="flex items-center">{category_and_name[0]}
				<svg width="3" height="6" aria-hidden="true" class="mx-3 overflow-visible text-slate-400"><path d="M0 0L3 3L0 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>
			</li>
			<li class="font-semibold text-slate-900 truncate dark:text-slate-200">
				{category_and_name[1]}
			</li>
		</ol>
		{/if}
	</div>

	<div class="flex w-full">
		<DocsNav
			current_nav_link={name}
			library_pages={pages}
			bind:show_nav={show_nav}
		/>

		<div class="flex flex-col w-full min-w-full lg:w-8/12 lg:min-w-0">
			<div>
				<p
					class="bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 px-4 py-1 mr-2 rounded-full text-orange-800 dark:text-orange-200 mb-1 w-fit float-left lg:ml-10"
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
								class="language-bash">{install_command}</code
							></pre>
					</div>
					<p class="float-right text-sm">
						*Note: Setting <code style="font-size: 0.85rem">share=True</code> in
						<code style="font-size: 0.85rem">launch()</code> will not work.
					</p>
				</div>
			{/if}
				

			<div class="w-full flex flex-wrap justify-between my-4">
					{#if prev_obj}
						<a
							href="./{prev_obj.name}"
							class="lg:ml-10 text-left px-4 py-1 bg-gray-50 dark:bg-neutral-700 rounded-full hover:underline max-w-[48%]"
						>
							<div class="flex text-lg">
								<span class="text-orange-500 mr-1">&#8592;</span>
								<p class="whitespace-nowrap overflow-hidden text-ellipsis text-gray-900 dark:text-gray-100">{prev_obj.pretty_name}</p>
							</div>
						</a>
					{:else}
						<div />
					{/if}
					{#if next_obj}
						<a
							href="./{next_obj.name}"
							class="text-right px-4 py-1 bg-gray-50 dark:bg-neutral-700 rounded-full hover:underline max-w-[48%]"
						>
							<div class="flex text-lg">
								<p class="whitespace-nowrap overflow-hidden text-ellipsis text-gray-900 dark:text-gray-100">{next_obj.pretty_name}</p>
								<span class="text-orange-500 ml-1">&#8594;</span>
							</div>
						</a>
					{:else}
						<div />
					{/if}
				</div>

				<div class="flex flex-row">
					<div class="lg:ml-10 w-full">
						<div class="obj text-gray-900 dark:text-gray-100">
							<svelte:component this={module} bind:this={dynamic_component}/>
						</div>
					</div>
				</div>

				<div class="w-full flex flex-wrap justify-between my-4">
					{#if prev_obj}
						<a
							href="./{prev_obj.name}"
							class="lg:ml-10 text-left px-4 py-1 bg-gray-50 dark:bg-neutral-700 rounded-full hover:underline max-w-[48%]"
						>
							<div class="flex text-lg">
								<span class="text-orange-500 mr-1">&#8592;</span>
								<p class="whitespace-nowrap overflow-hidden text-ellipsis text-gray-900 dark:text-gray-100">{prev_obj.pretty_name}</p>
							</div>
						</a>
					{:else}
						<div />
					{/if}
					{#if next_obj}
						<a
							href="./{next_obj.name}"
							class="text-right px-4 py-1 bg-gray-50 dark:bg-neutral-700 rounded-full hover:underline max-w-[48%]"
						>
							<div class="flex text-lg">
								<p class="whitespace-nowrap overflow-hidden text-ellipsis text-gray-900 dark:text-gray-100">{next_obj.pretty_name}</p>
								<span class="text-orange-500 ml-1">&#8594;</span>
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
				<a class="block text-sm font-bold text-gray-900 dark:text-gray-100 py-2" href="#{all_headers.page_title.id}">{all_headers.page_title.title}</a
				>
				{#if all_headers.headers && all_headers.headers.length > 0}
					<ul class="space-y-2 list-none">
						{#each all_headers.headers as header}
							<li>
								<a
									bind:this={header_targets[header.id]}
									href="#{header.id}"
									class="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors py-1"
									>{header.title}</a
								>
							</li>
						{/each}
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
