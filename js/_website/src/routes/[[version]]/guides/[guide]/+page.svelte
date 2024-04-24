<script lang="ts">
	import space_logo from "$lib/assets/img/spaces-logo.svg";
	import MetaTags from "$lib/components/MetaTags.svelte";
	import { page } from "$app/stores";
	import DropDown from "$lib/components/VersionDropdown.svelte";
	import { tick } from "svelte";
	import FancyDetails from "$lib/components/Details.svelte";

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
</script>

<MetaTags
	title={guide_page.pretty_name}
	url={$page.url.pathname}
	canonical={$page.url.pathname}
	description="A Step-by-Step Gradio Tutorial"
/>
<div class="container mx-auto px-4 flex relative w-full">
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
		<div class="w-full flex justify-between my-4">
			{#if prev_guide}
				<a
					href="..{prev_guide.url}"
					class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline max-w-[48%]"
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
		<div class="w-full flex justify-between my-4">
			{#if prev_guide}
				<a
					href="..{prev_guide.url}"
					class="text-left px-4 py-1 bg-gray-50 rounded-full hover:underline max-w-[48%]"
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
