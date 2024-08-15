<script lang="ts">
	// @ts-nocheck
	import space_logo from "$lib/assets/img/spaces-logo.svg";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import DropDown from "$lib/components/VersionDropdown.svelte";
	import { tick } from "svelte";
	import FancyDetails from "$lib/components/Details.svelte";
	import { onNavigate } from "$app/navigation";
	import { clickOutside } from "$lib/components/clickOutside.js";

	export let data: {
		guide: any;
		guide_slug: {
			text: string;
			href: string;
		}[];
		guide_names: {
			category: string;
			guides: {
				name: string;
				pretty_name: string;
				url: string;
			}[];
		}[];
	};
	let guide_page = data.guide;
	let guide_names = data.guide_names;
	let guide_slug = data.guide_slug;

	const COLORS = [
		"bg-green-50",
		"bg-yellow-50",
		"bg-red-50",
		"bg-pink-50",
		"bg-purple-50"
	];

	let show_all = false;

	let sidebar: HTMLElement;
	let target_link: HTMLElement;
	let navigation;
	let y: number;

	let flattened_guides = guide_names.map((category) => category.guides).flat();
	let prev_guide: any;
	let next_guide: any;
	let content_el: HTMLDivElement;

	$: if (sidebar) {
		if (
			target_link?.previousElementSibling?.classList.contains("category-link")
		) {
			target_link = target_link.previousElementSibling as HTMLElement;
		}
		sidebar.scrollTop = target_link?.offsetTop;
	}
	$: guide_page = data.guide;
	$: guide_slug = data.guide_slug;
	$: flattened_guides = guide_names.map((category) => category.guides).flat();
	$: prev_guide =
		flattened_guides[
			flattened_guides.findIndex((guide) => guide.url === guide_page.url) - 1
		];
	$: next_guide =
		flattened_guides[
			flattened_guides.findIndex((guide) => guide.url === guide_page.url) + 1
		];
	$: guide_names = data.guide_names;

	let _details: (FancyDetails | void)[] = [];

	async function make_details() {
		_details.forEach((c) => c?.$destroy());
		await tick();
		const details = document.querySelectorAll("details");
		if (details.length === 0) return;

		_details = Array.from(details).map((detail) => {
			const summary_text = detail.querySelector("summary")?.innerHTML;
			const detail_children = detail.querySelectorAll(
				"details > *:not(summary)"
			);

			let detail_text = "";
			detail_children.forEach((child, i) => {
				detail_text += `<p>${child.innerHTML}</p>`;
			});

			if (!summary_text || !detail_text) return;

			const new_el = document.createElement("div");
			const comp = new FancyDetails({
				target: new_el,
				props: {
					summary: summary_text,
					content: detail_text
				}
			});
			detail.replaceWith(new_el);

			return comp;
		});
	}

	$: content_el && data.guide.new_html && make_details();

	let show_nav = false;

	onNavigate(() => {
		show_nav = false;
	});

	$: show_nav;

	function get_category(name: string) {
		if (guide_names) {
			for (let category of guide_names) {
				for (let guide of category.guides) {
					if (guide.name === name) {
						return [category.category, guide.pretty_name];
					}
				}
			}
		}
	}

	let category_and_name: any[] | undefined = get_category(guide_page.name);

	$: category_and_name = get_category(guide_page.name);
</script>

<MetaTags
	title={guide_page.pretty_name}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="A Step-by-Step Gradio Tutorial"
/>
<div class="container mx-auto px-4 flex relative w-full">
	<!-- Mobile menu -->

	<div
		class:hidden={!show_nav}
		class="fixed inset-0 bg-black/20 backdrop-blur-md lg:hidden z-50"
	>
		<div
			use:clickOutside
			on:click_outside={() => (show_nav = false)}
			class:hidden={!show_nav}
			class="max-w-max min-w-[75%] navigation mobile-nav shadow overflow-y-auto fixed backdrop-blur-lg z-50 bg-white pr-6 pl-4 py-4 -ml-4 h-full inset-0 lg:inset-auto lg:shadow-none lg:ml-0 lg:z-0 lg:backdrop-blur-none lg:navigation lg:p-0 lg:pb-4 lg:h-screen lg:leading-relaxed lg:sticky lg:top-0 lg:text-md lg:block lg:rounded-t-xl lg:bg-gradient-to-r lg:from-white lg:to-gray-50 lg:overflow-x-clip lg:w-2/12 lg:min-w-0"
			id="mobile-nav"
		>
			<button
				on:click={() => (show_nav = false)}
				type="button"
				class="absolute z-10 top-4 right-4 w-2/12 h-4 flex items-center justify-center text-grey-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 p-4 lg:hidden"
				tabindex="0"
				data-svelte-h="svelte-1askwj0"
			>
				<svg viewBox="0 0 10 10" class="overflow-visible" style="width: 10px"
					><path
						d="M0 0L10 10M10 0L0 10"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					></path></svg
				>
			</button>

			{#each guide_names as { category, guides } (category)}
				<p class="font-semibold px-4 my-2 block">{category}</p>
				{#each guides as guide, i}
					<a
						class:current-nav-link={guide.name == guide_page.name}
						class="thin-link px-4 block leading-8"
						href="..{guide.url}">{guide.pretty_name}</a
					>
				{/each}
			{/each}
		</div>
	</div>

	<div
		bind:this={sidebar}
		class="side-navigation h-screen leading-relaxed sticky top-0 text-md overflow-y-auto overflow-x-hidden hidden lg:block rounded-t-xl bg-gradient-to-r from-white to-gray-50 lg:w-3/12"
	>
		<div class="sticky top-0 pr-2 float-right">
			<DropDown></DropDown>
		</div>
		{#each guide_names as guides, i}
			<div
				class="category-link my-2 font-semibold px-4 pt-2 text-ellipsis block"
				style="max-width: 12rem"
			>
				{guides.category}
				{#if !show_all && i === guide_names.length - 1 && guides.category !== guide_page.category}
					<button
						class:hidden={show_all}
						class="block show-guides"
						on:click={() => (show_all = true)}
					>
						[ show ]
					</button>
				{/if}
			</div>
			{#each guides.guides as guide, j}
				{#if guide.name == guide_page.name}
					<a
						bind:this={target_link}
						class:hidden={!show_all &&
							i === guide_names.length - 1 &&
							guides.category !== guide_page.category}
						class:current-nav-link={guide.name == guide_page.name}
						class="guide-link -indent-2 ml-2 thin-link px-4 block overflow-hidden"
						style="max-width: 12rem"
						href="..{guide.url}">{guide.pretty_name}</a
					>

					{#if guide_slug.length > 0}
						<div
							class="navigation max-w-full bg-gradient-to-r from-orange-50 to-orange-100 p-2 mx-2 border-l-2 border-orange-500 mb-2"
						>
							{#each guide_slug as heading}
								<a
									class="subheading block thin-link -indent-2 ml-4 mr-2"
									href={heading.href}>{heading.text}</a
								>
							{/each}
						</div>
					{/if}
				{:else}
					<a
						class:hidden={!show_all &&
							i === guide_names.length - 1 &&
							guides.category !== guide_page.category}
						class:current-nav-link={guide.name == guide_page.name}
						class="guide-link -indent-2 ml-2 thin-link px-4 block overflow-hidden"
						style="max-width: 12rem"
						href="..{guide.url}">{guide.pretty_name}</a
					>
				{/if}
			{/each}
		{/each}
	</div>
	<div class="w-full lg:w-8/12 mx-auto">
		<div
			class="flex items-center p-4 border-b border-t border-slate-900/10 lg:hidden dark:border-slate-50/[0.06]"
		>
			<button
				on:click={() => (show_nav = !show_nav)}
				type="button"
				class="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
			>
				<svg width="24" height="24"
					><path
						d="M5 6h14M5 12h14M5 18h14"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					></path></svg
				>
			</button>
			{#if category_and_name}
				<ol class="ml-4 flex text-sm leading-6 whitespace-nowrap min-w-0">
					<li class="flex items-center">
						{category_and_name[0]}
						<svg
							width="3"
							height="6"
							aria-hidden="true"
							class="mx-3 overflow-visible text-slate-400"
							><path
								d="M0 0L3 3L0 6"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							></path></svg
						>
					</li>
					<li class="font-semibold text-slate-900 truncate dark:text-slate-200">
						{category_and_name[1]}
					</li>
				</ol>
			{/if}
		</div>
		<div class="w-full flex flex-wrap justify-between my-4">
			{#if prev_guide}
				<a
					href="..{prev_guide.url}"
					class="lg:ml-10 text-left px-4 py-1 bg-gray-50 rounded-full hover:underline max-w-[48%]"
				>
					<div class="flex text-lg">
						<span class="text-orange-500 mr-1">&#8592;</span>
						<p class="whitespace-nowrap overflow-hidden text-ellipsis">
							{prev_guide.pretty_name}
						</p>
					</div>
				</a>
			{:else}
				<div />
			{/if}
			{#if next_guide}
				<a
					href="..{next_guide.url}"
					class="text-right px-4 py-1 bg-gray-50 rounded-full max-w-1/2 hover:underline max-w-[48%]"
				>
					<div class="flex text-lg">
						<p class="whitespace-nowrap overflow-hidden text-ellipsis">
							{next_guide.pretty_name}
						</p>
						<span class="text-orange-500 ml-1">&#8594;</span>
					</div>
				</a>
			{:else}
				<div />
			{/if}
		</div>

		{#if guide_page.spaces.length}
			<div id="spaces-holder" class="mb-4">
				<a href="https://hf.co/spaces" target="_blank">
					<img
						class="inline-block my-0 mx-auto w-5 max-w-full pb-1"
						src={space_logo}
					/>
				</a>
				<p class="m-0 inline text-lg font-normal">Related Spaces:</p>
				{#each guide_page.spaces as space, i}
					<div
						class="space-link inline-block m-1 px-1 rounded-md {COLORS[i] ??
							COLORS[i - COLORS.length]}"
					>
						<a href={space} target="_blank" class="no-underline"
							>{space.slice(30)}</a
						>
					</div>
				{/each}
			</div>
		{/if}
		<div class="prose text-lg max-w-full" bind:this={content_el}>
			{@html guide_page.new_html}
		</div>
		<div class="w-full flex flex-wrap justify-between my-4">
			{#if prev_guide}
				<a
					href="..{prev_guide.url}"
					class="lg:ml-10 text-left px-4 py-1 bg-gray-50 rounded-full hover:underline max-w-[48%]"
				>
					<div class="flex text-lg">
						<span class="text-orange-500 mr-1">&#8592;</span>
						<p class="whitespace-nowrap overflow-hidden text-ellipsis">
							{prev_guide.pretty_name}
						</p>
					</div>
				</a>
			{:else}
				<div />
			{/if}
			{#if next_guide}
				<a
					href="..{next_guide.url}"
					class="text-right px-4 py-1 bg-gray-50 rounded-full max-w-1/2 hover:underline max-w-[48%]"
				>
					<div class="flex text-lg">
						<p class="whitespace-nowrap overflow-hidden text-ellipsis">
							{next_guide.pretty_name}
						</p>
						<span class="text-orange-500 ml-1">&#8594;</span>
					</div>
				</a>
			{:else}
				<div />
			{/if}
		</div>
	</div>
</div>

<svelte:window bind:scrollY={y} />
