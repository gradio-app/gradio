<script lang="ts">
	import DocsNav from "$lib/components/DocsNav.svelte";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { onDestroy } from "svelte";
	import { page } from "$app/stores";

	export let data: any = {};

	let name: string = data.name;
	let module = data.module.default;

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
			current_target.classList.add("current-nav-link");
			Object.values(header_targets).forEach((target) => {
				if (target !== current_target && target) {
					target.classList.remove("current-nav-link");
				}
			});
		}
	}

	$: name = data.name;
	$: pages = data.pages["third-party-clients"];
	$: page_path = data.page_path;
	$: module = data.module.default;

	$: flattened_pages = pages.map((category: any) => category.pages).flat();
	$: prev_obj =
		flattened_pages[
			flattened_pages.findIndex(
				(page: any) => page.name === $page.params?.doc
			) - 1
		];
	$: next_obj =
		flattened_pages[
			flattened_pages.findIndex(
				(page: any) => page.name === $page.params?.doc
			) + 1
		];

	let component_name = $page.params?.doc;

	$: component_name = $page.params?.doc;

	function get_headers() {
		let headers: any[] = [];
		const h3_elements = document.querySelectorAll("h3");
		h3_elements.forEach((element) => {
			headers.push({ title: element.textContent, id: element.id });
		});
		const page_title_elem = document.querySelector("h1");
		let page_title = { title: "", id: "" };
		if (page_title_elem) {
			page_title_elem.id =
				page_title_elem?.textContent?.toLowerCase().replace(/ /g, "-") || "";
			page_title = {
				title: page_title_elem?.textContent || "",
				id: page_title_elem.id
			};
		}
		return { headers: headers, page_title: page_title };
	}

	var all_headers: {
		headers: any[];
		page_title: { title: string; id: string };
	} = { headers: [], page_title: { title: "", id: "" } };

	var dynamic_component: any = null;

	$: if (dynamic_component) {
		all_headers = get_headers();
	}
	let title: string;
	let description: string;
	$: title =
		all_headers.page_title.title === "Introduction"
			? "Third Party Client - " + all_headers.page_title.title + " Docs"
			: "Third Python Client - " + all_headers.page_title.title + " Class Docs";
	$: description =
		all_headers.page_title.title === "Introduction"
			? "Make programmatic requests to Gradio applications from third party clients."
			: "Using " + all_headers.page_title.title;
</script>

<MetaTags
	{title}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	{description}
/>

<svelte:window bind:scrollY={y} />

<main class="container mx-auto px-4 flex gap-4">
	<div class="flex w-full">
		<DocsNav
			current_nav_link={name}
			library_pages={pages}
			show_dropdown={false}
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

			<div class="flex justify-between mt-4 lg:ml-10">
				{#if prev_obj}
					<a
						href="./{prev_obj.name}"
						class="lg:ml-10 text-left px-4 py-1 bg-gray-50 rounded-full hover:underline"
					>
						<div class="text-lg">
							<span class="text-orange-500">&#8592;</span>
							{prev_obj.pretty_name}
						</div>
					</a>
				{:else}
					<div />
				{/if}
				{#if next_obj}
					<a
						href="./{next_obj.name}"
						class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline"
					>
						<div class="text-lg">
							{next_obj.pretty_name}
							<span class="text-orange-500">&#8594;</span>
						</div>
					</a>
				{:else}
					<div />
				{/if}
			</div>

			<div class="flex flex-row">
				<div class="lg:ml-10">
					<div class="obj">
						<svelte:component this={module} bind:this={dynamic_component} />
					</div>
				</div>
			</div>

			<div class="flex justify-between mt-4 lg:ml-10">
				{#if prev_obj}
					<a
						href="./{prev_obj.name}"
						class="lg:ml-10 text-left px-4 py-1 bg-gray-50 rounded-full hover:underline"
					>
						<div class="text-lg">
							<span class="text-orange-500">&#8592;</span>
							{prev_obj.pretty_name}
						</div>
					</a>
				{:else}
					<div />
				{/if}
				{#if next_obj}
					<a
						href="./{next_obj.name}"
						class="text-right px-4 py-1 bg-gray-50 rounded-full hover:underline"
					>
						<div class="text-lg">
							{next_obj.pretty_name}
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
					href="#{all_headers.page_title.id}">{all_headers.page_title.title}</a
				>
				{#if all_headers.headers && all_headers.headers.length > 0}
					<ul class="text-slate-700 text-lg leading-6 list-none">
						{#each all_headers.headers as header}
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
			</div>
		</div>
	</div>
</main>

<style>
	.sub-link {
		border-color: #f3f4f6 !important;
	}
</style>
